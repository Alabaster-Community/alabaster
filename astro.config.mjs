import { defineConfig } from 'astro/config';

// Static site. Vercel builds it with `astro build`; the forms run as Vercel functions in api/.
export default defineConfig({
  site: 'https://alabasterchurch.org',
  build: { format: 'directory' },
  devToolbar: { enabled: false }
});
