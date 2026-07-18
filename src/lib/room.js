const CODE_PATTERN = /^[a-zA-Z0-9-]{1,64}$/;

export function isValidCode(code) {
  return typeof code === "string" && CODE_PATTERN.test(code);
}

export function generateCode() {
  const hex = Math.floor(Math.random() * 0xffff)
    .toString(16)
    .padStart(4, "0");
  return `note-${hex}`;
}

export function readHashCode() {
  const raw = window.location.hash.replace(/^#/, "").trim();
  return isValidCode(raw) ? raw : null;
}

export function writeHashCode(code, { replace = false } = {}) {
  const target = `#${code}`;
  if (window.location.hash === target) return;
  if (replace) {
    const url = `${window.location.pathname}${window.location.search}${target}`;
    window.history.replaceState(null, "", url);
  } else {
    window.location.hash = code;
  }
}

export function shareUrl(code) {
  return `${window.location.origin}${window.location.pathname}#${code}`;
}
