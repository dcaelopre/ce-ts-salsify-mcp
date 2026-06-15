export function assertSingleReadMode(
  modes: Record<string, boolean>,
  labels: string[],
): void {
  const keys = Object.keys(modes);
  const activeKeys = keys.filter((key) => modes[key]);
  const activeLabels = activeKeys.map(
    (key) => labels[keys.indexOf(key)] ?? key,
  );

  if (activeKeys.length === 0) {
    throw new Error("Provide exactly one lookup mode: " + labels.join(", "));
  }
  if (activeKeys.length > 1) {
    throw new Error(
      "Provide only one lookup mode at a time. Received: " +
        activeLabels.join(", "),
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
