// Canonical-host redirect + static assets for seandavis.net.
// Workers Static Assets `_redirects` only supports relative URLs (the
// host-based syntax is a Pages-only feature), so the www → apex 301 lives
// here instead. Everything else falls through to the assets in dist/.
export default {
  fetch(request, env) {
    const url = new URL(request.url);
    if (url.hostname === 'www.seandavis.net') {
      url.hostname = 'seandavis.net';
      return Response.redirect(url.toString(), 301);
    }
    return env.ASSETS.fetch(request);
  },
};
