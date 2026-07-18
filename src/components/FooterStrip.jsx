import { Smartphone, Clock, Code2 } from "lucide-react";

function relativeTime(lastSavedAt, now) {
  if (!lastSavedAt) return "not saved yet";
  const seconds = Math.max(0, Math.floor((now - lastSavedAt) / 1000));
  if (seconds < 1) return "just now";
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}

export default function FooterStrip({ lastSavedAt, now }) {
  return (
    <footer className="flex flex-col gap-2 border-t border-neutral-200 pt-4 text-xs text-neutral-500 dark:border-neutral-800 dark:text-neutral-400 sm:flex-row sm:items-center sm:gap-6">
      <span className="inline-flex items-center gap-1.5">
        <Smartphone size={14} />
        Works across devices
      </span>
      <span className="inline-flex items-center gap-1.5">
        <Clock size={14} />
        Auto-saved · updated {relativeTime(lastSavedAt, now)}
      </span>
      <span className="inline-flex items-center gap-1.5 sm:ml-auto">
        <Code2 size={14} />
        Built by Rishabh Baloni
      </span>
    </footer>
  );
}
