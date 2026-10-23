const SUPABASE_PIXEL_URL = 'https://jolqnoslbedigqdvznzk.supabase.co/functions/v1/pixel-code';

export const onRequest: PagesFunction = async ({ request }) => {
  if (request.method !== 'GET') return new Response('Method not allowed.', { status: 405 });
  const incoming = new URL(request.url);
  const target = new URL(SUPABASE_PIXEL_URL);
  for (const name of ['id', 'event', 'page_url', 'favicon_url', 'click_id', 'ts']) {
    const value = incoming.searchParams.get(name);
    if (value) target.searchParams.set(name, value);
  }
  try {
    const response = await fetch(target, {
      redirect: 'manual',
      signal: AbortSignal.timeout(10000),
      headers: {
        Referer: request.headers.get('Referer') || new URL(request.url).origin + '/',
        'User-Agent': request.headers.get('User-Agent') || 'AffiPro demo pixel proxy',
      },
    });
    if (response.status >= 300 && response.status < 400) return new Response(null, { status: 502 });
    return new Response(null, { status: response.ok ? 204 : response.status, headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return new Response(null, { status: 503, headers: { 'Cache-Control': 'no-store' } });
  }
};
