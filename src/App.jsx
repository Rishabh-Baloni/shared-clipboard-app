import { useCallback, useEffect, useRef, useState } from "react";
import Header from "./components/Header.jsx";
import InfoStrip from "./components/InfoStrip.jsx";
import ColumnCard from "./components/ColumnCard.jsx";
import FooterStrip from "./components/FooterStrip.jsx";
import { getNote, saveNote } from "./lib/api.js";
import {
  generateCode,
  isValidCode,
  readHashCode,
  writeHashCode,
} from "./lib/room.js";

const SAVE_DEBOUNCE_MS = 500;
const POLL_INTERVAL_MS = 1500;
const THEME_KEY = "clipboard-theme";

function getStoredTheme() {
  try {
    const t = localStorage.getItem(THEME_KEY);
    if (t === "light" || t === "dark" || t === "system") return t;
  } catch {
    /* localStorage unavailable */
  }
  return "system";
}

export default function App() {
  const [code, setCode] = useState("");
  const [text, setText] = useState("");
  const [status, setStatus] = useState("synced");
  const [lastSavedAt, setLastSavedAt] = useState(null);
  const [nowTick, setNowTick] = useState(Date.now());
  const [theme, setTheme] = useState(getStoredTheme);
  const [version, setVersion] = useState(0);

  const textRef = useRef(text);
  const versionRef = useRef(version);
  const focusRef = useRef(false);
  const saveTimer = useRef(null);
  const pendingSave = useRef(false);
  const pendingVersion = useRef(version);

  textRef.current = text;
  versionRef.current = version;

  useEffect(() => {
    let current = readHashCode();
    if (!current) {
      current = generateCode();
      writeHashCode(current, { replace: true });
    }
    setCode(current);

    const onHashChange = () => {
      const next = readHashCode();
      if (next && isValidCode(next)) {
        setCode(next);
      }
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  useEffect(() => {
    if (!code) return;
    let cancelled = false;
    setStatus("saving");
    getNote(code)
      .then((data) => {
        if (cancelled) return;
        setText(data.text);
        textRef.current = data.text;
        setVersion(data.version);
        versionRef.current = data.version;
        pendingVersion.current = data.version;
        setStatus("synced");
        setLastSavedAt(Date.now());
      })
      .catch(() => {
        if (!cancelled) setStatus("reconnecting");
      });
    return () => {
      cancelled = true;
    };
  }, [code]);

  useEffect(() => {
    if (!code) return;
    let cancelled = false;

    const poll = async () => {
      try {
        const data = await getNote(code);
        if (cancelled) return;
        
        // Only update if we have a newer version
        if (data.version > versionRef.current) {
          setText(data.text);
          textRef.current = data.text;
          setVersion(data.version);
          versionRef.current = data.version;
          pendingVersion.current = data.version;
        }
        if (!pendingSave.current) {
          setStatus("synced");
        }
      } catch {
        if (!cancelled) setStatus("reconnecting");
      }
    };

    const id = setInterval(poll, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [code]);

  useEffect(() => {
    const id = setInterval(() => setNowTick(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => {
      const dark = theme === "dark" || (theme === "system" && mq.matches);
      root.classList.toggle("dark", dark);
    };
    apply();
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {
      /* localStorage unavailable */
    }
    if (theme === "system") {
      mq.addEventListener("change", apply);
      return () => mq.removeEventListener("change", apply);
    }
  }, [theme]);

  const cycleTheme = useCallback(() => {
    setTheme((t) => (t === "system" ? "light" : t === "light" ? "dark" : "system"));
  }, []);

  const flushSave = useCallback(() => {
    if (!code) return;
    pendingSave.current = false;
    saveNote(code, { text: textRef.current, version: pendingVersion.current })
      .then((response) => {
        if (response.ok) {
          // Success! Update our local version
          setVersion(response.version);
          versionRef.current = response.version;
          pendingVersion.current = response.version;
          setStatus("synced");
          setLastSavedAt(Date.now());
        } else if (response.error === "Stale update" && response.currentState) {
          // Got a stale update - sync with server's current state
          setText(response.currentState.text);
          textRef.current = response.currentState.text;
          setVersion(response.currentState.version);
          versionRef.current = response.currentState.version;
          pendingVersion.current = response.currentState.version;
          setStatus("synced");
        }
      })
      .catch(() => {
        setStatus("reconnecting");
      });
  }, [code]);

  const scheduleSave = useCallback(() => {
    pendingSave.current = true;
    setStatus("saving");
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(flushSave, SAVE_DEBOUNCE_MS);
  }, [flushSave]);

  const updateText = useCallback(
    (next) => {
      setText(next);
      textRef.current = next;
      // When user starts typing, set pendingVersion to current version at this moment
      pendingVersion.current = versionRef.current;
      scheduleSave();
    },
    [scheduleSave]
  );

  const setFocus = useCallback((focused) => {
    focusRef.current = focused;
  }, []);

  const changeRoom = useCallback((next) => {
    const trimmed = next.trim();
    if (isValidCode(trimmed)) {
      writeHashCode(trimmed);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, []);

  return (
    <div className="flex min-h-screen [min-height:100dvh] flex-col bg-neutral-50 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
      <div className="mx-auto flex min-h-0 w-full max-w-[1500px] flex-1 flex-col gap-6 p-6">
        <Header status={status} theme={theme} onCycleTheme={cycleTheme} />
        <InfoStrip code={code} onChangeRoom={changeRoom} />
        <div className="grid min-h-0 flex-1 grid-cols-1">
          <ColumnCard
            name="Clipboard"
            value={text}
            onChange={updateText}
            onFocus={() => setFocus(true)}
            onBlur={() => setFocus(false)}
            onClear={() => updateText("")}
          />
        </div>
        <FooterStrip lastSavedAt={lastSavedAt} now={nowTick} />
      </div>
    </div>
  );
}
