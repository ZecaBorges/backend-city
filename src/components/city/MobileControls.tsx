import { useRef, type RefObject } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import { computeJoystickVector, JOYSTICK_DEAD_ZONE } from '../../game/joystick';
import type { Position2D } from '../../game/movement';

const JOYSTICK_RADIUS = 32;

interface MobileControlsProps {
  joystickVectorRef: RefObject<Position2D>;
  inspectSequenceRef: RefObject<number>;
  hidden: boolean;
}

export default function MobileControls({ joystickVectorRef, inspectSequenceRef, hidden }: MobileControlsProps) {
  const baseRef = useRef<HTMLDivElement>(null);
  const knobRef = useRef<HTMLDivElement>(null);
  const originRef = useRef<{ x: number; y: number } | null>(null);
  const pointerIdRef = useRef<number | null>(null);

  function handlePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (pointerIdRef.current !== null) return;
    pointerIdRef.current = event.pointerId;
    event.currentTarget.setPointerCapture?.(event.pointerId);
    const base = baseRef.current;
    if (!base) return;
    const rect = base.getBoundingClientRect();
    originRef.current = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    update(event.clientX, event.clientY);
  }

  function handlePointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (pointerIdRef.current !== event.pointerId) return;
    update(event.clientX, event.clientY);
  }

  function handlePointerEnd(event: ReactPointerEvent<HTMLDivElement>) {
    if (pointerIdRef.current !== event.pointerId) return;
    reset();
  }

  function update(clientX: number, clientY: number) {
    if (!originRef.current) return;
    const vector = computeJoystickVector(originRef.current.x, originRef.current.y, clientX, clientY, JOYSTICK_RADIUS, JOYSTICK_DEAD_ZONE);
    joystickVectorRef.current.x = vector.x;
    joystickVectorRef.current.z = vector.z;
    const knob = knobRef.current;
    if (knob) knob.style.transform = `translate3d(${vector.x * JOYSTICK_RADIUS}px, ${vector.z * JOYSTICK_RADIUS}px, 0)`;
  }

  function reset() {
    pointerIdRef.current = null;
    originRef.current = null;
    joystickVectorRef.current.x = 0;
    joystickVectorRef.current.z = 0;
    const knob = knobRef.current;
    if (knob) knob.style.transform = 'translate3d(0, 0, 0)';
  }

  function handleAction() {
    inspectSequenceRef.current += 1;
  }

  return (
    <div className={`mobile-controls${hidden ? ' is-hidden' : ''}`}>
      <div
        ref={baseRef}
        className="mobile-joystick"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
      >
        <div ref={knobRef} className="mobile-joystick-knob"></div>
      </div>
      <button type="button" className="mobile-action" aria-label="Inspecionar distrito mais próximo" onPointerDown={handleAction}>
        <span>INSPECIONAR</span>
      </button>
    </div>
  );
}