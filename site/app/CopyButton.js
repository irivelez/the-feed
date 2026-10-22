"use client";
import { useState } from "react";
export default function CopyButton({ text }) {
  const [done, setDone] = useState(false);
  return (
    <button className="copy" onClick={async () => { await navigator.clipboard.writeText(text); setDone(true); setTimeout(() => setDone(false), 1500); }}>
      {done ? "Copied" : "Copy"}
    </button>
  );
}
