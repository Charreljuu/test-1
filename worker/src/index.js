const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", ...CORS_HEADERS },
  });
}

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }
    if (request.method !== "GET") {
      return json({ error: "method not allowed" }, 405);
    }

    const url = new URL(request.url);
    if (url.pathname !== "/api/cities") {
      return json({ error: "not found" }, 404);
    }

    const q = (url.searchParams.get("q") ?? "").trim();
    if (!q) {
      return json({ error: "missing query param 'q'" }, 400);
    }

    const { results } = await env.DB.prepare(
      `SELECT id, city, city_ascii, lat, lon, admin_name, population, name_cn, country_cn, admin_cn
       FROM cities
       WHERE city = ? COLLATE NOCASE
          OR city_ascii = ? COLLATE NOCASE
          OR name_cn = ? COLLATE NOCASE
       LIMIT 50`
    )
      .bind(q, q, q)
      .all();

    return json({ results });
  },
};
