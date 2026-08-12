export type ExperienceId =
  | 'cassems'
  | 'pluxxe'
  | 'visavale'
  | 'squad-app'
  | 'educarmais';

export interface Experience {
  id: ExperienceId;
  company: string;
  context?: string;
  role: string;
  period: string;
  district: string;
  color: string;
  summary: string;
  achievements: string[];
  technologies: string[];
}

export const profile = {
  name: 'José Emanuel Borges',
  initials: 'JEB',
  title: 'Senior Backend Engineer',
  location: 'Petrolina, PE',
  email: 'szeca00@gmail.com',
  whatsapp: {
    display: '+55 87 98827-1297',
    e164: '+5587988271297',
    url: 'https://wa.me/5587988271297',
  },
  linkedin: 'https://www.linkedin.com/in/jose-emanuel-borges-1711771b6',
  github: 'https://github.com/zecasouza',
  summary:
    'Engenheiro de Software Sênior com 7+ anos construindo sistemas distribuídos nos setores de saúde, finanças e benefícios. Uno visão arquitetural a entregas hands-on em Java, Kotlin e Spring Boot.',
};

export const metrics = [
  {
    value: '5h → 12min',
    label: 'processamento batch',
    detail: '96% de redução no tempo de execução',
  },
  {
    value: '15K+',
    label: 'consultas por mês',
    detail: 'integração com plataforma de telemedicina',
  },
  {
    value: '7+ anos',
    label: 'de engenharia',
    detail: 'saúde, fintech, benefícios e educação',
  },
];

export const experiences: Experience[] = [
  {
    id: 'cassems',
    company: 'CASSEMS',
    context: 'Cliente Redspark · Plataforma de Saúde',
    role: 'Engenheiro de Software Sênior',
    period: '2025 — presente',
    district: 'Health Grid',
    color: '#00e89d',
    summary:
      'Microsserviços para operadora estadual de saúde atendendo mais de 200 mil beneficiários.',
    achievements: [
      'Reduzi de 5 horas para 12 minutos uma operação batch de contribuições com SQL tuning, índices e paralelismo.',
      'Implementei integrações síncronas e assíncronas com a Conexa, apoiando mais de 15 mil consultas mensais.',
      'Apliquei DDD e Arquitetura Hexagonal a lotes CSV com mais de 100 mil registros e relatórios financeiros.',
      'Contribuí com mais de 280 commits em 11 repositórios do ecossistema.',
    ],
    technologies: ['Spring Boot', 'NestJS', 'Oracle', 'Vue 3', 'React Native'],
  },
  {
    id: 'pluxxe',
    company: 'Pluxxe',
    context: 'Cliente Redspark · Plataforma Financeira',
    role: 'Engenheiro de Software',
    period: '2024 — 2025',
    district: 'Fiscal Core',
    color: '#00a8ff',
    summary:
      'Plataforma de geração de arquivos fiscais e trabalhistas, evoluída a partir da automação da DIRF.',
    achievements: [
      'Automatizei processos para DIRF, DCTF, EFD-Reinf e CAGED, reduzindo trabalho manual e retrabalho.',
      'Participei da evolução de um backend NestJS para microsserviços orientados a eventos com Kafka.',
      'Configurei pipelines com testes automatizados e deploys sem downtime.',
    ],
    technologies: ['NestJS', 'TypeScript', 'Kafka', 'GitHub Actions', 'Microsserviços'],
  },
  {
    id: 'visavale',
    company: 'VisaVale',
    context: 'Cliente Redspark · Benefícios e Fintech',
    role: 'Engenheiro de Software',
    period: '2023 — 2024',
    district: 'Secure Gateway',
    color: '#7c6cff',
    summary:
      'APIs seguras para transações de benefícios e suporte ao aplicativo móvel do produto.',
    achievements: [
      'Desenvolvi APIs REST com Arquitetura Hexagonal e autenticação JWT/OAuth2.',
      'Ampliei a cobertura automatizada de módulos críticos com JUnit e Mockito no CI.',
      'Contribuí no app React Native com login, carteirinha e histórico de transações.',
    ],
    technologies: ['Java', 'Spring Boot', 'OAuth2', 'JUnit', 'React Native'],
  },
  {
    id: 'squad-app',
    company: 'Squad App',
    context: 'Flórida, EUA · Freelancer',
    role: 'Engenheiro Backend',
    period: '2022 — 2023',
    district: 'Global Port',
    color: '#ff8a3d',
    summary:
      'Backend para aplicativo móvel global com transações internacionais e gateways de pagamento.',
    achievements: [
      'Desenvolvi APIs REST com Node.js, NestJS e Java para integrações de pagamento.',
      'Containerizei ambientes e automatizei deploys com Docker e GitHub Actions.',
      'Atuei em inglês com um cliente internacional baseado na Flórida.',
    ],
    technologies: ['Node.js', 'NestJS', 'Java', 'Docker', 'Pagamentos'],
  },
  {
    id: 'educarmais',
    company: 'EducarMais',
    role: 'Desenvolvedor Full Stack',
    period: '2020 — 2022',
    district: 'Foundation Block',
    color: '#ffcc4d',
    summary:
      'Desenvolvimento de APIs e automações corporativas com contato direto com o negócio.',
    achievements: [
      'Construí APIs REST e ferramentas de automação com PHP e Python.',
      'Traduzi necessidades de stakeholders em requisitos e entregas técnicas.',
    ],
    technologies: ['PHP', 'Python', 'REST', 'Automação'],
  },
];

export const skillGroups = [
  {
    title: 'Core',
    skills: ['Java 21', 'Kotlin', 'Spring Boot 3', 'Quarkus', 'TypeScript'],
  },
  {
    title: 'Arquitetura',
    skills: ['Sistemas Distribuídos', 'DDD', 'Arquitetura Hexagonal', 'Event-Driven', 'SOLID'],
  },
  {
    title: 'Dados e integração',
    skills: ['Oracle', 'PostgreSQL', 'Redis', 'Kafka', 'RabbitMQ', 'REST', 'Webhooks'],
  },
  {
    title: 'Entrega',
    skills: ['Docker', 'Kubernetes', 'OpenShift', 'Azure DevOps', 'GitHub Actions', 'TDD'],
  },
];

export const education = [
  'Pós-Graduação em Engenharia de Software',
  'Tecnólogo em Análise e Desenvolvimento de Sistemas — Estácio',
];

export const certifications = [
  'Fintech Practitioner — Payment Gateway & QR Code, KITE',
  'Java Spring Experts — Prof. Dr. Nélio Alves',
  'Node.js e React — Rocketseat',
];
