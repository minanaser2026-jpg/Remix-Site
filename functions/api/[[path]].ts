// Cloudflare Pages Function: proxies /api/* to the existing, already-working
// Netlify Function (Express API + Postgres session store). This lets us
// serve the static frontend from a *.pages.dev domain (to test whether it's
// reachable on networks that block *.netlify.app) without having to port
// the Express app to the Workers runtime.
//
// The session cookie set by the Express app has no explicit `Domain`
// attribute, so when this proxy relays the Netlify response's `Set-Cookie`
// header back to the browser, the browser correctly scopes it to whichever
// origin it actually talked to (the Pages domain) — auth/login keeps working.
const ORIGIN = "https://workspaceapi-server-production-eac4.up.railway.app";

export const onRequest: PagesFunction = async ({ request }) => {
  const url = new URL(request.url);
  const targetUrl = `${ORIGIN}${url.pathname}${url.search}`;

  const forwardHeaders = new Headers(request.headers);
  forwardHeaders.delete("host");
  forwardHeaders.set("x-forwarded-host", url.host);
  forwardHeaders.set("x-forwarded-proto", "https");

  const init: RequestInit = {
    method: request.method,
    headers: forwardHeaders,
    redirect: "manual",
  };
  if (request.method !== "GET" && request.method !== "HEAD") {
    init.body = await request.arrayBuffer();
  }

  const upstream = await fetch(targetUrl, init);

  // `fetch()` transparently decompresses the upstream response body, but the
  // original `Content-Encoding`/`Content-Length` headers still describe the
  // *compressed* payload. Forwarding them as-is makes the browser think it
  // received a corrupt/mismatched body and it aborts the request as a
  // generic network error — strip them so the runtime recomputes correct
  // framing for the (already decoded) body we're relaying.
  const responseHeaders = new Headers(upstream.headers);
  responseHeaders.delete("content-encoding");
  responseHeaders.delete("content-length");

  return new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: responseHeaders,
  });
};
