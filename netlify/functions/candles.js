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
  let interval   = q.interval  || "1h"; // Recibimos el intervalo del HTML
  const limit    = q.limit     || "100";

  // TRADUCCIÓN DE INTERVALOS: El HTML envía 15m, 1h, 1d, etc.
  // Bitget v2 espera formatos específicos (ej. 1H, 1D, 15m, etc.)
  const bitgetIntervals = {
    "1m": "1m", "3m": "3m", "5m": "5m", "15m": "15m", "30m": "30m",
    "1h": "1H", "2h": "2H", "4h": "4H", "6h": "6H", "12h": "12H",
    "1d": "1D", "3d": "3D", "1w": "1W", "1M": "1M"
  };

  // Si el intervalo recibido está en nuestro diccionario, lo traducimos.
  // Si no, lo dejamos igual (por si acaso).
  const bitgetInterval = bitgetIntervals[interval] || interval;

  const url = `https://api.bitget.com/api/v2/spot/market/candles?symbol=${encodeURIComponent(symbol)}&interval=${encodeURIComponent(bitgetInterval)}&limit=${limit}`;

  try {
    const r = await fetch(url, {
      headers: { 
        "User-Agent": "EvM-Relay/1.0", 
        "Accept": "application/json" 
      }
    });
    
    const body = await r.text();
    
    // Devolvemos la respuesta de Bitget (sea éxito o error) con cabeceras CORS
    return { 
      statusCode: r.status, 
      headers: cors, 
      body 
    };
    
  } catch (e) {
    return {
      statusCode: 502,
      headers: cors,
      body: JSON.stringify({ error: "upstream_fail", detail: String(e) })
    };
  }
};
