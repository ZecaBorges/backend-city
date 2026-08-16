import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import type { Experience } from '../../data/resume';
import { metrics, profile } from '../../data/resume';
import { completeTutorial, hasCompletedTutorial } from '../../game/tutorial-state';
import { getTourStopAt, TOUR_DURATION_MS, tourStops } from '../../game/tour';
import { getLandmark, type LandmarkId } from '../../game/world';
import CityTutorial from './CityTutorial';

const CityCanvas = lazy(() => import('./CityCanvas'));

type ExperienceMode = 'menu' | 'tour' | 'explore';

interface CityExperienceProps {
  experiences: Experience[];
}

export interface FastTravelRequest {
  landmarkId: LandmarkId;
  sequence: number;
}

export function supportsWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('webgl2') || canvas.getContext('webgl');
    context?.getExtension('WEBGL_lose_context')?.loseContext();
    return Boolean(context);
  } catch {
    return false;
  }
}

export default function CityExperience({ experiences }: CityExperienceProps) {
  const [enabled, setEnabled] = useState(false);
  const [webglUnavailable, setWebglUnavailable] = useState(false);
  const [mode, setMode] = useState<ExperienceMode>('menu');
  const [selectedId, setSelectedId] = useState<LandmarkId>('cassems');
  const [tutorialOpen, setTutorialOpen] = useState(false);
  const [tutorialReturnsToCanvas, setTutorialReturnsToCanvas] = useState(false);
  const [tourElapsed, setTourElapsed] = useState(0);
  const [tourPaused, setTourPaused] = useState(false);
  const [fastTravelRequest, setFastTravelRequest] = useState<FastTravelRequest | null>(null);
  const [dossierVisible, setDossierVisible] = useState(true);
  const [dossierExpanded, setDossierExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const tourStartRef = useRef(0);
  const travelSequenceRef = useRef(0);
  const tour = getTourStopAt(tourElapsed);
  const tourComplete = tourElapsed >= TOUR_DURATION_MS;
  const landmark = getLandmark(selectedId);
  const selectedExperience = landmark.experienceId
    ? experiences.find((experience) => experience.id === landmark.experienceId)
    : undefined;

  useEffect(() => {
    if (supportsWebGL()) setEnabled(true);
    else setWebglUnavailable(true);
  }, []);

  useEffect(() => {
    const media = window.matchMedia('(max-width: 700px)');
    const update = () => setIsMobile(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    if (mode !== 'tour' || tourPaused || tourComplete) return;
    tourStartRef.current = performance.now() - tourElapsed;
    const timer = window.setInterval(() => {
      const elapsed = Math.min(TOUR_DURATION_MS, performance.now() - tourStartRef.current);
      setTourElapsed(elapsed);
      const frame = getTourStopAt(elapsed);
      setSelectedId(frame.stop.landmarkId);
      if (frame.complete) setTourPaused(true);
    }, 100);
    return () => window.clearInterval(timer);
  }, [mode, tourPaused, tourComplete]);

  useEffect(() => {
    if (mode !== 'tour') return;
    const handleVisibility = () => {
      if (document.hidden) setTourPaused(true);
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [mode]);

  function startTour() {
    setFastTravelRequest(null);
    setTourElapsed(0);
    setTourPaused(false);
    setSelectedId(tourStops[0].landmarkId);
    setMode('tour');
  }

  function startExplore() {
    setFastTravelRequest(null);
    setDossierVisible(true);
    setMode('explore');
    if (!hasCompletedTutorial(window.localStorage)) {
      setTutorialReturnsToCanvas(true);
      setTutorialOpen(true);
    }
  }

  function closeTutorial() {
    completeTutorial(window.localStorage);
    setTutorialOpen(false);
  }

  function selectLandmark(id: LandmarkId) {
    setSelectedId(id);
    setDossierVisible(true);
    setDossierExpanded(false);
    travelSequenceRef.current += 1;
    setFastTravelRequest({ landmarkId: id, sequence: travelSequenceRef.current });
    if (mode === 'menu') setMode('explore');
  }

  function inspectLandmark(id: LandmarkId) {
    setSelectedId(id);
    setDossierVisible(true);
    setDossierExpanded(false);
  }

  function fastTravelToLandmark(id: LandmarkId) {
    setSelectedId(id);
    setDossierVisible(true);
    setDossierExpanded(false);
    travelSequenceRef.current += 1;
    setFastTravelRequest({ landmarkId: id, sequence: travelSequenceRef.current });
  }

  function exitToResume() {
    setFastTravelRequest(null);
    setMode('menu');
    window.requestAnimationFrame(() => {
      const resume = document.getElementById('curriculo');
      if (!resume) return;
      resume.setAttribute('tabindex', '-1');
      resume.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
      resume.focus({ preventScroll: true });
    });
  }

  function skipTour(direction: -1 | 1) {
    const nextIndex = Math.min(tourStops.length - 1, Math.max(0, tour.index + direction));
    const elapsed = tourStops.slice(0, nextIndex).reduce((total, stop) => total + stop.durationMs, 0);
    setTourElapsed(elapsed);
    setSelectedId(tourStops[nextIndex].landmarkId);
    setTourPaused(true);
  }

  return (
    <section id="inicio" className={`world-hero mode-${mode}`} aria-labelledby="world-title">
      <div className="world-stage">
        {enabled ? (
          <Suspense fallback={<CityLoading />}>
            <CityCanvas
              selectedId={selectedId}
              mode={mode}
              shouldFocus={mode === 'explore' && !tutorialOpen && tutorialReturnsToCanvas}
              fastTravelRequest={fastTravelRequest}
              onSelect={selectLandmark}
              onInspect={inspectLandmark}
              onDismissDossier={() => setDossierVisible(false)}
              dossierVisible={dossierVisible}
              isMobile={isMobile}
              mobileControlsHidden={isMobile && dossierExpanded}
            />
          </Suspense>
        ) : (
          <CityPoster unavailable={webglUnavailable} />
        )}
        <div className="world-vignette" aria-hidden="true"></div>
      </div>

      <div className="world-topline">
        <span>PRODUCTION_SYSTEMS_CAMPUS</span>
        <span className="world-status"><i></i>{enabled ? '3D ONLINE' : webglUnavailable ? 'STATIC MODE' : 'BOOTING'}</span>
      </div>

      <header className={`world-intro ${mode !== 'menu' ? 'is-compact' : ''}`}>
        <p className="eyebrow"><span className="status-dot"></span> {profile.name}</p>
        <h1 id="world-title">Sistemas sob<br /><span>carga real.</span></h1>
        <p className="world-role">{profile.title} · Java · Kotlin · Spring Boot</p>
        <p className="world-summary">Um campus de sistemas onde arquitetura, integrações e performance operam em conjunto.</p>

        <div className="world-metrics" aria-label="Principais resultados">
          <div><strong>{metrics[0].value}</strong><span>batch crítico</span></div>
          <div><strong>{metrics[1].value}</strong><span>consultas / mês</span></div>
          <div><strong>200K+</strong><span>beneficiários</span></div>
        </div>

        {mode === 'menu' && (
          <div className="world-entry-actions">
            <button type="button" className="button button-primary" onClick={startTour}>Tour de 90 segundos</button>
            <button type="button" className="button button-secondary" onClick={startExplore}>Explorar livremente</button>
            <a className="world-text-link" href="#curriculo">Ver currículo textual ↓</a>
          </div>
        )}
      </header>

      <nav className="world-utility" aria-label="Ações profissionais">
        <a href={profile.linkedin} target="_blank" rel="noreferrer">LinkedIn ↗</a>
        <a href={profile.github} target="_blank" rel="noreferrer">GitHub ↗</a>
        <a href={profile.whatsapp.url} target="_blank" rel="noopener noreferrer">WhatsApp</a>
        {mode !== 'menu' && <button type="button" onClick={() => { setFastTravelRequest(null); setMode('menu'); }}>Visão geral</button>}
      </nav>

      {mode !== 'menu' && (
        <button className="exit-world" type="button" onClick={exitToResume} aria-label="Fechar navegação 3D e abrir currículo principal">
          <span aria-hidden="true">×</span>
        </button>
      )}

      {mode === 'explore' && (
        <div className="world-console">
          <div className="world-fast-travel" aria-label="Viagem rápida">
            <span>FAST_TRAVEL</span>
            <div>
              {(['cassems', 'pluxxe', 'visavale', 'squad-app', 'educarmais', 'engineering-core', 'ai-rd'] as LandmarkId[]).map((id) => {
                const item = getLandmark(id);
                return (
                  <button
                    key={id}
                    type="button"
                    className={selectedId === id ? 'is-active' : ''}
                    style={{ '--landmark-color': item.color } as React.CSSProperties}
                    onClick={() => fastTravelToLandmark(id)}
                    aria-pressed={selectedId === id}
                  >
                    {item.shortLabel}
                  </button>
                );
              })}
            </div>
          </div>
          <button className="help-button" type="button" onClick={() => { setTutorialReturnsToCanvas(false); setTutorialOpen(true); }} aria-controls="city-tutorial" aria-expanded={tutorialOpen}>
            ? Como explorar
          </button>
        </div>
      )}

      {mode === 'tour' && (
        <section className="tour-panel">
          <div aria-live="polite"><p>{tour.stop.eyebrow}</p><h2>{tour.stop.title}</h2><span>{tour.stop.description}</span></div>
          <div className="tour-progress" role="progressbar" aria-valuemin={0} aria-valuemax={90} aria-valuenow={Math.round(tourElapsed / 1000)}>
            <i style={{ width: `${Math.min(100, (tourElapsed / TOUR_DURATION_MS) * 100)}%` }}></i>
          </div>
          <div className="tour-controls">
            <button type="button" onClick={() => skipTour(-1)} disabled={tour.index === 0}>← Anterior</button>
            {tourComplete ? (
              <button type="button" onClick={startExplore}>Concluir tour</button>
            ) : (
              <button type="button" onClick={() => setTourPaused((paused) => !paused)}>{tourPaused ? 'Continuar' : 'Pausar'}</button>
            )}
            <button type="button" onClick={() => skipTour(1)} disabled={tour.index === tourStops.length - 1}>Próximo →</button>
            <button type="button" onClick={startExplore}>Sair do tour</button>
          </div>
        </section>
      )}

      {mode === 'explore' && dossierVisible && (
        <LandmarkDossier
          landmarkId={selectedId}
          experience={selectedExperience}
          expanded={isMobile ? dossierExpanded : true}
          mobile={isMobile}
          onToggle={() => setDossierExpanded((expanded) => !expanded)}
        />
      )}

      {tutorialOpen && <CityTutorial onClose={closeTutorial} />}

      <div className="world-legend" aria-hidden="true">
        <span><i className="legend-api"></i> API</span>
        <span><i className="legend-event"></i> EVENTOS</span>
        <span><i className="legend-data"></i> DADOS</span>
      </div>
    </section>
  );
}

function LandmarkDossier({ landmarkId, experience, expanded, mobile, onToggle }: { landmarkId: LandmarkId; experience?: Experience; expanded: boolean; mobile: boolean; onToggle: () => void }) {
  const landmark = getLandmark(landmarkId);
  return (
    <article
      className={`landmark-dossier ${!expanded ? 'is-collapsed' : 'is-expanded'}`}
      style={{ '--detail-color': landmark.color } as React.CSSProperties}
      aria-live="polite"
    >
      <p className="dossier-code">DISTRICT::{landmark.district.toUpperCase().replaceAll(' ', '_')}</p>
      <div className="dossier-heading"><div><span>{landmark.status}</span><h2>{landmark.label}</h2></div>{experience && <time>{experience.period}</time>}{mobile && <button className="dossier-toggle" type="button" onClick={onToggle} aria-expanded={expanded} aria-controls="landmark-dossier-content" aria-label={expanded ? `Fechar detalhes de ${landmark.label}` : `Expandir detalhes de ${landmark.label}`}><span aria-hidden="true">{expanded ? '×' : '⌃'}</span></button>}</div>
      <div id="landmark-dossier-content">
        <p>{landmark.summary}</p>
        <ul className="dossier-signals">{landmark.signals.map((signal) => <li key={signal}>{signal}</li>)}</ul>
        {experience ? (
          <ul className="dossier-evidence">{experience.achievements.slice(0, 2).map((item) => <li key={item}>{item}</li>)}</ul>
        ) : landmarkId === 'engineering-core' ? (
          <ul className="dossier-evidence"><li>Java · Kotlin · Spring Boot</li><li>DDD · Hexagonal · Event-Driven</li><li>Oracle · Kafka · Docker · Kubernetes</li></ul>
        ) : (
          <ul className="dossier-evidence"><li>Model Gateway e Retrieval Plane</li><li>Evaluation Arena e Guardrail Station</li><li>Ativação somente com cases e métricas verificáveis</li></ul>
        )}
        {experience && <a href={`#experiencia-${experience.id}`}>Abrir evidência completa ↓</a>}
      </div>
    </article>
  );
}

function CityPoster({ unavailable }: { unavailable: boolean }) {
  return (
    <div className="world-static-poster" role={unavailable ? 'status' : undefined}>
      <div className="static-city-grid" aria-hidden="true"></div>
      {unavailable && <p>WebGL indisponível. O atlas permanece navegável pelos controles em HTML.</p>}
    </div>
  );
}

function CityLoading() {
  return <div className="city-loading" role="status"><span></span>Inicializando sistemas 3D…</div>;
}
