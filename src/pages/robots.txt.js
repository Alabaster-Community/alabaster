import { robots } from '../feeds.mjs';

export const GET = () => new Response(robots(), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
