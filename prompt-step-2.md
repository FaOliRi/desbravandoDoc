# Prompt Step 2 — Copilot Chat (Claude 3.7 Sonnet)

> Cole este prompt inteiro no Copilot Chat.  
> Substitua o bloco \[BATCH\] pelo conteúdo do arquivo `docs/_batches/batch-step-2.txt`

---

Você é um engenheiro sênior analisando documentação de migração Angular → React.

Abaixo estão os conteúdos extraídos de arquivos da pasta **Step 2 — Transpilação Angular → React**.  
O conteúdo foi pré-processado a partir de formatos variados (markdown, HTML, TSX, MDX, TS, JSON)  
e convertido para texto puro. Pode estar sem estrutura clara — isso é esperado.

O Step 2 cobre: equivalências de sintaxe, migração de componentes, RxJS → hooks,  
HTTP client, formulários, bibliotecas, SDKs e integrações.

**Sua tarefa:**  
Para CADA bloco `--- ARQUIVO X/Y ---` abaixo, gere exatamente UMA linha de tabela markdown.

**Colunas obrigatórias:**

| Arquivo | Título | O que contém | Triggers — Quando usar |
| --- | --- | --- | --- |

**Regras por coluna:**

-   **Arquivo**: copie exatamente o valor do campo `Caminho:` do bloco
-   **Título**: 4 a 7 palavras descrevendo o tema central
-   **O que contém**: 10 a 15 palavras descrevendo o conteúdo principal do arquivo
-   **Triggers**: 2 a 4 situações concretas de quando consultar esse arquivo durante a migração.  
    Use frases curtas separadas por `|`.  
    Foque em: qual tarefa de migração exige esse arquivo? Qual tecnologia Angular está sendo substituída?  
    Exemplos de bom trigger: `Migrar *ngFor e *ngIf | Converter template Angular para JSX`  
    Exemplos de trigger ruim: `Referência técnica | Quando precisar de ajuda`

**Se o conteúdo estiver vazio ou ilegível**, escreva nos Triggers: `⚠️ ILEGÍVEL — verificar manualmente`

**Retorne APENAS as linhas da tabela** — sem cabeçalho, sem numeração, sem explicação.  
Uma linha por arquivo. Nada mais.

---

\[BATCH\]

Cole aqui o conteúdo completo do arquivo:  
docs/\_batches/batch-step-2.txt

---