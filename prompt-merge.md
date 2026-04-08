# Prompt Merge — Copilot Chat (Claude 3.7 Sonnet)

> Use este prompt APÓS ter rodado os 4 prompts de step e coletado as linhas de tabela.
> Substitua cada bloco [LINHAS STEP X] pelo resultado que o Copilot retornou para aquele step.
> NÃO cole os batches aqui — apenas as linhas de tabela já geradas.

---

Você vai montar o arquivo INDEX.md final de uma documentação de migração Angular → React.

Você receberá 4 conjuntos de linhas de tabela markdown (uma por pasta de step).
Cada conjunto foi gerado separadamente — sua tarefa é unir tudo em um INDEX.md coerente.

**Tarefas:**

1. **Montar o INDEX.md** com as 4 seções de tabela
2. **Identificar e corrigir** linhas com triggers vagos ou duplicados entre arquivos
3. **Gerar o Mapa de Dependências** com base nos triggers de todos os arquivos
4. **Gerar o bloco de Instruções de Uso** explicando como usar o INDEX no Copilot

---

## LINHAS STEP 1 — Configuração Inicial

Cole aqui as linhas retornadas pelo Copilot no Prompt Step 1
(apenas as linhas de tabela, sem cabeçalho)

---

## LINHAS STEP 2 — Transpilação Angular → React

Cole aqui as linhas retornadas pelo Copilot no Prompt Step 2
(apenas as linhas de tabela, sem cabeçalho)

---

## LINHAS STEP 3 — Design System

Cole aqui as linhas retornadas pelo Copilot no Prompt Step 3
(apenas as linhas de tabela, sem cabeçalho)

---

## LINHAS STEP 4 — Qualidade e Testes

Cole aqui as linhas retornadas pelo Copilot no Prompt Step 4
(apenas as linhas de tabela, sem cabeçalho)

---

**Formato de saída esperado — retorne o arquivo INDEX.md completo:**

```markdown
# 📚 INDEX — Migração Angular → React

> Consulte este arquivo antes de qualquer tarefa de migração.
> No Copilot, carregue no máximo 3 arquivos por vez com `#file:`.

---

## Como usar

[Gere 3 a 5 linhas explicando como o desenvolvedor deve usar este INDEX
no fluxo diário de migração com Copilot. Seja direto e prático.]

---

## ⚙️ Step 1 — Configuração Inicial

| Arquivo | Título | O que contém | Triggers — Quando usar |
|---|---|---|---|
[linhas do step 1]

---

## 🔄 Step 2 — Transpilação Angular → React

| Arquivo | Título | O que contém | Triggers — Quando usar |
|---|---|---|---|
[linhas do step 2]

---

## 🎨 Step 3 — Design System

| Arquivo | Título | O que contém | Triggers — Quando usar |
|---|---|---|---|
[linhas do step 3]

---

## ✅ Step 4 — Qualidade e Testes

| Arquivo | Título | O que contém | Triggers — Quando usar |
|---|---|---|---|
[linhas do step 4]

---

## 🗺️ Mapa de Dependências

[Gere um bloco de código com a sequência recomendada de arquivos para
cada um destes cenários, baseado nos triggers das tabelas acima:
  1. Migrar 1 componente Angular → React (do zero)
  2. Migrar componente que usa RxJS / Observables
  3. Migrar componente que usa o Design System
  4. Migrar formulário com validação
  5. Integrar API ou SDK de outro time
  6. Configurar o projeto do zero
  7. Escrever testes para componente migrado
Formato por cenário: lista numerada com caminho do arquivo + motivo em uma linha]

---

## ⚠️ Gaps identificados

[Liste arquivos com triggers ainda vagos ou cenários de migração
que não estão cobertos por nenhum arquivo da documentação]
```

**Regras de qualidade antes de retornar:**
- Se dois arquivos tiverem triggers praticamente idênticos, diferencie-os ou adicione uma nota
- Triggers devem ser acionáveis: o desenvolvedor lê e sabe EXATAMENTE quando usar
- O Mapa de Dependências deve listar caminhos reais dos arquivos (os que aparecem nas tabelas)
- Não invente arquivos que não estejam nas linhas recebidas

---
