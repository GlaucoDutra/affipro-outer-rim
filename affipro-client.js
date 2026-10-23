(function () {
  var script = document.currentScript;
  var key = script && new URL(script.src, location.href).searchParams.get('id');
  if (!key) return;
  var names = ['click_id', 'affipro_click_id', 'cid'];
  var clickName = 'affipro_click_id';
  var confirmedName = 'affipro_confirmed_click_id';
  var ttl = 2592000;
  function cookie(name) {
    var item = document.cookie.split('; ').find(function (part) { return part.indexOf(name + '=') === 0; });
    if (!item) return '';
    try { return decodeURIComponent(item.slice(name.length + 1)); } catch (_) { return ''; }
  }
  function store(name, value) {
    document.cookie = name + '=' + encodeURIComponent(value) + '; Max-Age=' + ttl + '; Path=/; SameSite=Lax; Secure';
    try { localStorage.setItem(name, value); } catch (_) {}
  }
  function stored(name) { try { return localStorage.getItem(name) || ''; } catch (_) { return ''; } }
  function cleanUrl() {
    var url = new URL(location.href);
    names.forEach(function (name) { url.searchParams.delete(name); });
    url.hash = '';
    return url.origin + url.pathname + url.search;
  }
  function send(event, values) {
    var url = new URL('/x', location.origin);
    url.searchParams.set('id', key);
    url.searchParams.set('event', event);
    url.searchParams.set('page_url', cleanUrl());
    url.searchParams.set('ts', new Date().toISOString());
    Object.keys(values || {}).forEach(function (name) { if (values[name]) url.searchParams.set(name, values[name]); });
    var image = new Image(1, 1);
    image.src = url.toString();
  }
  var query = new URL(location.href).searchParams;
  var click = names.map(function (name) { return query.get(name) || ''; }).find(Boolean) || '';
  if (click) store(clickName, click);
  var favicon = document.querySelector('link[rel="icon"]');
  send('valid_page', { favicon_url: favicon && favicon.href || location.origin + '/favicon.ico' });
  click = click || cookie(clickName) || stored(clickName);
  if (/^[0-9a-f-]{36}$/i.test(click) && cookie(confirmedName) !== click && stored(confirmedName) !== click) {
    send('confirmed_click', { click_id: click });
    store(confirmedName, click);
  }
})();
