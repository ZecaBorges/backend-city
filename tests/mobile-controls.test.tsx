import { fireEvent, render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import MobileControls from '../src/components/city/MobileControls';
import type { Position2D } from '../src/game/movement';

function refs() {
  const joystickVectorRef = { current: { x: 0, z: 0 } } as { current: Position2D };
  const inspectSequenceRef = { current: 0 } as { current: number };
  return { joystickVectorRef, inspectSequenceRef, hidden: false };
}

describe('MobileControls', () => {
  it('updates the joystick vector and knob while dragging, resetting on release', () => {
    const refsProps = refs();
    render(<MobileControls {...refsProps} />);

    const knob = document.querySelector('.mobile-joystick-knob') as HTMLElement;
    const base = document.querySelector('.mobile-joystick') as HTMLElement;

    fireEvent.pointerDown(base, { pointerId: 1, clientX: 16, clientY: 0 });
    fireEvent.pointerMove(base, { pointerId: 1, clientX: 32, clientY: 0 });
    expect(refsProps.joystickVectorRef.current).toEqual({ x: 1, z: 0 });
    expect(knob.style.transform).toContain('translate3d(32px, 0px, 0');

    fireEvent.pointerUp(base, { pointerId: 1 });
    expect(refsProps.joystickVectorRef.current).toEqual({ x: 0, z: 0 });
    expect(knob.style.transform).toBe('translate3d(0, 0, 0)');
  });

  it('increments the inspect sequence when the action button is pressed', () => {
    const refsProps = refs();
    const { getByRole } = render(<MobileControls {...refsProps} />);

    const action = getByRole('button', { name: /Inspecionar distrito mais próximo/i });
    fireEvent.pointerDown(action, { pointerId: 2 });
    expect(refsProps.inspectSequenceRef.current).toBe(1);
  });
});