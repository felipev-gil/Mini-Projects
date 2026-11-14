export function formatTime(milliseconds) {
  const centiseconds = Math.floor(Math.max(0, milliseconds) / 10);
  return String(Math.floor(centiseconds / 6000)).padStart(2, "0") + ":" + String(Math.floor(centiseconds / 100) % 60).padStart(2, "0") + "." + String(centiseconds % 100).padStart(2, "0");
}

