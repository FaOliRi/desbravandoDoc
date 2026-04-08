#!/usr/bin/env python3
"""
generate-batches.py

PROBLEMA QUE RESOLVE:
  Documentações sem padrão, mistura de .md, .html, .mdx, Storybook,
  JSX/TSX com componentes de doc, sem seções "quando usar" explícitas.
  São muitos arquivos para jogar direto no Copilot de uma vez.

SOLUÇÃO — Pipeline em 2 fases:

  FASE 1 (este script, roda local, sem limite):
    → Lê todos os formatos
    → Extrai texto puro de cada arquivo (strip HTML, JSX, frontmatter...)
    → Comprime para ~250 palavras por arquivo
    → Gera 1 arquivo de batch por pasta de step (4 no total)
    → Gera os prompts prontos para o Copilot

  FASE 2 (você faz, 4x no Copilot):
    → Abre cada batch no Copilot Chat
    → Cola o prompt correspondente
    → Copilot infere título + descrição + triggers de cada arquivo
    → Retorna as linhas do INDEX

Uso:
  python docs/generate-batches.py

Saída em docs/_batches/:
  batch-step-1.txt   ← cola no Copilot junto com o prompt-step-1.txt
  batch-step-2.txt
  batch-step-3.txt
  batch-step-4.txt
  prompt-step-1.txt  ← prompt pronto para copiar no Copilot Chat
  prompt-step-2.txt
  prompt-step-3.txt
  prompt-step-4.txt
  merge-instructions.txt  ← como juntar os 4 resultados no INDEX.md final
"""

import os
import re
import json
import textwrap
from pathlib import Path
from datetime import datetime

# ─── Configuração ─────────────────────────────────────────────────────────────

# Pastas de steps — o script tenta variações automáticas de nome
# Edite aqui se suas pastas tiverem nomes diferentes
STEP_ORDER = [
    ("step-1", "⚙️ Step 1 — Configuração Inicial"),
    ("step-2", "🔄 Step 2 — Transpilação Angular → React"),
    ("step-3", "🎨 Step 3 — Design System"),
    ("step-4", "✅ Step 4 — Qualidade e Testes"),
]

# Extensões que serão processadas
SUPPORTED_EXTENSIONS = {
    ".md", ".mdx",                         # Markdown e MDX
    ".html", ".htm",                       # HTML
    ".tsx", ".ts", ".jsx", ".js",          # Storybook, JSDoc, componentes de doc
    ".vue",                                # Vue docs
    ".txt",                                # Texto puro
    ".json",                               # JSON de configuração/doc
}

# Extensões para ignorar mesmo que estejam na pasta
IGNORE_EXTENSIONS = {
    ".png", ".jpg", ".jpeg", ".gif", ".svg", ".ico", ".webp",
    ".woff", ".woff2", ".ttf", ".eot",
    ".zip", ".tar", ".gz",
    ".map", ".lock",
    ".DS_Store",
}

# Nomes de arquivo para ignorar
IGNORE_FILENAMES = {
    "index.md", "readme.md", "changelog.md", "license.md",
    "package.json", "package-lock.json", "tsconfig.json",
    ".gitignore", ".eslintrc", ".prettierrc",
}

# Palavras máximas extraídas por arquivo (mais que isso = ruído)
MAX_WORDS_PER_FILE = 250

# Tamanho máximo de arquivo para processar (evita arquivos binários mascarados)
MAX_FILE_SIZE_KB = 500


# ─── Extratores de texto por formato ──────────────────────────────────────────

def strip_html_tags(text: str) -> str:
    """Remove tags HTML, mantém só o texto."""
    # Remove scripts e styles completos
    text = re.sub(r"<script[^>]*>.*?</script>", " ", text, flags=re.DOTALL | re.IGNORECASE)
    text = re.sub(r"<style[^>]*>.*?</style>", " ", text, flags=re.DOTALL | re.IGNORECASE)
    # Remove comentários HTML
    text = re.sub(r"<!--.*?-->", " ", text, flags=re.DOTALL)
    # Remove todas as tags restantes
    text = re.sub(r"<[^>]+>", " ", text)
    # Decodifica entidades comuns
    text = text.replace("&nbsp;", " ").replace("&amp;", "&")
    text = text.replace("&lt;", "<").replace("&gt;", ">")
    text = text.replace("&quot;", '"').replace("&#39;", "'")
    return text


