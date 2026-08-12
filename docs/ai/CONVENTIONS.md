# Convenções de Código

## TypeScript

- **Strict mode** — `tsconfig.json` com `strict: true`
- **Tipos explícitos** — Preferir interfaces/type aliases inline
- **Imutabilidade** — `readonly` em arrays/objetos de configuração
- **Exports nomeados** — Nunca default exports em `game/*.ts`

## Nomenclatura

| Tipo | Padrão | Exemplo |
|------|--------|---------|
| Interface | PascalCase | `WorldLandmark`, `CampusProp` |
| Type alias | PascalCase | `LandmarkId`, `CampusPropKind` |
| Constante | camelCase | `worldLandmarks`, `avatarSpawn` |
| Função | camelCase | `getTourStopAt`, `isPositionWalkable` |
| Arquivo (componente) | PascalCase | `CityScene.tsx`, `CampusProps.tsx` |
| Arquivo (util) | camelCase | `movement.ts`, `camera.ts` |
| CSS class | kebab-case | `contact-channel-primary` |

## Componentes React

```tsx
// Componente com props
interface MeuComponenteProps {
  selectedId: LandmarkId;
  onSelect: (id: LandmarkId) => void;
}

export default function MeuComponente({ selectedId, onSelect }: MeuComponenteProps) {
  // Hooks primeiro
  const [state, setState] = useState(false);
  
  // Effects depois
  useEffect(() => { /* ... */ }, []);
  
  // Render
  return <div>...</div>;
}
```

**Regras:**
- Components em `src/components/city/` usam `.tsx`
- Components Astro usam `.astro`
- Separar componentes internos em arquivos se >200 linhas

## Dados Profissionais

Tudo em `src/data/resume.ts`:

```typescript
// Adicionar experiência
export const experiences: Experience[] = [
  {
    id: 'novo-id',           // ExperienceId
    company: 'Empresa',
    context: 'Cliente · Setor',
    role: 'Cargo',
    period: '2024 — presente',
    district: 'District Name',  // Nome no campus 3D
    color: '#hex',              // Cor do prédio
    summary: 'Descrição.',
    achievements: ['Achievement 1'],
    technologies: ['Tech 1'],
  },
];
```

**Landmarks** em `src/game/world.ts`:
- `id` deve ser igual ao `experienceId`
- `entryPoint` deve estar em posição segura (fora de colisores)
- `position` e `size` definem o prédio 3D
- `cameraTarget` é onde a câmera olha

## Colisão

```typescript
// Adicionar colisor (em world.ts)
worldColliders.push({
  min: { x: X - halfW, z: Z - halfD },
  max: { x: X + halfW, z: Z + halfD },
});

// Campus prop com colisão
{
  id: 'tree-01',
  kind: 'tree',
  position: [x, y, z],
  collisionSize: [0.6, 0.6],  // metade da largura/altura
}
```

**Regras:**
- `entryPoint` NUNCA pode estar dentro de um collider
- Caminhos entre landmarks devem ter largura mínima
- Testar com `isPositionWalkable()` antes de posicionar

## Estilos CSS

- Estilos globais em `src/styles/global.css`
- Usar variáveis CSS para cores do tema cyberpunk
- Classes BEM-like: `.contact-channel-primary`
- Print styles: `.print-only`, `@media print`

## Testes

### Unit Tests (Vitest)
```typescript
// tests/nome.test.ts
import { describe, it, expect } from 'vitest';
import { funcao } from '../src/caminho';

describe('funcao', () => {
  it('deve fazer X', () => {
    expect(funcao(input)).toBe(output);
  });
});
```

### E2E Tests (Playwright)
```typescript
// tests/e2e/site.spec.ts
import { test, expect } from '@playwright/test';

test('descrição do teste', async ({ page }) => {
  await page.goto('/');
  // asserts...
});
```

**Cobertura esperada:**
- Movimento e colisão
- Dados profissionais
- Modos de visualização
- WhatsApp/contato
- Senioridade Cassems
- Mobile responsive

## Build e Deploy

- `npm run build` = `astro check && astro build`
- Output estático em `dist/`
- GitHub Actions faz build + deploy
- Chunk >500KB é aceitável (Three.js)
- `base` path configurado automaticamente pelo GitHub Actions

## Regras de Negócio

1. **AI R&D ZONE** — Status `blueprint`, nunca `operational`
2. **Senioridade** — Apenas Cassems: "Engenheiro de Software Sênior"
3. **WhatsApp** — Canal primário, sempre com `wa.me/5587988271297`
4. **Tour** — 90 segundos, 7 paradas, narrativa fixa
5. **Fast Travel** — Teleporta para `entryPoint` seguro
6. **Sair (X)** — Volta para `menu`, reseta posição do avatar
