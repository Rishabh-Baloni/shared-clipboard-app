import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN,
});

const CODE_PATTERN = /^[a-zA-Z0-9-]{1,64}$/;
const EMPTY = { text: "" };

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
      res.status(200).json({ text: toStr(data?.text ?? data?.col1) });
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
      const value = { text: toStr(body?.text) };
      await redis.set(keyFor(code), value);
      res.status(200).json({ ok: true });
      return;
    }

    res.setHeader("Allow", "GET, POST");
    res.status(405).json({ error: "Method not allowed." });
  } catch (err) {
    res.status(500).json({ error: "Storage unavailable." });
  }
}