def strip_jsx_tsx(text: str) -> str:
    """
    Extrai texto legível de arquivos TSX/JSX/MDX que contêm componentes de documentação.
    Foco em: strings de texto, comentários JSDoc, props de string, conteúdo de return.
    """
    extracted = []

    # 1. Extrai comentários JSDoc /** ... */
    jsdoc = re.findall(r"/\*\*\s*(.*?)\s*\*/", text, re.DOTALL)
    for doc in jsdoc:
        cleaned = re.sub(r"\s*\*\s*", " ", doc).strip()
        if len(cleaned) > 20:
            extracted.append(cleaned)

    # 2. Extrai comentários de linha //
    line_comments = re.findall(r"//\s*(.+)", text)
    for c in line_comments:
        c = c.strip()
        if len(c) > 15 and not c.startswith("eslint") and not c.startswith("TODO"):
            extracted.append(c)

    # 3. Extrai strings longas (prováveis textos de UI ou doc)
    strings = re.findall(r'["\`]([^"\`\n]{30,})["\`]', text)
    for s in strings:
        s = s.strip()
        # Filtra strings que parecem paths ou imports
        if not re.match(r'^[@./~]', s) and not s.endswith('.ts') and not s.endswith('.tsx'):
            extracted.append(s)

    # 4. Extrai conteúdo de atributos description, title, summary, label, story, name
    attrs = re.findall(
        r'(?:description|title|summary|label|story|name|text|content)\s*[:=]\s*["\`]([^"\`\n]{10,})["\`]',
        text, re.IGNORECASE
    )
    extracted.extend(attrs)

    # 5. Extrai texto JSX puro (entre tags, sem ser atributo)
    jsx_text = re.findall(r">([^<>{}\n]{20,})<", text)
    extracted.extend([t.strip() for t in jsx_text if t.strip()])

    # 6. Frontmatter YAML (MDX e alguns MD)
    frontmatter = re.match(r"^---\s*(.*?)\s*---", text, re.DOTALL)
    if frontmatter:
        fm_text = frontmatter.group(1)
        # Extrai valores de campos como title, description, summary
        fm_values = re.findall(r"(?:title|description|summary|tags?):\s*(.+)", fm_text)
        extracted = [v.strip().strip('"\'') for v in fm_values] + extracted

    return " | ".join(extracted)


def strip_markdown(text: str) -> str:
    """Remove sintaxe markdown, mantém texto legível."""
    # Remove blocos de código
    text = re.sub(r"```[\s\S]*?```", " [código] ", text)
    text = re.sub(r"`[^`]+`", " ", text)
    # Remove imagens
    text = re.sub(r"!\[.*?\]\(.*?\)", " ", text)
    # Remove links mas mantém o texto do link
    text = re.sub(r"\[([^\]]+)\]\([^\)]+\)", r"\1", text)
    # Remove headings mas mantém o texto
    text = re.sub(r"^#{1,6}\s+", "", text, flags=re.MULTILINE)
    # Remove ênfase
    text = re.sub(r"\*\*([^*]+)\*\*", r"\1", text)
    text = re.sub(r"\*([^*]+)\*", r"\1", text)
    text = re.sub(r"__([^_]+)__", r"\1", text)
    # Remove frontmatter
    text = re.sub(r"^---[\s\S]*?---\n", "", text)
    # Remove tabelas (linhas com |)
    text = re.sub(r"^\|.*\|$", " ", text, flags=re.MULTILINE)
    # Remove linhas horizontais
    text = re.sub(r"^[-*_]{3,}$", "", text, flags=re.MULTILINE)
    # Remove bullets
    text = re.sub(r"^\s*[-*+]\s+", "", text, flags=re.MULTILINE)
    # Remove numeração
    text = re.sub(r"^\s*\d+\.\s+", "", text, flags=re.MULTILINE)
    return text


def extract_json_doc(text: str) -> str:
    """Extrai campos de texto legível de JSON."""
    try:
        data = json.loads(text)
        texts = []
        def walk(obj, depth=0):
            if depth > 4:
                return
            if isinstance(obj, str) and len(obj) > 15:
                texts.append(obj)
            elif isinstance(obj, dict):
                for k, v in obj.items():
                    if k.lower() in ("description", "title", "summary", "name", "label", "text", "content"):
                        if isinstance(v, str) and len(v) > 5:
                            texts.append(v)
                    walk(v, depth + 1)
            elif isinstance(obj, list):
                for item in obj[:5]:  # limita para não explodir
                    walk(item, depth + 1)
        walk(data)
        return " | ".join(texts[:20])
    except Exception:
        return ""


