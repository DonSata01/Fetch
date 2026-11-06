// Relay tonto: solo reenvía a Bitget. No contiene lógica del usuario.
exports.handler = async (event) => {
  const cors = {
    "content-type": "application/json",
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "GET,OPTIONS",
    "access-control-allow-headers": "content-type",
    "cache-control": "no-store"
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: cors, body: "" };
  }

  const q = event.queryStringParameters || {};
  const symbol   = (q.symbol   || "BTCUSDT").toUpperCase();
  const interval = q.interval  || "1h";
  const limit    = q.limit     || "100";

  // Validación mínima (no es lógica de trading, solo sanidad)
  if (!/^[A-Z0-9]{4,20}$/.test(symbol)) {
    return { statusCode: 400, headers: cors, body: JSON.stringify({ error: "symbol inválido" }) };
  }
  const allowedIntervals = ["15m","30m","1h","2h","4h","12h","1d","3d","1w","2w","1M"];
  if (!allowedIntervals.includes(interval)) {
    return { statusCode: 400, headers: cors, body: JSON.stringify({ error: "interval inválido" }) };
  }
  const lim = Math.min(Math.max(parseInt(limit, 10) || 100, 1), 200);

  const url = `https://api.bitget.com/api/v2/spot/market/candles`
            + `?symbol=${encodeURIComponent(symbol)}`
            + `&interval=${encodeURIComponent(interval)}`
            + `&limit=${lim}`;

  try {
    const r = await fetch(url, {
      headers: { "User-Agent": "EvM-Relay/1.0", "Accept": "application/json" }
    });
    const body = await r.text();
    return { statusCode: r.status, headers: cors, body };
  } catch (e) {
    return {
      statusCode: 502,
      headers: cors,
      body: JSON.stringify({ error: "upstream_fail", detail: String(e) })
    };
  }
};