# Mapa de Arquivos

## Dados e Configuração

| Arquivo | Descrição | Importância |
|---------|-----------|-------------|
| `src/data/resume.ts` | Dados profissionais, experiências, métricas, contato | **CRÍTICO** — Única fonte da verdade |
| `astro.config.mjs` | Config Astro: site, base path, React integration | ALTA |
| `tsconfig.json` | Config TypeScript (strict mode) | MÉDIA |
| `playwright.config.ts` | Config E2E: baseURL, webServer, devices | MÉDIA |
| `vitest.config.ts` | Config unit tests | MÉDIA |
| `package.json` | Dependências e scripts | ALTA |

## Game Logic (src/game/)

| Arquivo | Descrição | O que define |
|---------|-----------|--------------|
| `world.ts` | Mundo 3D | Landmarks, colliders, paths, props, bounds, spawn, fast travel |
| `movement.ts` | Avatar | Movimentação WASD/setas, colisão círculo/AABB, `isPositionWalkable()` |
| `camera.ts` | Câmera | `getCameraTarget()`, `getCameraZoom()` para cada modo |
| `tour.ts` | Tour guiado | 7 paradas, 90s, narração, `getTourStopAt()` |
| `tutorial-state.ts` | Tutorial | Estado persistente do tutorial (localStorage) |

## Componentes 3D (src/components/city/)

| Arquivo | Descrição | Componentes |
|---------|-----------|-------------|
| `CityCanvas.tsx` | Canvas WebGL | Config R3F, Suspense, fallback |
| `CityExperience.tsx` | Controlador | Modos, fast travel, tutorial, exit |
| `CityScene.tsx` | Cena 3D | Environment, Infrastructure, Landmarks, Avatar, Camera |
| `CityTutorial.tsx` | Tutorial | Overlay com instruções |
| `CampusProps.tsx` | Props | `CampusTree`, `CampusBench`, `CampusFountain` |

## Componentes UI (src/components/)

| Arquivo | Descrição |
|---------|-----------|
| `Header.astro` | Navegação superior (Atlas 3D, Cases, Engineering Core, Currículo) |
| `Hero.astro` | Hero section com Canvas 3D e botões de ação |
| `Contact.astro` | Seção de contato (WhatsApp, E-mail, LinkedIn) |
| `ExperienceTimeline.astro` | Timeline de experiências |
| `Skills.astro` | Habilidades técnicas |

## Layout e Páginas

| Arquivo | Descrição |
|---------|-----------|
| `src/layouts/BaseLayout.astro` | Layout base: head, SEO, JSON-LD, fontes |
| `src/pages/index.astro` | Página principal (último arquivo) |
| `src/styles/global.css` | Estilos globais + print media |

## Testes

| Arquivo | Testa |
|---------|-------|
| `tests/data.test.ts` | Dados: senioridade, WhatsApp, spacing, colliders |
| `tests/camera.test.ts` | Câmera: zoom, target para cada modo |
| `tests/movement.test.ts` | Movimento: WASD, colisão, limites |
| `tests/tour.test.ts` | Tour: paradas, timing, narrativa |
| `tests/tutorial-state.test.ts` | Tutorial: persistência |
| `tests/city-experience.test.tsx` | CityExperience: modos, fast travel, WhatsApp |
| `tests/e2e/site.spec.ts` | E2E: WebGL, fast travel, senioridade, mobile |

## Deploy

| Arquivo | Descrição |
|---------|-----------|
| `.github/workflows/deploy.yml` | GitHub Actions: build + deploy para Pages |
| `.gitignore` | Ignora node_modules, dist, .astro, logs |