def extract_text(filepath: Path) -> str:
    """Detecta o formato e extrai texto puro do arquivo."""
    ext = filepath.suffix.lower()

    try:
        # Verifica tamanho antes de ler
        size_kb = filepath.stat().st_size / 1024
        if size_kb > MAX_FILE_SIZE_KB:
            return f"[Arquivo muito grande: {round(size_kb)}KB — resumo não gerado]"

        raw = filepath.read_text(encoding="utf-8", errors="replace")

    except Exception as e:
        return f"[Erro ao ler arquivo: {e}]"

    if ext in (".tsx", ".jsx"):
        text = strip_jsx_tsx(raw)
        # Se extraiu pouco, tenta como markdown (MDX patterns)
        if len(text.split()) < 20:
            text = strip_markdown(raw)
    elif ext in (".ts", ".js"):
        text = strip_jsx_tsx(raw)
    elif ext == ".mdx":
        # MDX: primeiro processa como JSX, depois como markdown
        jsx_part = strip_jsx_tsx(raw)
        md_part = strip_markdown(raw)
        text = jsx_part + " " + md_part
    elif ext in (".html", ".htm"):
        text = strip_html_tags(raw)
    elif ext == ".json":
        text = extract_json_doc(raw)
    elif ext in (".md", ".txt"):
        text = strip_markdown(raw)
    elif ext == ".vue":
        # Vue SFC: extrai template + comentários
        template = re.search(r"<template[^>]*>(.*?)</template>", raw, re.DOTALL)
        template_text = strip_html_tags(template.group(1)) if template else ""
        script = re.search(r"<script[^>]*>(.*?)</script>", raw, re.DOTALL)
        script_text = strip_jsx_tsx(script.group(1)) if script else ""
        text = template_text + " " + script_text
    else:
        text = raw

    # Normaliza espaços
    text = re.sub(r"\s+", " ", text).strip()

    # Limita ao máximo de palavras configurado
    words = text.split()
    if len(words) > MAX_WORDS_PER_FILE:
        text = " ".join(words[:MAX_WORDS_PER_FILE]) + "…"

    return text


# ─── Varredura de pastas ───────────────────────────────────────────────────────

def find_step_folder(docs_root: Path, step_key: str) -> Path | None:
    """Tenta variações do nome da pasta."""
    candidates = [
        docs_root / step_key,
        docs_root / step_key.replace("-", " "),
        docs_root / step_key.replace("-", "_"),
        docs_root / step_key.replace("-", ""),
        docs_root / step_key.replace("-", " ").title(),
        docs_root / step_key.title(),
    ]
    for c in candidates:
        if c.exists() and c.is_dir():
            return c
    return None


def collect_files(step_folder: Path) -> list[Path]:
    """Coleta todos os arquivos suportados na pasta (recursivo)."""
    files = []
    for f in sorted(step_folder.rglob("*")):
        if not f.is_file():
            continue
        if f.suffix.lower() in IGNORE_EXTENSIONS:
            continue
        if f.name.lower() in IGNORE_FILENAMES:
            continue
        if f.suffix.lower() not in SUPPORTED_EXTENSIONS:
            continue
        # Ignora pastas node_modules, .git etc
        parts = f.parts
        if any(p in ("node_modules", ".git", "dist", "build", ".next", "__pycache__") for p in parts):
            continue
        files.append(f)
    return files


# ─── Geração dos batches ──────────────────────────────────────────────────────

def build_batch_content(files: list[Path], step_folder: Path, docs_root: Path) -> str:
    """
    Gera o conteúdo do arquivo de batch para uma pasta.
    Cada arquivo vira um bloco: caminho + texto extraído.
    """
    lines = []
    for i, filepath in enumerate(files, 1):
        rel = filepath.relative_to(docs_root)
        text = extract_text(filepath)
        size_kb = round(filepath.stat().st_size / 1024, 1)

        lines.append(f"--- ARQUIVO {i}/{len(files)} ---")
        lines.append(f"Caminho: {rel}")
        lines.append(f"Extensão: {filepath.suffix.lower()} | Tamanho: {size_kb}KB")
        lines.append(f"Conteúdo extraído:")
        lines.append(text if text else "[vazio ou não foi possível extrair texto]")
        lines.append("")

    return "\n".join(lines)


