import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import CityExperience from '../src/components/city/CityExperience';
import { experiences } from '../src/data/resume';

vi.mock('../src/components/city/CityCanvas', () => ({
  default: ({ mode }: { mode: string }) => <div data-testid="city-canvas">Canvas {mode}</div>,
}));

function mockWebGL(available: boolean) {
  return vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(() => {
    if (!available) return null;
    return { getExtension: () => ({ loseContext: vi.fn() }) } as unknown as WebGL2RenderingContext;
  });
}

describe('CityExperience', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('presents the 3D atlas and three immediate entry paths', async () => {
    const contextSpy = mockWebGL(true);
    render(<CityExperience experiences={experiences} />);

    expect(screen.getByRole('heading', { level: 1, name: /Sistemas sob/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Tour de 90 segundos' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Explorar livremente' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Ver currículo textual/i })).toHaveAttribute('href', '#curriculo');
    expect(screen.getByRole('link', { name: 'WhatsApp' })).toHaveAttribute('href', 'https://wa.me/5587988271297');
    await waitFor(() => expect(screen.getByTestId('city-canvas')).toBeInTheDocument());
    contextSpy.mockRestore();
  });

  it('opens a first-run tutorial and keeps fast travel available', async () => {
    const contextSpy = mockWebGL(true);
    render(<CityExperience experiences={experiences} />);

    fireEvent.click(screen.getByRole('button', { name: 'Explorar livremente' }));
    expect(screen.getByRole('dialog', { name: 'Como explorar o atlas' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Começar a explorar' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'EVENTS' })).toBeInTheDocument();
    expect(window.localStorage.getItem('backend-city:tutorial:v1')).toBe('complete');
    contextSpy.mockRestore();
  });

  it('shows career, Engineering Core and AI blueprint dossiers', () => {
    const contextSpy = mockWebGL(false);
    render(<CityExperience experiences={experiences} />);

    fireEvent.click(screen.getByRole('button', { name: 'Explorar livremente' }));
    fireEvent.click(screen.getByRole('button', { name: 'Começar a explorar' }));
    fireEvent.click(screen.getByRole('button', { name: 'EVENTS' }));
    expect(screen.getByRole('heading', { name: 'PLUXXE' })).toBeInTheDocument();
    expect(screen.getByText(/Plataforma fiscal orientada a eventos/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'CORE' }));
    expect(screen.getByRole('heading', { name: 'ENGINEERING CORE' })).toBeInTheDocument();
    expect(screen.getAllByText(/Java · Kotlin · Spring Boot/i).length).toBeGreaterThanOrEqual(1);

    fireEvent.click(screen.getByRole('button', { name: 'AI R&D' }));
    expect(screen.getByRole('heading', { name: 'AI R&D ZONE' })).toBeInTheDocument();
    expect(screen.getAllByText(/blueprint/i).length).toBeGreaterThan(0);
    contextSpy.mockRestore();
  });

  it('starts, pauses and exits the guided tour', () => {
    const contextSpy = mockWebGL(false);
    render(<CityExperience experiences={experiences} />);

    fireEvent.click(screen.getByRole('button', { name: 'Tour de 90 segundos' }));
    expect(screen.getByRole('heading', { name: 'De cinco horas para doze minutos' })).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuemax', '90');
    fireEvent.click(screen.getByRole('button', { name: 'Pausar' }));
    expect(screen.getByRole('button', { name: 'Continuar' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Sair do tour' }));
    expect(screen.getByRole('heading', { name: 'CASSEMS' })).toBeInTheDocument();
    contextSpy.mockRestore();
  });

  it('keeps the atlas usable when WebGL is unavailable', async () => {
    const contextSpy = mockWebGL(false);
    render(<CityExperience experiences={experiences} />);

    await waitFor(() => expect(screen.getByText(/WebGL indisponível/i)).toBeInTheDocument());
    expect(screen.getByRole('button', { name: 'Tour de 90 segundos' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /currículo textual/i })).toBeInTheDocument();
    contextSpy.mockRestore();
  });

  it('offers an accessible exit from 3D navigation to the main resume', () => {
    const contextSpy = mockWebGL(false);
    render(<><CityExperience experiences={experiences} /><div id="curriculo">Currículo principal</div></>);

    fireEvent.click(screen.getByRole('button', { name: 'Explorar livremente' }));
    fireEvent.click(screen.getByRole('button', { name: 'Começar a explorar' }));
    expect(screen.getByRole('button', { name: 'Fechar navegação 3D e abrir currículo principal' })).toBeInTheDocument();
    contextSpy.mockRestore();
  });
});
