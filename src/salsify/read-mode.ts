export function assertSingleReadMode(
  modes: Record<string, boolean>,
  labels: string[],
): void {
  const active = labels.filter((label) => modes[label]);
  if (active.length === 0) {
    throw new Error("Provide exactly one lookup mode: " + labels.join(", "));
  }
  if (active.length > 1) {
    throw new Error(
      "Provide only one lookup mode at a time. Received: " + active.join(", "),
    );
  }
}

export const MAX_BULK_IDS = 100;
export const DEFAULT_PER_PAGE = 25;
export const MAX_PER_PAGE = 100;

export function validateBulkIds(ids: string[], label: string): void {
  if (ids.length === 0) {
    throw new Error(label + " must contain at least one ID");
  }
  if (ids.length > MAX_BULK_IDS) {
    throw new Error(label + " supports at most " + MAX_BULK_IDS + " IDs per request");
  }
}
