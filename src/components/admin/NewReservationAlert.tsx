"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, BellOff, BellRing } from "lucide-react";
import { getReservationCounter } from "@/app/admin/actions/notifications";

function beep() {
  try {
    const ctx = new AudioContext();
    [880, 1175].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.2, ctx.currentTime + i * 0.2);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.2 + 0.18);
      osc.connect(gain).connect(ctx.destination);
      osc.start(ctx.currentTime + i * 0.2);
      osc.stop(ctx.currentTime + i * 0.2 + 0.2);
    });
  } catch {
    // Audio indisponible : on ignore.
  }
}

/** Vérifie toutes les 20 s s'il y a une nouvelle réservation : son + notification + rafraîchissement. */
export function NewReservationAlert() {
  const router = useRouter();
  const last = useRef<number | null>(null);
  const [enabled, setEnabled] = useState(false);
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    try {
      // Lecture unique du réglage local au montage.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setEnabled(localStorage.getItem("resa-sound") === "1");
    } catch {}
  }, []);

  useEffect(() => {
    let stopped = false;
    async function check() {
      try {
        const count = await getReservationCounter();
        if (stopped) return;
        if (last.current !== null && count > last.current) {
          if (enabled) beep();
          setFlash(true);
          setTimeout(() => setFlash(false), 6000);
          if (enabled && "Notification" in window && Notification.permission === "granted") {
            new Notification("Nouvelle réservation", { body: "Une nouvelle demande vient d'arriver." });
          }
          router.refresh();
        }
        last.current = count;
      } catch {}
    }
    void check();
    const id = setInterval(check, 20000);
    return () => {
      stopped = true;
      clearInterval(id);
    };
  }, [enabled, router]);

  function toggle() {
    const next = !enabled;
    setEnabled(next);
    try {
      localStorage.setItem("resa-sound", next ? "1" : "0");
    } catch {}
    if (next) {
      beep();
      if ("Notification" in window && Notification.permission === "default") void Notification.requestPermission();
    }
  }

  const Icon = flash ? BellRing : enabled ? Bell : BellOff;
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={enabled ? "Désactiver le son des nouvelles réservations" : "Activer le son des nouvelles réservations"}
      title={enabled ? "Alerte sonore activée" : "Activer l'alerte sonore"}
      className={`rounded-full p-2 transition-colors ${flash ? "animate-pulse bg-amber-400 text-slate-900" : "text-slate-200 hover:bg-white/10"}`}
    >
      <Icon className="h-5 w-5" />
    </button>
  );
}
