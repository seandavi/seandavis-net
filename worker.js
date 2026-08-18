// Canonical-host redirect + static assets for seandavis.net.
// Workers Static Assets `_redirects` only supports relative URLs (the
// host-based syntax is a Pages-only feature), so host-based rules live here
// instead. Everything else falls through to the assets in dist/.

// cancerdatasci.org has no site of its own — it is the operational home for the
// data-infrastructure subdomains (cfde-atlas, docs.omicidx, store, …), and its
// apex is attached to this Worker purely to land visitors on the directory that
// lists them. Subdomains keep their own DNS records and are unaffected.
const CDSCI_HOSTS = new Set(['cancerdatasci.org', 'www.cancerdatasci.org']);

export default {
  fetch(request, env) {
    const url = new URL(request.url);

    if (url.hostname === 'www.seandavis.net') {
      url.hostname = 'seandavis.net';
      return Response.redirect(url.toString(), 301);
    }

    if (CDSCI_HOSTS.has(url.hostname)) {
      return Response.redirect('https://seandavis.net/projects/', 301);
    }

    return env.ASSETS.fetch(request);
  },
};
