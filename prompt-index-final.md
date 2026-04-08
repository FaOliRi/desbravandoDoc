# Prompt Index Final — Copilot Chat (Claude 3.7 Sonnet)

> Use este prompt como REVISÃO FINAL depois que o INDEX.md já estiver montado.
> Referencie o arquivo com #file: — não cole o conteúdo manualmente.
> Este prompt consome pouco contexto pois o Copilot só lê um arquivo.

---

Consulte #file:docs/INDEX.md

Faça uma revisão de qualidade completa do INDEX e retorne:

**1. Diagnóstico de triggers**
Liste arquivos cujos triggers estão vagos, genéricos ou pouco acionáveis.
Para cada um, sugira um trigger melhor.
Formato:
  - `caminho/arquivo` | trigger atual → trigger sugerido

**2. Cobertura de cenários**
Verifique se os seguintes cenários de migração estão cobertos pelos triggers:
  - Migrar componente simples (sem RxJS, sem DS)
  - Migrar componente com Observables/RxJS
  - Migrar componente do Design System Angular para React
  - Migrar formulário reativo (ReactiveFormsModule)
  - Migrar rota com guard (CanActivate)
  - Integrar SDK externo
  - Integrar API de outro time
  - Escrever teste unitário
  - Configurar CI/CD
  - Setup inicial do projeto

Para cada cenário, indique:
  ✅ Coberto por: [lista de arquivos]
  ⚠️ Parcialmente coberto: [arquivo mais próximo] — falta: [o que está faltando]
  ❌ Sem cobertura — sugestão: [criar doc sobre X ou adaptar arquivo Y]

**3. Mapa de dependências — validação**
Se o INDEX já tiver um Mapa de Dependências, verifique se os caminhos de arquivo
referenciados existem nas tabelas do INDEX. Liste qualquer caminho que não bata.

**4. Resumo executivo**
3 a 5 linhas: o INDEX está pronto para uso? O que ainda precisa de atenção antes
de começar a migração?

---
