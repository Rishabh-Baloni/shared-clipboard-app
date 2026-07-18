import { useRef, useState, useEffect } from "react";
import { Copy, Check, ClipboardPaste, Trash2 } from "lucide-react";

export default function ColumnCard({
  name,
  value,
  onChange,
  onFocus,
  onBlur,
  onClear,
}) {
  const [copied, setCopied] = useState(false);
  const [pasted, setPasted] = useState(false);
  const [hint, setHint] = useState("");
  const textareaRef = useRef(null);
  const prevValueRef = useRef(value);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      showHint("Clipboard access blocked");
    }
  };

  const showHint = (message) => {
    setHint(message);
    setTimeout(() => setHint(""), 2500);
  };

  const paste = async () => {
    let clip;
    try {
      clip = await navigator.clipboard.readText();
    } catch {
      showHint("Clipboard access blocked");
      return;
    }
    if (!clip) return;

    const el = textareaRef.current;
    let next;
    let caret;
    if (!value) {
      next = clip;
      caret = clip.length;
    } else if (el && document.activeElement === el) {
      const start = el.selectionStart ?? value.length;
      const end = el.selectionEnd ?? value.length;
      next = value.slice(0, start) + clip + value.slice(end);
      caret = start + clip.length;
    } else {
      next = value + clip;
      caret = next.length;
    }

    onChange(next);
    setPasted(true);
    setTimeout(() => setPasted(false), 1500);

    if (el) {
      requestAnimationFrame(() => {
        el.focus();
        try {
          el.setSelectionRange(caret, caret);
        } catch {
          /* ignore */
        }
      });
    }
  };

  useEffect(() => {
    const el = textareaRef.current;
    if (!el || value === prevValueRef.current) return;

    if (document.activeElement === el) {
      const { selectionStart, selectionEnd } = el;
      const newValueLength = value.length;
      const oldValueLength = prevValueRef.current.length;
      
      // Try to preserve cursor position as best as possible
      let newStart = Math.min(selectionStart, newValueLength);
      let newEnd = Math.min(selectionEnd, newValueLength);
      
      // If text was added at the end, keep cursor at end
      if (value.startsWith(prevValueRef.current)) {
        newStart = newEnd = newValueLength;
      }
      
      prevValueRef.current = value;
      
      requestAnimationFrame(() => {
        try {
          el.setSelectionRange(newStart, newEnd);
        } catch {
          /* ignore */
        }
      });
    } else {
      prevValueRef.current = value;
    }
  }, [value]);

  return (
    <section className="flex h-full min-h-[40vh] flex-col rounded-card border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900 md:min-h-0">
      <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-2 border-b border-neutral-200 px-4 py-3 dark:border-neutral-800">
        <div className="flex min-w-0 items-baseline gap-2">
          <h2 className="text-sm font-medium">{name}</h2>
          <span className="shrink-0 text-xs text-neutral-400">
            {value.length} chars
          </span>
          {hint && (
            <span className="truncate text-xs text-neutral-400">· {hint}</span>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <button
            type="button"
            onClick={copy}
            className={`inline-flex items-center gap-1.5 rounded-control border px-2.5 py-1 text-sm transition-colors ${
              copied
                ? "border-success/20 bg-success-soft text-success dark:border-success/30 dark:bg-success/10"
                : "border-neutral-200 text-neutral-600 hover:bg-neutral-100 dark:border-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-800"
            }`}
          >
            {copied ? <Check size={15} /> : <Copy size={15} />}
            {copied ? "Copied" : "Copy"}
          </button>
          <button
            type="button"
            onClick={paste}
            className={`inline-flex items-center gap-1.5 rounded-control border px-2.5 py-1 text-sm transition-colors ${
              pasted
                ? "border-success/20 bg-success-soft text-success dark:border-success/30 dark:bg-success/10"
                : "border-neutral-200 text-neutral-600 hover:bg-neutral-100 dark:border-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-800"
            }`}
          >
            {pasted ? <Check size={15} /> : <ClipboardPaste size={15} />}
            {pasted ? "Pasted" : "Paste"}
          </button>
          <button
            type="button"
            onClick={onClear}
            aria-label={`Clear ${name}`}
            className="inline-flex h-7 w-7 items-center justify-center rounded-control border border-neutral-200 text-neutral-500 hover:bg-neutral-100 dark:border-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-800"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={onFocus}
        onBlur={onBlur}
        spellCheck={false}
        placeholder="Paste or type here…"
        className="min-h-[120px] w-full flex-1 resize-none overflow-auto border-0 bg-transparent px-4 py-3 font-mono text-sm leading-relaxed text-neutral-900 outline-none placeholder:text-neutral-400 dark:text-neutral-100"
      />
    </section>
  );
}
