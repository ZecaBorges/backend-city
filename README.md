# Backend City

Atlas 3D de sistemas em produção e currículo online de José Emanuel Borges.

## Desenvolvimento

```bash
npm install
npm run dev
```

Abra `http://localhost:4321`.

## Verificação

```bash
npm test
npm run check
npm run build
npm run test:e2e
```

## Arquitetura

- Astro gera o currículo textual estático, sem depender de WebGL.
- React Three Fiber renderiza o atlas principal em tela cheia.
- O visitante pode escolher tour guiado, exploração livre ou currículo textual.
- `src/data/resume.ts` contém as evidências profissionais.
- `src/game/world.ts` define landmarks, câmera, colisores e a Zona AI R&D.
- `src/game/tour.ts` define a narrativa guiada de 90 segundos.
- Prédios são sólidos por colisão círculo/AABB, sem engine física.

## Contato

- WhatsApp: +55 87 98827-1297
- E-mail: szeca00@gmail.com
- LinkedIn: https://www.linkedin.com/in/jose-emanuel-borges-1711771b6

## Deploy

1. Crie o repositório `backend-city` no GitHub.
2. Empurre o código para o branch `main`.
3. O workflow `.github/workflows/deploy.yml` gera o site estático e publica no GitHub Pages.
4. O endereço final fica em `https://<seu-usuario>.github.io/backend-city/`.
