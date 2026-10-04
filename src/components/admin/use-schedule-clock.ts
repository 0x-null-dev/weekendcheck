"use client";
import { useEffect, useState, useSyncExternalStore } from "react";
import { scheduleWeek, scheduleWindow } from "@/lib/schedule-window";

export function localDateTime(date: Date): string {
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}

const subscribe = () => () => {};
const clientReady = () => true;
const serverReady = () => false;

export function useScheduleClock() {
  const ready = useSyncExternalStore(subscribe, clientReady, serverReady);
  const [clock, setNow] = useState(() => new Date());
  useEffect(() => {
    const update = () => setNow(new Date());
    const timer = window.setInterval(update, 1000);
    window.addEventListener("focus", update);
    document.addEventListener("visibilitychange", update);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("focus", update);
      document.removeEventListener("visibilitychange", update);
    };
  }, []);
  // Server rendering cannot know the browser's clock or time zone.
  const now = ready ? clock : new Date("2000-01-03T00:00:00Z");
  const timeZone = ready ? Intl.DateTimeFormat().resolvedOptions().timeZone : "UTC";
  const week = scheduleWeek(now, timeZone);
  // datetime-local uses minute precision, so the first selectable time is the next minute.
  const min = localDateTime(new Date((Math.floor(now.getTime() / 60000) + 1) * 60000));
  return { ready, now, timeZone, week, min: ready ? min : undefined, max: ready ? `${scheduleWindow(now, timeZone).end}T23:59` : undefined };
}
