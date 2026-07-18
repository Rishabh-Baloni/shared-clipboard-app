export async function getNote(code, signal) {
  const res = await fetch(`/api/note?code=${encodeURIComponent(code)}`, {
    method: "GET",
    signal,
  });
  if (!res.ok) {
    throw new Error(`GET failed with status ${res.status}`);
  }
  const data = await res.json();
  return { text: typeof data?.text === "string" ? data.text : "" };
}

export async function saveNote(code, value, signal) {
  const res = await fetch(`/api/note?code=${encodeURIComponent(code)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: value.text ?? "" }),
    signal,
  });
  if (!res.ok) {
    throw new Error(`POST failed with status ${res.status}`);
  }
  return res.json();
}
