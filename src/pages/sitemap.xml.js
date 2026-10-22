import { sitemap } from '../feeds.mjs';

export const GET = () => new Response(sitemap(), { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
