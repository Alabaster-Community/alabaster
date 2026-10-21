import { ics } from '../feeds.mjs';

export const GET = () => new Response(ics(), { headers: { 'Content-Type': 'text/calendar; charset=utf-8' } });
