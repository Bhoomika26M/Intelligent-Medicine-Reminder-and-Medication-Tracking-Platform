/**
 * Browser Notification helper.
 * Asks permission once, then shows medication reminders.
 */

let permissionAsked = false;

export function ensureNotificationPermission(): void {
  if (permissionAsked) return;
  if (!("Notification" in window)) return;
  if (Notification.permission === "default") {
    Notification.requestPermission();
  }
  permissionAsked = true;
}

export function showReminderNotification(name: string, dosage: string, time: string): void {
  if (!("Notification" in window)) return;
  const title = `Time to take ${name}`;
  const body = `Dosage: ${dosage || "as prescribed"} · ${time}`;
  if (Notification.permission === "granted") {
    new Notification(title, { body });
  } else if (Notification.permission === "default") {
    Notification.requestPermission().then((perm) => {
      if (perm === "granted") new Notification(title, { body });
    });
  }
}
