export async function getNote(code, signal) {
  const res = await fetch(`/api/note?code=${encodeURIComponent(code)}`, {
    method: "GET",
    signal,
  });
  if (!res.ok) {
    throw new Error(`GET failed with status ${res.status}`);
  }
  const data = await res.json();
  return { 
    text: typeof data?.text === "string" ? data.text : "", 
    version: typeof data?.version === "number" ? data.version : 0 
  };
}

export async function saveNote(code, value, signal) {
  const res = await fetch(`/api/note?code=${encodeURIComponent(code)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ 
      text: value.text ?? "", 
      version: value.version ?? -1 
    }),
    signal,
  });
  const data = await res.json();
  if (!res.ok) {
    return data;
  }
  return data;
}
