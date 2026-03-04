export default async (request, context) => {
  const SITE_PASSWORD = Deno.env.get("SITE_PASSWORD");
  const authHeader = request.headers.get("Authorization");

  if (authHeader && authHeader.startsWith("Basic ")) {
    try {
      const decoded = atob(authHeader.slice(7).trim());
      const colonIndex = decoded.indexOf(":");
      const password = colonIndex >= 0 ? decoded.slice(colonIndex + 1) : decoded;
      if (SITE_PASSWORD && password === SITE_PASSWORD) {
        return context.next();
      }
    } catch {
      // malformed base64, fall through to 401
    }
  }

  return new Response("Unauthorized", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="HBS Section J 2027"',
    },
  });
};

export const config = { path: "/*" };
