import serverless from "serverless-http";
import app from "../../artifacts/api-server/src/app";

const rawHandler = serverless(app);

// Netlify redirects `/api/*` to `/.netlify/functions/api/:splat`, but
// depending on how the request reaches the function, `event.path` can show
// up either as the original `/api/...` path or as the rewritten
// `/.netlify/functions/api/...` path. The Express app's router is mounted
// at `/api`, so normalize the path here to guarantee Express always sees an
// `/api/...`-prefixed path (avoids silent 404s on every route).
export const handler = async (event: any, context: any) => {
  if (typeof event.path === "string" && event.path.startsWith("/.netlify/functions/api")) {
    const rest = event.path.slice("/.netlify/functions/api".length);
    event.path = `/api${rest}` || "/api";
  }
  return rawHandler(event, context);
};