def build_copilot_prompt(step_title: str, step_key: str, file_count: int, batch_filename: str) -> str:
    """
    Gera o prompt pronto para colar no Copilot junto com o batch.
    """
    return f"""## Prompt para o Copilot — {step_title}
## Cole este prompt no Copilot Chat junto com o arquivo {batch_filename}

---

Você vai analisar {file_count} arquivos de documentação de migração Angular → React.

Abaixo estão os conteúdos extraídos de cada arquivo (formato misto: markdown, HTML,
Storybook, JSX, TSX — o conteúdo foi pré-processado para texto puro).

Para CADA arquivo listado, gere UMA linha de tabela markdown com estas colunas:

| Arquivo | Título | O que contém | Triggers — Quando usar |
|---|---|---|---|

Regras:
- **Arquivo**: use exatamente o caminho indicado no campo "Caminho:" de cada bloco
- **Título**: 4-7 palavras descrevendo o tema central do arquivo
- **O que contém**: 10-15 palavras descrevendo o conteúdo principal
- **Triggers**: 2-4 situações concretas de quando um desenvolvedor deve abrir esse arquivo
  durante a migração Angular→React. Use linguagem imperativa curta.
  Exemplo: "Migrar component com *ngFor | Substituir pipe Angular | Criar lista dinâmica"

Se o conteúdo de um arquivo estiver vazio ou ilegível, marque Triggers como:
  `⚠️ ILEGÍVEL — verificar manualmente`

Retorne APENAS as linhas da tabela (sem cabeçalho, sem explicação).
Cada arquivo = exatamente uma linha.

--- INÍCIO DO BATCH ({step_title}) ---

[Cole aqui o conteúdo do arquivo {batch_filename}]

--- FIM DO BATCH ---
"""


# ─── Instruções de merge ──────────────────────────────────────────────────────

def build_merge_instructions(step_results: list[tuple]) -> str:
    """Gera as instruções de como montar o INDEX.md final."""
    return """# Como montar o INDEX.md final

## Após rodar os 4 prompts no Copilot:

Você terá 4 conjuntos de linhas de tabela (um por step).
Monte o INDEX.md assim:

---

```markdown
# 📚 INDEX — Migração Angular → React

> Consulte este arquivo antes de qualquer tarefa.
> Carregue no máximo 3 arquivos por vez com #file:

---

## ⚙️ Step 1 — Configuração Inicial

| Arquivo | Título | O que contém | Triggers — Quando usar |
|---|---|---|---|
[COLE AQUI as linhas retornadas pelo Copilot para o batch-step-1]

---

## 🔄 Step 2 — Transpilação Angular → React

| Arquivo | Título | O que contém | Triggers — Quando usar |
|---|---|---|---|
[COLE AQUI as linhas retornadas pelo Copilot para o batch-step-2]

---

## 🎨 Step 3 — Design System

| Arquivo | Título | O que contém | Triggers — Quando usar |
|---|---|---|---|
[COLE AQUI as linhas retornadas pelo Copilot para o batch-step-3]

---

## ✅ Step 4 — Qualidade e Testes

| Arquivo | Título | O que contém | Triggers — Quando usar |
|---|---|---|---|
[COLE AQUI as linhas retornadas pelo Copilot para o batch-step-4]

---

## 🗺️ Mapa de Dependências Rápido

[Copilot vai gerar isso no passo final abaixo]
```

---

## Prompt final — Gerar o Mapa de Dependências

Após montar o INDEX com as 4 seções, rode este último prompt:

```
Consulte #file:docs/INDEX.md

Com base nos triggers de todos os arquivos listados, gere um bloco
"## 🗺️ Mapa de Dependências Rápido" mostrando a sequência recomendada
de arquivos para consultar nos seguintes cenários:
  1. Migrar 1 componente Angular → React
  2. Configurar o projeto do zero
  3. Migrar formulário com validação
  4. Integrar API ou SDK externo
  5. Migrar componente do Design System
  6. Escrever testes para componente migrado

Formato: bloco de código com lista numerada por cenário.
```

---

## Prompt de revisão final (opcional)

```
Consulte #file:docs/INDEX.md

Revise o INDEX e:
1. Identifique arquivos com triggers duplicados ou vagos demais
2. Sugira quais arquivos podem ser agrupados por tema
3. Aponte se algum tipo de tarefa de migração não está coberto por nenhum arquivo
```
"""


