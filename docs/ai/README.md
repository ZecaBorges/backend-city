# Backend City — AI Documentation

Guia completo para IA assistants trabalharem neste projeto.

## Visão Geral

Backend City é um currículo online interativo com um campus 3D WebGL como experiência principal. O visitante pode fazer um tour guiado, explorar livremente ou ler o currículo textual.

## Stack

| Camada | Tecnologia |
|--------|------------|
| Framework | Astro 7.x (static output) |
| UI Framework | React 19 |
| 3D Engine | Three.js 0.185 + React Three Fiber 9.x |
| Linguagem | TypeScript 5.9 (strict) |
| Testes | Vitest + Playwright |
| Deploy | GitHub Pages via GitHub Actions |

## Documentação

- [Arquitetura](./ARCHITECTURE.md) — Estrutura do projeto, fluxo de dados, componentes 3D
- [Convenções](./CONVENTIONS.md) — Padrões de código, nomenclatura, regras de negócio
- [Arquivos](./FILES.md) — Mapa de todos os arquivos importantes

## Comandos Essenciais

```bash
npm install          # Instalar dependências
npm run dev          # Servidor local em http://localhost:4321
npm run build        # Build estático (astro check + astro build)
npm test             # Unit tests (Vitest)
npm run test:e2e     # E2E tests (Playwright)
npm run check        # Type checking (astro check)
```

## Regras Críticas para IA

1. **Nunca assuma que WebGL está disponível** — O currículo textual é independente do canvas 3D.
2. **Dados em `src/data/resume.ts`** — Toda informação profissional vem de lá. Nunca hardcode.
3. **Colisão é círculo/AABB** — Não usar engine de física. Seguir padrão existente em `movement.ts`.
4. **Tour tem 90 segundos** — Qualquer parada nova precisa caber nesse tempo.
5. **AI R&D ZONE é `blueprint`** — Nunca afirmar experiência comprovada em IA.
6. **WhatsApp é contato primário** — Links devem usar `wa.me/5587988271297`.
7. **Senioridade Cassems** — Apenas Cassems usa "Engenheiro de Software Sênior".
8. **Build warnings** — Chunk >500KB é esperado por causa do Three.js. Não tentar resolver.
