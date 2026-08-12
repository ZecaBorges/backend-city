import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

const repository = process.env.GITHUB_REPOSITORY?.split('/')[1];
const isGitHubPages = Boolean(process.env.GITHUB_ACTIONS && repository);
const configuredBase = process.env.PUBLIC_BASE_PATH;

export default defineConfig({
  site: isGitHubPages
    ? `https://${process.env.GITHUB_REPOSITORY_OWNER}.github.io`
    : 'http://localhost:4321',
  base: configuredBase ?? (isGitHubPages ? `/${repository}` : '/'),
  integrations: [react()],
  output: 'static',
});
