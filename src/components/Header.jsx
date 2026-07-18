import {
  Clipboard,
  CloudUpload,
  CloudOff,
  CloudCheck,
  Sun,
  Moon,
  Monitor,
} from "lucide-react";

function StatusPill({ status }) {
  if (status === "saving") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-control border border-neutral-200 bg-neutral-100 px-3 py-1 text-sm text-neutral-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400">
        <CloudUpload size={16} />
        Saving…
      </span>
    );
  }
  if (status === "reconnecting") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-control border border-neutral-200 bg-neutral-100 px-3 py-1 text-sm text-neutral-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400">
        <CloudOff size={16} />
        Reconnecting…
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-control border border-success/20 bg-success-soft px-3 py-1 text-sm font-medium text-success dark:border-success/30 dark:bg-success/10">
      <CloudCheck size={16} />
      Synced
    </span>
  );
}

function ThemeToggle({ theme, onCycle }) {
  const icon =
    theme === "light" ? (
      <Sun size={16} />
    ) : theme === "dark" ? (
      <Moon size={16} />
    ) : (
      <Monitor size={16} />
    );
  const label =
    theme === "light"
      ? "Light theme"
      : theme === "dark"
        ? "Dark theme"
        : "System theme";
  return (
    <button
      type="button"
      onClick={onCycle}
      title={label}
      aria-label={`Theme: ${label}. Click to change.`}
      className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-control border border-neutral-200 text-neutral-500 transition-colors hover:bg-neutral-100 dark:border-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-800"
    >
      {icon}
    </button>
  );
}

export default function Header({ status, theme, onCycleTheme }) {
  return (
    <header className="flex items-center gap-3 border-b border-neutral-200 pb-5 dark:border-neutral-800">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-control bg-accent-soft text-accent dark:bg-accent/15">
        <Clipboard size={20} />
      </div>
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-lg font-semibold">Shared clipboard</h1>
        <p className="truncate text-sm text-neutral-500 dark:text-neutral-400">
          No login · syncs across devices
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <StatusPill status={status} />
        <ThemeToggle theme={theme} onCycle={onCycleTheme} />
      </div>
    </header>
  );
}
