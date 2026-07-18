import { useEffect, useState } from "react";
import { Hash, Link as LinkIcon, Copy, Check } from "lucide-react";
import { shareUrl } from "../lib/room.js";

export default function InfoStrip({ code, onChangeRoom }) {
  const [draft, setDraft] = useState(code);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setDraft(code);
  }, [code]);

  const url = code ? shareUrl(code) : "";

  const commit = () => {
    if (draft && draft !== code) onChangeRoom(draft);
    else setDraft(code);
  };

  const copyLink = async () => {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable; ignore */
    }
  };

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <div className="flex items-center gap-2.5 rounded-card border border-neutral-200 bg-white px-3.5 py-2.5 dark:border-neutral-800 dark:bg-neutral-900 sm:w-56">
        <Hash size={16} className="shrink-0 text-neutral-400" />
        <div className="min-w-0 flex-1">
          <div className="text-xs text-neutral-500 dark:text-neutral-400">Room</div>
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === "Enter") e.currentTarget.blur();
            }}
            spellCheck={false}
            aria-label="Room code"
            className="w-full border-0 bg-transparent p-0 font-mono text-sm text-neutral-900 outline-none placeholder:text-neutral-400 dark:text-neutral-100"
            placeholder="room-code"
          />
        </div>
      </div>

      <div className="flex flex-1 items-center gap-2.5 rounded-card border border-neutral-200 bg-white px-3.5 py-2.5 dark:border-neutral-800 dark:bg-neutral-900">
        <LinkIcon size={16} className="shrink-0 text-accent" />
        <div className="min-w-0 flex-1">
          <div className="text-xs text-neutral-500 dark:text-neutral-400">
            Share link
          </div>
          <div className="truncate font-mono text-sm text-neutral-700 dark:text-neutral-300">
            {url || "—"}
          </div>
        </div>
        <button
          type="button"
          onClick={copyLink}
          aria-label="Copy share link"
          className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-control border transition-colors ${
            copied
              ? "border-success/20 bg-success-soft text-success dark:border-success/30 dark:bg-success/10"
              : "border-neutral-200 text-neutral-500 hover:bg-neutral-100 dark:border-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-800"
          }`}
        >
          {copied ? <Check size={16} /> : <Copy size={16} />}
        </button>
      </div>
    </div>
  );
}
