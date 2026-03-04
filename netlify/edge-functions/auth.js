const COOKIE_NAME = "sj_auth";
const LOGIN_PATH = "/login";

async function hashPassword(password) {
  const data = new TextEncoder().encode(password);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return btoa(String.fromCharCode(...new Uint8Array(hash)));
}

function getAuthCookie(request) {
  const cookieHeader = request.headers.get("Cookie") || "";
  for (const part of cookieHeader.split(";")) {
    const [k, ...v] = part.trim().split("=");
    if (k === COOKIE_NAME) return v.join("=");
  }
  return null;
}

function loginPage(error = false) {
  return new Response(
    `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>HBS Section J 2027</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      display: flex; align-items: center; justify-content: center;
      min-height: 100vh; background: #f5f5f5;
    }
    .card {
      background: white; padding: 2.5rem; border-radius: 8px;
      box-shadow: 0 2px 12px rgba(0,0,0,0.1); width: 100%; max-width: 360px;
      text-align: center;
    }
    h1 { font-size: 1.2rem; margin-bottom: 0.25rem; }
    p { color: #666; font-size: 0.9rem; margin-bottom: 1.5rem; }
    input {
      width: 100%; padding: 0.65rem 0.75rem; font-size: 1rem;
      border: 1px solid #ddd; border-radius: 4px; margin-bottom: 1rem; outline: none;
    }
    input:focus { border-color: #a51c30; }
    button {
      width: 100%; padding: 0.65rem; background: #a51c30; color: white;
      border: none; border-radius: 4px; font-size: 1rem; cursor: pointer;
    }
    button:hover { background: #8a1728; }
    .error { color: #a51c30; font-size: 0.85rem; margin-bottom: 0.75rem; }
  </style>
</head>
<body>
  <div class="card">
    <h1>HBS Section J 2027</h1>
    <p>Enter the section password to continue.</p>
    ${error ? '<div class="error">Incorrect password. Please try again.</div>' : ""}
    <form method="POST" action="/login">
      <input type="password" name="password" placeholder="Password" autofocus />
      <button type="submit">Enter</button>
    </form>
  </div>
</body>
</html>`,
    { status: error ? 401 : 200, headers: { "Content-Type": "text/html" } }
  );
}

export default async (request, context) => {
  const SITE_PASSWORD = Deno.env.get("SITE_PASSWORD");
  const url = new URL(request.url);

  if (url.pathname === LOGIN_PATH) {
    if (request.method === "POST") {
      try {
        const formData = await request.formData();
        const password = formData.get("password") || "";
        if (SITE_PASSWORD && password === SITE_PASSWORD) {
          const token = await hashPassword(SITE_PASSWORD);
          return new Response(null, {
            status: 302,
            headers: {
              Location: "/",
              "Set-Cookie": `${COOKIE_NAME}=${token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=604800`,
            },
          });
        }
      } catch {
        // fall through to show error
      }
      return loginPage(true);
    }
    return loginPage(false);
  }

  // Verify auth cookie on all other routes
  const token = getAuthCookie(request);
  if (SITE_PASSWORD && token) {
    const expected = await hashPassword(SITE_PASSWORD);
    if (token === expected) return context.next();
  }

  return new Response(null, {
    status: 302,
    headers: { Location: LOGIN_PATH },
  });
};

export const config = { path: "/*" };
