import type { LandmarkId } from './world';

export const TOUR_DURATION_MS = 90_000;

export interface TourStop {
  id: string;
  landmarkId: LandmarkId;
  durationMs: number;
  eyebrow: string;
  title: string;
  description: string;
}

export const tourStops: TourStop[] = [
  {
    id: 'performance',
    landmarkId: 'cassems',
    durationMs: 18_000,
    eyebrow: '01 / PERFORMANCE REFINERY',
    title: 'De cinco horas para doze minutos',
    description: 'SQL tuning, índices e paralelismo reduziram em 96% uma operação batch crítica.',
  },
  {
    id: 'health-integration',
    landmarkId: 'cassems',
    durationMs: 14_000,
    eyebrow: '02 / HEALTH INTEGRATION PORT',
    title: 'Integrações em escala operacional',
    description: 'Fluxos síncronos e assíncronos apoiam mais de 15 mil consultas de telemedicina por mês.',
  },
  {
    id: 'fiscal-events',
    landmarkId: 'pluxxe',
    durationMs: 14_000,
    eyebrow: '03 / FISCAL EVENT HUB',
    title: 'Do processamento central aos eventos',
    description: 'Kafka conecta processadores fiscais especializados em uma arquitetura evolutiva.',
  },
  {
    id: 'trust',
    landmarkId: 'visavale',
    durationMs: 12_000,
    eyebrow: '04 / TRUST GATEWAY',
    title: 'Segurança na fronteira transacional',
    description: 'JWT, OAuth2 e arquitetura hexagonal protegem APIs críticas de benefícios.',
  },
  {
    id: 'global',
    landmarkId: 'squad-app',
    durationMs: 10_000,
    eyebrow: '05 / GLOBAL PAYMENTS PORT',
    title: 'Entrega além das fronteiras',
    description: 'Pagamentos internacionais, containers e comunicação profissional em inglês.',
  },
  {
    id: 'core',
    landmarkId: 'engineering-core',
    durationMs: 14_000,
    eyebrow: '06 / ENGINEERING CORE',
    title: 'Uma arquitetura recorrente',
    description: 'Entender a restrição, isolar o domínio, projetar limites e medir o resultado.',
  },
  {
    id: 'future',
    landmarkId: 'ai-rd',
    durationMs: 8_000,
    eyebrow: '07 / AI R&D BLUEPRINT',
    title: 'O próximo distrito será avaliado por evidências',
    description: 'IA, RAG e agentes entrarão somente com métricas de qualidade, custo, latência e segurança.',
  },
];

export function getTourStopAt(elapsedMs: number): { stop: TourStop; index: number; complete: boolean } {
  const safeElapsed = Math.max(0, elapsedMs);
  let boundary = 0;
  for (let index = 0; index < tourStops.length; index += 1) {
    boundary += tourStops[index].durationMs;
    if (safeElapsed < boundary) return { stop: tourStops[index], index, complete: false };
  }
  return { stop: tourStops[tourStops.length - 1], index: tourStops.length - 1, complete: true };
}
