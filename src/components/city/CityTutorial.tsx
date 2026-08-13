import { useEffect, useRef } from 'react';

interface CityTutorialProps {
  onClose: () => void;
}

export default function CityTutorial({ onClose }: CityTutorialProps) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    previousFocusRef.current = document.activeElement as HTMLElement | null;
    const dialog = dialogRef.current;
    const parent = dialog?.parentElement;
    const siblings = parent ? Array.from(parent.children).filter((child) => child !== dialog) : [];
    const externalRegions = Array.from(document.querySelectorAll<HTMLElement>('.site-header, .resume-archive'));
    const inertRegions = [...siblings.map((sibling) => sibling as HTMLElement), ...externalRegions];
    inertRegions.forEach((region) => { region.inert = true; });
    closeRef.current?.focus();
    return () => {
      inertRegions.forEach((region) => { region.inert = false; });
      if (previousFocusRef.current?.isConnected) previousFocusRef.current.focus();
    };
  }, []);

  function handleKeyDown(event: React.KeyboardEvent<HTMLElement>) {
    if (event.key === 'Escape') {
      event.preventDefault();
      onClose();
      return;
    }
    if (event.key !== 'Tab' || !dialogRef.current) return;
    const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLElement>('button, a[href], [tabindex]:not([tabindex="-1"])'));
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }

  return (
    <section
      ref={dialogRef}
      id="city-tutorial"
      className="city-tutorial"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tutorial-title"
      aria-describedby="tutorial-description"
      onKeyDown={handleKeyDown}
    >
      <div className="tutorial-scanline" aria-hidden="true"></div>
      <p className="tutorial-code">FIELD_MANUAL // 01</p>
      <h2 id="tutorial-title">Como explorar o atlas</h2>
      <p id="tutorial-description">
        Você pode seguir a rota guiada ou caminhar livremente entre sistemas reais da minha carreira.
      </p>
      <ol className="tutorial-steps">
        <li>
          <span>01</span>
          <div><strong>Movimente-se</strong><p className="desktop-instruction">Use WASD ou as setas para caminhar.</p><p className="mobile-instruction">Use o joystick para caminhar, toque nos prédios ou use a viagem rápida.</p></div>
        </li>
        <li>
          <span>02</span>
          <div><strong>Inspecione sistemas</strong><p>Pressione E perto de um prédio ou clique diretamente nele.</p></div>
        </li>
        <li>
          <span>03</span>
          <div><strong>Não se perca</strong><p>FAST_TRAVEL leva o herói a uma entrada segura do distrito e a câmera continua acompanhando.</p></div>
        </li>
      </ol>
      <div className="tutorial-actions">
        <button ref={closeRef} type="button" className="button button-primary" onClick={onClose}>
          Começar a explorar
        </button>
        <button type="button" className="tutorial-skip" onClick={onClose}>Pular tutorial</button>
      </div>
    </section>
  );
}
