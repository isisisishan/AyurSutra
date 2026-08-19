// ─── BKK Audit Log (session-scoped, in-memory) ──────────────────────
// Tracks clinical actions for transparency and accountability.
// In production, replace with a persistent backend log.

export type AuditEventType =
  | "search_performed"
  | "formulation_viewed"
  | "safety_rule_triggered"
  | "formulation_selected"
  | "formulation_rejected"
  | "doctor_override"
  | "comparison_opened";

export interface AuditEvent {
  id: string;
  timestamp: string;
  eventType: AuditEventType;
  actor: string; // doctor id or "public"
  formulationId?: string;
  formulationName?: string;
  details: string;
  overrideReason?: string;
}

const _log: AuditEvent[] = [];

function generateId(): string {
  return `aud-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

export function logAuditEvent(
  event: Omit<AuditEvent, "id" | "timestamp">
): AuditEvent {
  const entry: AuditEvent = {
    ...event,
    id: generateId(),
    timestamp: new Date().toISOString(),
  };
  _log.push(entry);
  // In dev: log to console for debugging
  if (process.env.NODE_ENV === "development") {
    console.debug("[BKK Audit]", entry);
  }
  return entry;
}

export function getAuditLog(): AuditEvent[] {
  return [..._log];
}

export function clearAuditLog(): void {
  _log.length = 0;
}
