import { expect, test } from '@playwright/test';

async function disableWebGL(page: import('@playwright/test').Page) {
  await page.addInitScript(() => {
    HTMLCanvasElement.prototype.getContext = () => null;
  });
}

test('presents the 3D atlas as the primary first viewport', async ({ page }) => {
  await page.goto('./');

  await expect(page.getByRole('heading', { level: 1 })).toContainText('Sistemas sob');
  await expect(page.getByText('5h → 12min').first()).toBeVisible();
  await expect(page.getByText('200K+').first()).toBeVisible();
  await expect(page.getByRole('button', { name: 'Tour de 90 segundos' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Explorar livremente' })).toBeVisible();
  await expect(page.getByRole('link', { name: /Ver currículo textual/i })).toBeVisible();
  await expect(page.locator('.world-hero')).toHaveCSS('min-height', /.+/);

  const faviconUrl = await page.locator('link[rel="icon"]').getAttribute('href');
  expect((await page.request.get(faviconUrl!)).ok()).toBe(true);
});

test('runs the guided tour and exposes deterministic controls', async ({ page }) => {
  await disableWebGL(page);
  await page.goto('./');
  await page.getByRole('button', { name: 'Tour de 90 segundos' }).click();

  await expect(page.getByRole('heading', { name: 'De cinco horas para doze minutos' })).toBeVisible();
  await expect(page.getByRole('progressbar')).toHaveAttribute('aria-valuemax', '90');
  await page.getByRole('button', { name: 'Pausar' }).click();
  await expect(page.getByRole('button', { name: 'Continuar' })).toBeVisible();
  await page.getByRole('button', { name: 'Próximo →' }).click();
  await expect(page.getByRole('heading', { name: 'Integrações em escala operacional' })).toBeVisible();
  await page.getByRole('button', { name: 'Sair do tour' }).click();
  await expect(page.locator('.landmark-dossier').getByRole('heading', { name: 'CASSEMS' })).toBeVisible();
});

test('shows tutorial once and lets visitors inspect future AI blueprint', async ({ page, isMobile }) => {
  await disableWebGL(page);
  await page.goto('./');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.getByRole('button', { name: 'Explorar livremente' }).click();

  await expect(page.getByRole('dialog', { name: 'Como explorar o atlas' })).toBeVisible();
  await page.getByRole('button', { name: 'Começar a explorar' }).click();
  await expect(page.getByRole('dialog')).toBeHidden();
  await page.getByRole('button', { name: 'AI R&D' }).click();
  await expect(page.getByRole('heading', { name: 'AI R&D ZONE' })).toBeVisible();
  if (isMobile) await page.getByRole('button', { name: /Expandir detalhes/i }).click();
  await expect(page.getByText(/Ativação somente com cases/i)).toBeVisible();

  await page.getByRole('button', { name: 'Visão geral' }).click();
  await page.getByRole('button', { name: 'Explorar livremente' }).click();
  await expect(page.getByRole('dialog')).toBeHidden();
  await page.getByRole('button', { name: /Como explorar/ }).click();
  await expect(page.getByRole('dialog', { name: 'Como explorar o atlas' })).toBeVisible();
});

test('initializes WebGL without console errors on supported desktop', async ({ page, isMobile }) => {
  test.skip(isMobile, 'desktop WebGL verification');
  const errors: string[] = [];
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  await page.goto('./');

  await expect(page.locator('.world-canvas canvas')).toBeVisible();
  const hasContext = await page.locator('.world-canvas canvas').evaluate((canvas) =>
    Boolean((canvas as HTMLCanvasElement).getContext('webgl2') || (canvas as HTMLCanvasElement).getContext('webgl')),
  );
  expect(hasContext).toBe(true);
  await page.getByRole('button', { name: 'Explorar livremente' }).click();
  if (await page.getByRole('dialog').isVisible()) await page.getByRole('button', { name: 'Começar a explorar' }).click();
  await expect(page.locator('.canvas-shell')).toBeFocused();
  await page.locator('.canvas-shell').press('KeyW');
  await page.waitForTimeout(250);
  await page.getByRole('button', { name: 'EVENTS' }).click();
  await expect(page.locator('.landmark-dossier').getByRole('heading', { name: 'PLUXXE' })).toBeVisible();
  expect(errors).toEqual([]);
});

test('closes 3D navigation and focuses the main resume', async ({ page }) => {
  await disableWebGL(page);
  await page.goto('./');
  await page.evaluate(() => localStorage.setItem('backend-city:tutorial:v1', 'complete'));
  await page.getByRole('button', { name: 'Explorar livremente' }).click();

  await page.getByRole('button', { name: 'Fechar navegação 3D e abrir currículo principal' }).click();
  await expect(page.locator('#curriculo')).toBeFocused();
  await expect(page.locator('#curriculo')).toBeInViewport();
});

test('displays project seniority only for CASSEMS', async ({ page }) => {
  await disableWebGL(page);
  await page.goto('./#experiencia');
  const timeline = page.locator('#experiencia');

  await expect(timeline.locator('#experiencia-cassems')).toContainText('Engenheiro de Software Sênior');
  await expect(timeline.locator('#experiencia-pluxxe')).not.toContainText(/Sênior|Senior/);
  await expect(timeline.locator('#experiencia-visavale')).not.toContainText(/Sênior|Senior/);
});

test('offers direct and practical WhatsApp contact', async ({ page }) => {
  await disableWebGL(page);
  await page.goto('./#contato');

  const contact = page.locator('#contato');
  await expect(contact.getByRole('heading', { name: /Vamos conversar/i })).toBeVisible();
  await expect(contact.getByText('+55 87 98827-1297')).toBeVisible();
  await expect(contact.getByRole('link', { name: /Chamar no WhatsApp/i })).toHaveAttribute('href', 'https://wa.me/5587988271297');
});

test('remains usable and free of horizontal overflow on mobile', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'mobile project only');
  await page.goto('./');

  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Tour de 90 segundos' })).toBeVisible();
  await page.getByRole('button', { name: 'Explorar livremente' }).click();
  if (await page.getByRole('dialog').isVisible()) {
    await expect(page.getByText(/Toque nos prédios/i)).toBeVisible();
    await page.getByRole('button', { name: 'Começar a explorar' }).click();
  }
  await page.getByRole('button', { name: 'CORE' }).click();
  await expect(page.getByRole('heading', { name: 'ENGINEERING CORE' })).toBeVisible();
  const expandDossier = page.getByRole('button', { name: /Expandir detalhes/i });
  await expect(expandDossier).toBeVisible();
  await expandDossier.click();
  await expect(page.getByRole('button', { name: /Fechar detalhes/i })).toBeVisible();
  const travelButtons = page.locator('.world-fast-travel > div');
  await expect(travelButtons).toHaveCSS('overflow-x', 'auto');
  const layout = await page.evaluate(() => ({
    documentOverflow: document.documentElement.scrollWidth - window.innerWidth,
  }));
  const scrolled = await travelButtons.evaluate((element) => {
    element.scrollLeft = element.scrollWidth;
    return element.scrollLeft;
  });
  expect(layout.documentOverflow).toBeLessThanOrEqual(1);
  expect(scrolled).toBeGreaterThan(0);
});
