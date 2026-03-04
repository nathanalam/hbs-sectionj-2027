export default async (request, context) => {
  const SITE_PASSWORD = Deno.env.get("SITE_PASSWORD");
  const authHeader = request.headers.get("Authorization");

  if (authHeader && authHeader.startsWith("Basic ")) {
    const credentials = atob(authHeader.slice(7));
    const password = credentials.split(":").slice(1).join(":");
    if (password === SITE_PASSWORD) {
      return context.next();
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
