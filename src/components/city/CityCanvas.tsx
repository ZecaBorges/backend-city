import { Component, useEffect, useRef, type ErrorInfo, type ReactNode } from 'react';
import { Canvas } from '@react-three/fiber';
import type { LandmarkId } from '../../game/world';
import CityScene from './CityScene';
import type { FastTravelRequest } from './CityExperience';

interface CityCanvasProps {
  selectedId: LandmarkId;
  mode: 'menu' | 'tour' | 'explore';
  shouldFocus: boolean;
  fastTravelRequest: FastTravelRequest | null;
  onSelect: (id: LandmarkId) => void;
}

interface BoundaryState { failed: boolean; }

class WebGLErrorBoundary extends Component<{ children: ReactNode }, BoundaryState> {
  state: BoundaryState = { failed: false };
  static getDerivedStateFromError(): BoundaryState { return { failed: true }; }
  componentDidCatch(error: Error, info: ErrorInfo) { console.error('Backend City WebGL error', error, info); }
  render() {
    if (this.state.failed) return <div className="city-loading city-error" role="alert">Não foi possível abrir o modo 3D. Use o atlas textual abaixo.</div>;
    return this.props.children;
  }
}

export default function CityCanvas({ selectedId, mode, shouldFocus, fastTravelRequest, onSelect }: CityCanvasProps) {
  const shellRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (shouldFocus) shellRef.current?.focus();
  }, [shouldFocus]);

  return (
    <WebGLErrorBoundary>
      <div
        ref={shellRef}
        className="canvas-shell world-canvas"
        tabIndex={0}
        onPointerDown={() => mode === 'explore' && shellRef.current?.focus()}
        aria-label="Atlas tridimensional de sistemas. Selecione distritos por clique; no modo livre use WASD ou setas e E para inspecionar."
      >
        <Canvas
          orthographic
          dpr={[1, 1.4]}
          camera={{ position: [39, 40, 39], zoom: 12, near: 0.1, far: 220 }}
          gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
          fallback={<div className="city-loading">WebGL indisponível neste dispositivo.</div>}
        >
          <CityScene selectedId={selectedId} mode={mode} fastTravelRequest={fastTravelRequest} onSelect={onSelect} controlElementRef={shellRef} />
        </Canvas>
        {mode === 'explore' && <div className="canvas-help" aria-hidden="true"><span><kbd>WASD</kbd> mover</span><span><kbd>E</kbd> inspecionar</span><span><kbd>CLIQUE</kbd> selecionar</span></div>}
        {mode === 'explore' && <div className="touch-hint" aria-hidden="true">TOQUE EM UM DISTRITO · OU USE FAST_TRAVEL</div>}
      </div>
    </WebGLErrorBoundary>
  );
}
