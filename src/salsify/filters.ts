/** Escape a value for Salsify filter single-quoted strings. */
export function escapeFilterValue(value: string): string {
  return value.replace(/'/g, "''");
}

/** Build ='Property Name':'value' filter clause. */
export function buildPropertyEqualsFilter(
  propertyName: string,
  value: string,
): string {
  return `='${escapeFilterValue(propertyName)}':'${escapeFilterValue(value)}'`;
}

/** Combine filter clauses with OR (Salsify uses = between requirement sets). */
export function buildOrFilter(clauses: string[]): string {
  if (clauses.length === 0) {
    throw new Error("At least one filter clause is required");
  }
  return clauses.join("=");
}
