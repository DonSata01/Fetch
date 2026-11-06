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
  const symbol = (q.symbol || "BTCUSDT").toUpperCase();
  const interval = q.interval || "1h"; // Recibe 15m, 1h, 1d, etc.
  const limit = q.limit || "100";

  // Mapeo exacto a lo que espera Bitget v2 (parámetro: granularity)
  const bitgetGranularity = {
    "1m": "1min", "3m": "3min", "5m": "5min", "15m": "15min", "30m": "30min",
    "1h": "1h", "2h": "2h", "4h": "4h", "6h": "6h", "12h": "12h",
    "1d": "1day", "3d": "3day", "1w": "1week", "1M": "1M"
  };

  const granularity = bitgetGranularity[interval] || interval;

  // ¡CAMBIO CLAVE! El parámetro ahora es "granularity", no "interval"
  const url = `https://api.bitget.com/api/v2/spot/market/candles?symbol=${encodeURIComponent(symbol)}&granularity=${encodeURIComponent(granularity)}&limit=${limit}`;

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
