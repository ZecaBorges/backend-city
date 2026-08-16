import type { ExperienceId } from '../data/resume';
import type { Aabb2D, Position2D } from './movement';

export type LandmarkId = ExperienceId | 'engineering-core' | 'ai-rd';
export type LandmarkKind = 'career' | 'platform' | 'future';
export type VegetationVariant = 'small-wide' | 'medium' | 'tall-narrow';

export interface LandmarkSignage {
  position: readonly [number, number, number];
  rotationY: number;
  fontSize: number;
  panelWidth: number;
  connectorLength: number;
}

export interface WorldLandmark {
  id: LandmarkId;
  experienceId?: ExperienceId;
  kind: LandmarkKind;
  status: 'operational' | 'blueprint';
  label: string;
  shortLabel: string;
  district: string;
  color: string;
  position: readonly [number, number, number];
  size: readonly [number, number, number];
  collisionSize?: readonly [number, number, number];
  cameraTarget: readonly [number, number, number];
  signage: LandmarkSignage;
  entryPoint: Position2D;
  summary: string;
  signals: readonly string[];
}

export type CampusPropKind = 'tree' | 'bench' | 'fountain';

export interface CampusProp {
  id: string;
  kind: CampusPropKind;
  position: readonly [number, number, number];
  rotationY?: number;
  variant?: VegetationVariant;
  collisionSize: readonly [number, number];
}

export interface CampusPath {
  id: string;
  position: readonly [number, number, number];
  size: readonly [number, number, number];
}

export interface FastTravelRequestLike {
  landmarkId: LandmarkId;
  sequence: number;
}

export const worldBounds = {
  minX: -31,
  maxX: 31,
  minZ: -24,
  maxZ: 26,
};

export const avatarSpawn: Position2D = { x: 0, z: 17 };
export const avatarCollisionRadius = 0.48;
export const dossierDismissDistance = 16;

export function getDossierDismissalState(distance: number, armed: boolean): { armed: boolean; shouldDismiss: boolean } {
  const nextArmed = armed || distance <= dossierDismissDistance;
  return { armed: nextArmed, shouldDismiss: nextArmed && distance > dossierDismissDistance };
}

