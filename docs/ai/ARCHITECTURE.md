# Arquitetura

## Estrutura de Diretórios

```
backend-city/
├── src/
│   ├── components/          # Componentes React/Astro
│   │   ├── city/            # Componentes 3D (React Three Fiber)
│   │   │   ├── CityCanvas.tsx      # Canvas WebGL wrapper
│   │   │   ├── CityExperience.tsx   # Controlador de modos (menu/tour/explore)
│   │   │   ├── CityScene.tsx        # Cena 3D principal
│   │   │   ├── CityTutorial.tsx     # Overlay de tutorial
│   │   │   └── CampusProps.tsx      # Árvores, bancos, fonte
│   │   ├── Contact.astro    # Seção de contato
│   │   ├── Header.astro     # Navegação
│   │   ├── Hero.astro       # Hero com canvas 3D
│   │   └── ...
│   ├── data/
│   │   └── resume.ts        # Dados profissionais (única fonte da verdade)
│   ├── game/                # Lógica de jogo (puro TS, sem React)
│   │   ├── camera.ts        # Posição e zoom da câmera
│   │   ├── movement.ts      # Movimentação do avatar + colisão
│   │   ├── tour.ts          # Narrativa do tour guiado
│   │   ├── tutorial-state.ts # Estado do tutorial
│   │   └── world.ts         # Landmarks, colliders, paths, props
│   ├── layouts/
│   │   └── BaseLayout.astro # Layout base com SEO/JSON-LD
│   ├── pages/
│   │   └── index.astro      # Página principal
│   └── styles/
│       └── global.css       # Estilos globais
├── tests/                   # Testes
│   ├── e2e/                 # Playwright E2E
│   ├── camera.test.ts
│   ├── data.test.ts
│   ├── movement.test.ts
│   └── ...
├── .github/workflows/
│   └── deploy.yml           # GitHub Pages deploy
└── astro.config.mjs         # Configuração Astro
```

## Fluxo de Dados

```
resume.ts (dados)
    ↓
world.ts (mapeia experiences → landmarks 3D)
    ↓
CityScene.tsx (renderiza landmarks + avatar + câmera)
    ↓
CityExperience.tsx (gerencia modos: menu/tour/explore)
    ↓
CityCanvas.tsx (Canvas WebGL global)
```

## Modos de Visualização

| Modo | Descrição | Câmera | Avatar |
|------|-----------|--------|--------|
| `menu` | Visão geral do campus | Estática, zoom amplo | Invisível |
| `tour` | Guiado em 90s, 7 paradas | Enquadra cada landmark | Invisível |
| `explore` | Exploração livre | Segue o avatar | Visível, controlável |

## Componentes 3D

### CityCanvas.tsx
- Wrapper do `<Canvas>` do R3F
- Configura: `camera.zoom=12`, `far=220`, `antialias`
- Inclui `<Suspense>` com fallback de loading

### CityScene.tsx
- Cena principal com todos os elementos 3D
- Componentes internos:
  - `Environment` — Grid, fundo, sparkles
  - `Infrastructure` — Ruas e caminhos (Line)
  - `Landmark` — Prédios clicáveis (Box + Edges)
  - `AvatarController` — WASD/setas + colisão
  - `CameraDirector` — Interpolação suave da câmera

### CampusProps.tsx
- `CampusTree` — Tronco + copa low-poly
- `CampusBench` — Banco de praça
- `CampusFountain` — Fonte com água animada

## Sistema de Colisão

```
Avatar (círculo r=0.48)
    ↓ colide com
Landmarks (AABB dos tamanhos em world.ts)
CampusProps (AABB dos collisionSize)
Bordas do mundo (worldBounds)
    ↓ verifica via
isPositionWalkable() em movement.ts
```

**Regras:**
- Colisão círculo vs AABB (sem engine de física)
- `entryPoint` de cada landmark deve estar em posição segura
- Caminhos (`campusPaths`) não devem ter obstáculos

## Fast Travel

1. Usuário clica num landmark no menu
2. `CityExperience` emite `FastTravelRequest`
3. `CityScene` resolve destino via `resolveFastTravelDestination()`
4. Avatar teletransporta para `entryPoint` seguro
5. Câmera interpola para `cameraTarget`

## Tour Guiado

- Duração total: 90 segundos
- 7 paradas definidas em `tour.ts`
- Cada parada: `landmarkId` + duração + narração
- `getTourStopAt(elapsedMs)` retorna parada atual
- Transições suaves entre landmarks

## SEO e Acessibilidade

- JSON-LD em `BaseLayout.astro` (sem telefone — evitar scraping)
- `prefers-reduced-motion` — Desativa sparkles e animações
- Keyboard navigation — Tab, Enter, Escape funcionam
- Print — Esconde canais interativos, mantém info estática
