import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN,
});

const CODE_PATTERN = /^[a-zA-Z0-9-]{1,64}$/;
const EMPTY = { text: "", version: 0 };

function keyFor(code) {
  return `note:${code}`;
}

function toStr(value) {
  return typeof value === "string" ? value : value == null ? "" : String(value);
}

export default async function handler(req, res) {
  const code = req.query?.code;

  if (!code || Array.isArray(code) || !CODE_PATTERN.test(code)) {
    res.status(400).json({ error: "Invalid or missing room code." });
    return;
  }

  try {
    if (req.method === "GET") {
      const stored = await redis.get(keyFor(code));
      if (!stored) {
        res.status(200).json(EMPTY);
        return;
      }
      const data = typeof stored === "string" ? JSON.parse(stored) : stored;
      const text = toStr(data?.text ?? data?.col1);
      const version = typeof data?.version === "number" ? data.version : 0;
      res.status(200).json({ text, version });
      return;
    }

    if (req.method === "POST") {
    let body = req.body;
    if (typeof body === "string") {
      try {
        body = JSON.parse(body);
      } catch {
        body = {};
      }
    }
    
    const expectedVersion = typeof body?.version === "number" ? body.version : -1;
    const newText = toStr(body?.text);
    
    const key = keyFor(code);
    let retries = 3;
    
    while (retries > 0) {
      try {
        // Watch the key for changes
        await redis.watch(key);
        
        const stored = await redis.get(key);
        let currentVersion = 0;
        let currentText = "";
        
        if (stored) {
          const data = typeof stored === "string" ? JSON.parse(stored) : stored;
          currentText = toStr(data?.text ?? data?.col1);
          currentVersion = typeof data?.version === "number" ? data.version : 0;
        }
        
        if (expectedVersion === -1 || expectedVersion === currentVersion) {
          // Update is valid, increment version
          const nextVersion = currentVersion + 1;
          const newValue = { text: newText, version: nextVersion };
          
          // Use multi to execute atomically
          const multi = redis.multi();
          multi.set(key, newValue);
          await multi.exec();
          
          res.status(200).json({ ok: true, version: nextVersion });
          return;
        } else {
          // Stale update - send back current state
          await redis.unwatch();
          res.status(409).json({ 
            error: "Stale update", 
            currentState: { text: currentText, version: currentVersion } 
          });
          return;
        }
      } catch (err) {
        // If watch failed (key changed), retry
        retries--;
        if (retries === 0) throw err;
      }
    }
    return;
  }

    res.setHeader("Allow", "GET, POST");
    res.status(405).json({ error: "Method not allowed." });
  } catch (err) {
    res.status(500).json({ error: "Storage unavailable." });
  }
}