export const worldLandmarks: WorldLandmark[] = [
  {
    id: 'cassems',
    experienceId: 'cassems',
    kind: 'career',
    status: 'operational',
    label: 'CASSEMS',
    shortLabel: 'HEALTH',
    district: 'Health Operations Grid',
    color: '#00e89d',
    position: [-14, 1.1, -10],
    size: [7, 6.6, 6],
    cameraTarget: [-14, 3.8, -10],
    signage: { position: [0, 5.8, 0], rotationY: Math.PI / 4, fontSize: 0.78, panelWidth: 5.6, connectorLength: 0.6 },
    entryPoint: { x: -14, z: -6 },
    summary: 'Performance batch e integrações de saúde em escala operacional.',
    signals: ['5h → 12min', '15K+ / mês', '200K+ beneficiários'],
  },
  {
    id: 'pluxxe',
    experienceId: 'pluxxe',
    kind: 'career',
    status: 'operational',
    label: 'PLUXXE',
    shortLabel: 'EVENTS',
    district: 'Fiscal Event Hub',
    color: '#00a8ff',
    position: [14, 3.8, -12],
    size: [5, 7.6, 5],
    cameraTarget: [14, 7.4, -11],
    signage: { position: [0, 5.9, 0], rotationY: Math.PI / 4, fontSize: 0.76, panelWidth: 5.2, connectorLength: 0.2 },
    entryPoint: { x: 15, z: -8.8 },
    summary: 'Plataforma fiscal orientada a eventos e conectada por Kafka.',
    signals: ['Kafka', 'DIRF · DCTF', 'Zero downtime'],
  },
  {
    id: 'visavale',
    experienceId: 'visavale',
    kind: 'career',
    status: 'operational',
    label: 'VISAVALE',
    shortLabel: 'TRUST',
    district: 'Trust Gateway',
    color: '#7c6cff',
    position: [21, 2.5, 4],
    size: [5, 5, 5],
    collisionSize: [7.2, 5, 7.2],
    cameraTarget: [21, 5.4, 4],
    signage: { position: [0, 5.2, 0], rotationY: Math.PI / 4, fontSize: 0.72, panelWidth: 5.8, connectorLength: 0.5 },
    entryPoint: { x: 16, z: 4 },
    summary: 'APIs financeiras protegidas por limites explícitos de confiança.',
    signals: ['JWT / OAuth2', 'Hexagonal', 'Critical tests'],
  },
  {
    id: 'squad-app',
    experienceId: 'squad-app',
    kind: 'career',
    status: 'operational',
    label: 'SQUAD APP',
    shortLabel: 'GLOBAL',
    district: 'Global Payments Port',
    color: '#ff8a3d',
    position: [-21, 2.7, 13],
    size: [5.5, 5.4, 5],
    cameraTarget: [-21, 4.8, 13],
    signage: { position: [0, 4, 0], rotationY: Math.PI / 4, fontSize: 0.72, panelWidth: 6.2, connectorLength: 0.6 },
    entryPoint: { x: -17.3, z: 13 },
    summary: 'Integrações internacionais de pagamento e entrega containerizada.',
    signals: ['Florida, USA', 'Payments', 'Docker'],
  },
  {
    id: 'educarmais',
    experienceId: 'educarmais',
    kind: 'career',
    status: 'operational',
    label: 'EDUCAR+',
    shortLabel: 'FOUNDATION',
    district: 'Foundation Workshop',
    color: '#ffcc4d',
    position: [15, 1.8, 19],
    size: [6, 3.6, 4.5],
    cameraTarget: [15, 3.4, 19],
    signage: { position: [0, 3, 0], rotationY: Math.PI / 4, fontSize: 0.7, panelWidth: 5.6, connectorLength: 0.5 },
    entryPoint: { x: 15, z: 15.5 },
    summary: 'Onde necessidades de negócio se transformaram em APIs e automações.',
    signals: ['PHP', 'Python', 'Business → API'],
  },
  {
    id: 'engineering-core',
    kind: 'platform',
    status: 'operational',
    label: 'ENGINEERING CORE',
    shortLabel: 'CORE',
    district: 'Engineering Core',
    color: '#d946ef',
    position: [0, 1.5, -2],
    size: [4.5, 3, 4.5],
    collisionSize: [6.5, 3, 6.5],
    cameraTarget: [0, 3.8, -2],
    signage: { position: [0, 4.1, 0], rotationY: Math.PI / 4, fontSize: 0.68, panelWidth: 8.4, connectorLength: 0.55 },
    entryPoint: { x: 0, z: 2.3 },
    summary: 'A base compartilhada que conecta arquitetura, dados, entrega e qualidade.',
    signals: ['Java · Kotlin', 'DDD · Hexagonal', 'Kafka · Oracle'],
  },
  {
    id: 'ai-rd',
    kind: 'future',
    status: 'blueprint',
    label: 'AI R&D ZONE',
    shortLabel: 'AI R&D',
    district: 'AI Research & Development',
    color: '#ff3d9a',
    position: [-24, 1.1, -20],
    size: [7, 2.2, 5.5],
    cameraTarget: [-24, 4.7, -20],
    signage: { position: [0, 6.5, 0], rotationY: Math.PI / 4, fontSize: 0.72, panelWidth: 6.8, connectorLength: 0.55 },
    entryPoint: { x: -19.5, z: -20 },
    summary: 'Blueprint reservado para cases verificáveis de IA, avaliação e observabilidade.',
    signals: ['STATUS: BLUEPRINT', 'RAG · Agents', 'Evaluation first'],
  },
];