# ─── Entry point ──────────────────────────────────────────────────────────────

def main():
    # Detecta docs_root
    script_dir = Path(__file__).parent
    candidates = [
        script_dir,                  # script está dentro de docs/
        script_dir.parent / "docs",  # script está na raiz, docs/ ao lado
        Path("docs"),                # execução a partir da raiz
    ]
    docs_root = None
    for c in candidates:
        if c.exists() and c.is_dir():
            # Verifica se tem pelo menos uma pasta de step
            if any((c / f"step-{i}").exists() or
                   any((c / v).exists() for v in [f"step {i}", f"step{i}", f"Step {i}"])
                   for i in range(1, 5)):
                docs_root = c.resolve()
                break
    if not docs_root:
        # Fallback: usa o diretório pai do script como docs_root
        docs_root = script_dir.resolve()

    print(f"📁 docs_root: {docs_root}")

    # Pasta de saída dos batches
    output_dir = docs_root / "_batches"
    output_dir.mkdir(exist_ok=True)
    print(f"📤 Saída: {output_dir}\n")

    step_results = []
    total_files = 0

    for step_key, step_title in STEP_ORDER:
        step_folder = find_step_folder(docs_root, step_key)

        if not step_folder:
            print(f"⚠️  {step_title}: pasta não encontrada (tentou variações de '{step_key}')")
            step_results.append((step_key, step_title, 0, None))
            continue

        files = collect_files(step_folder)
        if not files:
            print(f"⚠️  {step_title}: sem arquivos suportados em {step_folder.name}/")
            step_results.append((step_key, step_title, 0, None))
            continue

        print(f"📂 {step_title}")
        print(f"   Pasta: {step_folder.name}/")
        print(f"   Arquivos encontrados: {len(files)}")

        # Mostra extensões encontradas
        exts = {}
        for f in files:
            e = f.suffix.lower()
            exts[e] = exts.get(e, 0) + 1
        ext_summary = ", ".join(f"{e}({n})" for e, n in sorted(exts.items()))
        print(f"   Formatos: {ext_summary}")

        # Gera o batch
        batch_filename = f"batch-{step_key}.txt"
        batch_content = build_batch_content(files, step_folder, docs_root)
        batch_path = output_dir / batch_filename
        batch_path.write_text(batch_content, encoding="utf-8")

        batch_kb = round(batch_path.stat().st_size / 1024, 1)
        print(f"   ✅ {batch_filename} gerado ({batch_kb} KB, ~{round(batch_kb*250)} tokens estimados)\n")

        # Gera o prompt
        prompt_filename = f"prompt-{step_key}.txt"
        prompt_content = build_copilot_prompt(step_title, step_key, len(files), batch_filename)
        prompt_path = output_dir / prompt_filename
        prompt_path.write_text(prompt_content, encoding="utf-8")

        step_results.append((step_key, step_title, len(files), batch_filename))
        total_files += len(files)

    # Gera as instruções de merge
    merge_path = output_dir / "merge-instructions.md"
    merge_path.write_text(build_merge_instructions(step_results), encoding="utf-8")

    # Resumo final
    print("=" * 60)
    print(f"✅ CONCLUÍDO — {total_files} arquivos processados")
    print(f"\nArquivos gerados em docs/_batches/:")
    for f in sorted(output_dir.iterdir()):
        kb = round(f.stat().st_size / 1024, 1)
        print(f"  {f.name:<30} {kb} KB")

    print(f"""
Como usar:
  1. Abra o Copilot Chat → selecione Claude 3.7 Sonnet
  2. Para cada step:
     a. Abra docs/_batches/prompt-step-X.txt
     b. Cole o prompt no Copilot
     c. Substitua [Cole aqui o conteúdo...] pelo conteúdo de batch-step-X.txt
     d. Envie e cole o resultado no INDEX.md (veja merge-instructions.md)
  3. Siga as instruções em docs/_batches/merge-instructions.md
    """)


if __name__ == "__main__":
    main()
