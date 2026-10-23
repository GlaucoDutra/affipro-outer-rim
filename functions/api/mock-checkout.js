const AFFIPRO_TEST_CONVERSION_URL = 'https://jolqnoslbedigqdvznzk.supabase.co/functions/v1/record-conversion';
const OFFERS = {
  'galaxy-explorer': { amount: 249, event_type: 'sale', currency: 'USD' },
  'tatooine-essentials': { amount: 79, event_type: 'sale', currency: 'USD' },
};

export async function onRequestPost({ request, env }) {
  if (!env.AFFIPRO_CONVERSION_TOKEN) return Response.json({ error: 'This mock checkout is not configured yet.' }, { status: 503 });
  let body;
  try { body = await request.json(); } catch { return Response.json({ error: 'Invalid checkout request.' }, { status: 400 }); }
  const offer = OFFERS[body?.offer];
  const clickId = typeof body?.click_id === 'string' ? body.click_id.trim() : '';
  const orderId = typeof body?.merchant_order_id === 'string' ? body.merchant_order_id.trim() : '';
  if (!offer || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(clickId)
    || !/^DEMO-OUTER-[0-9a-f-]{36}$/i.test(orderId)) {
    return Response.json({ error: 'Open this mock checkout from an AffiPro tracking link and try again.' }, { status: 400 });
  }
  const result = await fetch(AFFIPRO_TEST_CONVERSION_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-affipro-conversion-token': env.AFFIPRO_CONVERSION_TOKEN },
    body: JSON.stringify({ click_id: clickId, merchant_order_id: orderId, amount: offer.amount, currency: offer.currency, event_type: offer.event_type }),
  });
  const payload = await result.json().catch(() => ({}));
  if (!result.ok || !payload.ok) return Response.json({ error: payload.error || 'AffiPro could not attribute this demo booking.' }, { status: result.status === 401 ? 503 : result.status });
  return Response.json({ ok: true, duplicate: Boolean(payload.duplicate), conversion_id: payload.conversion_id }, { status: result.status });
}