export const campusProps: CampusProp[] = [
  { id: 'fountain-east-garden', kind: 'fountain', position: [4.5, 0.35, 12], collisionSize: [4.9, 4.9] },
  { id: 'bench-west-main', kind: 'bench', position: [-12, 0.5, 10.2], rotationY: Math.PI, collisionSize: [2.8, 0.9] },
  { id: 'bench-east-main', kind: 'bench', position: [12, 0.5, 5.8], collisionSize: [2.8, 0.9] },
  { id: 'bench-health-south', kind: 'bench', position: [-5.6, 0.5, -11], rotationY: Math.PI / 2, collisionSize: [0.9, 2.8] },
  { id: 'bench-health-north', kind: 'bench', position: [-10.4, 0.5, 0], rotationY: -Math.PI / 2, collisionSize: [0.9, 2.8] },
  { id: 'bench-events-south', kind: 'bench', position: [5.6, 0.5, -6], rotationY: Math.PI / 2, collisionSize: [0.9, 2.8] },
  { id: 'bench-events-north', kind: 'bench', position: [10.4, 0.5, 1], rotationY: -Math.PI / 2, collisionSize: [0.9, 2.8] },
  { id: 'bench-global', kind: 'bench', position: [-14.8, 0.5, 11.5], rotationY: Math.PI / 2, collisionSize: [0.9, 2.8] },
  { id: 'bench-foundation', kind: 'bench', position: [12.5, 0.5, 12.5], rotationY: -Math.PI / 2, collisionSize: [0.9, 2.8] },
  { id: 'bench-ai', kind: 'bench', position: [-14, 0.5, -17.4], collisionSize: [2.8, 0.9] },
  { id: 'bench-pluxxe', kind: 'bench', position: [12, 0.5, -6.3], collisionSize: [2.8, 0.9] },
  { id: 'bench-visavale', kind: 'bench', position: [18, 0.5, 10], collisionSize: [2.8, 0.9] },
  { id: 'tree-ai-west', kind: 'tree', position: [-28.5, 0, -15], rotationY: 0.4, variant: 'tall-narrow', collisionSize: [0.8, 0.8] },
  { id: 'tree-ai-east', kind: 'tree', position: [-25.8, 0, -14.2], rotationY: 1.2, variant: 'medium', collisionSize: [0.9, 0.9] },
  { id: 'tree-ai-garden', kind: 'tree', position: [-13, 0, -15], rotationY: 0.8, variant: 'small-wide', collisionSize: [1.1, 1.1] },
  { id: 'tree-health', kind: 'tree', position: [-11.8, 0, -3.6], rotationY: 0.2, variant: 'small-wide', collisionSize: [1.1, 1.1] },
  { id: 'tree-health-garden', kind: 'tree', position: [-6, 0, -13.5], rotationY: 1.5, variant: 'medium', collisionSize: [0.9, 0.9] },
  { id: 'tree-core-east', kind: 'tree', position: [5.3, 0, -2.8], rotationY: 0.7, variant: 'small-wide', collisionSize: [1.1, 1.1] },
  { id: 'tree-events', kind: 'tree', position: [10.8, 0, -4], rotationY: 1.1, variant: 'medium', collisionSize: [0.9, 0.9] },
  { id: 'tree-pluxxe-north', kind: 'tree', position: [19, 0, -14], rotationY: 0.3, variant: 'tall-narrow', collisionSize: [0.8, 0.8] },
  { id: 'tree-global-east', kind: 'tree', position: [-13, 0, 5.5], rotationY: 1.4, variant: 'small-wide', collisionSize: [1.1, 1.1] },
  { id: 'tree-main-west', kind: 'tree', position: [-7, 0, 12], rotationY: 0.5, variant: 'medium', collisionSize: [0.9, 0.9] },
  { id: 'tree-global-north', kind: 'tree', position: [-22, 0, 19], rotationY: 1.3, variant: 'tall-narrow', collisionSize: [0.8, 0.8] },
  { id: 'tree-trust-north', kind: 'tree', position: [18.5, 0, 11], rotationY: 0.9, variant: 'small-wide', collisionSize: [1.1, 1.1] },
  { id: 'tree-trust-east', kind: 'tree', position: [26.5, 0, 6], rotationY: 0.2, variant: 'tall-narrow', collisionSize: [0.8, 0.8] },
  { id: 'tree-foundation-east', kind: 'tree', position: [23, 0, 20], rotationY: 1.6, variant: 'medium', collisionSize: [0.9, 0.9] },
  { id: 'tree-foundation-garden', kind: 'tree', position: [26.5, 0, 21], rotationY: 0.6, variant: 'small-wide', collisionSize: [1.1, 1.1] },
];

export const campusPaths: CampusPath[] = [
  { id: 'main-campus-walk', position: [-0.65, 0.035, 8], size: [33.3, 0.08, 2.2] },
  { id: 'core-entrance', position: [0, 0.035, 5.15], size: [2.2, 0.08, 6.1] },
  { id: 'spawn-connection', position: [0, 0.035, 12.5], size: [2.2, 0.08, 9] },
  { id: 'west-spine', position: [-8, 0.035, -6], size: [2.2, 0.08, 28] },
  { id: 'east-spine', position: [8, 0.035, -0.4], size: [2.2, 0.08, 16.8] },
  { id: 'cassems-branch', position: [-11, 0.035, -6], size: [6.4, 0.08, 2.2] },
  { id: 'ai-branch', position: [-13.75, 0.035, -20], size: [11.9, 0.08, 2.2] },
  { id: 'pluxxe-branch', position: [11.5, 0.035, -8.8], size: [7.4, 0.08, 2.2] },
  { id: 'visavale-branch', position: [16, 0.035, 6], size: [2.2, 0.08, 4.4] },
  { id: 'squad-branch', position: [-17.3, 0.035, 10.5], size: [2.2, 0.08, 5.4] },
  { id: 'educarmais-branch', position: [15, 0.035, 11.75], size: [2.2, 0.08, 7.9] },
  { id: 'fountain-connection', position: [4.5, 0.035, 9.3], size: [2.2, 0.08, 1.8] },
];

function boxToAabb(
  position: readonly [number, number, number],
  size: readonly [number, number, number],
): Aabb2D {
  return {
    minX: position[0] - size[0] / 2,
    maxX: position[0] + size[0] / 2,
    minZ: position[2] - size[2] / 2,
    maxZ: position[2] + size[2] / 2,
  };
}

export const worldColliders: Aabb2D[] = [
  ...worldLandmarks.map((landmark) => boxToAabb(landmark.position, landmark.collisionSize ?? landmark.size)),
  ...campusProps.map((prop) => boxToAabb(prop.position, [prop.collisionSize[0], 1, prop.collisionSize[1]])),
];

export function getLandmark(id: LandmarkId): WorldLandmark {
  const landmark = worldLandmarks.find((item) => item.id === id);
  if (!landmark) throw new Error(`Unknown landmark: ${id}`);
  return landmark;
}

export function findNearestLandmark(position: Position2D, range: number = 7.5): LandmarkId | null {
  let nearest: LandmarkId | null = null;
  let nearestDistance = Infinity;
  for (const landmark of worldLandmarks) {
    const distance = Math.hypot(position.x - landmark.position[0], position.z - landmark.position[2]);
    if (distance <= range && distance < nearestDistance) {
      nearest = landmark.id;
      nearestDistance = distance;
    }
  }
  return nearest;
}

export function resolveFastTravelDestination(
  request: FastTravelRequestLike | null,
  handledSequence: number,
): Position2D | null {
  if (!request || request.sequence <= handledSequence) return null;
  return getLandmark(request.landmarkId).entryPoint;
}
