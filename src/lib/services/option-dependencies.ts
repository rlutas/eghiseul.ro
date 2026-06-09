/**
 * Dependency rules for the international "extras" chain shared by every service
 * that offers apostilă / traducere / legalizare options.
 *
 * Chain:  traducere → legalizare → apostila_notari
 *   - "legalizare"      requires "traducere"
 *   - "apostila_notari" requires "legalizare" (transitively traducere too)
 *   - "apostila_haga"   has no prerequisite
 *
 * Used by the wizard options step for BOTH the primary service options and the
 * bundled (secondary-service) options, so a dependent can never be selected
 * before its prerequisite.
 */

/** Map of option code → the code it directly depends on. */
export const OPTION_DEPENDENCIES: Readonly<Record<string, string>> = {
  legalizare: 'traducere',
  apostila_notari: 'legalizare',
};

/**
 * Is `code` blocked because some link in its prerequisite chain isn't selected?
 * Walks the full chain (apostila_notari → legalizare → traducere).
 */
export function isOptionDepBlocked(code: string, selected: Set<string>): boolean {
  let required: string | undefined = OPTION_DEPENDENCIES[code];
  while (required) {
    if (!selected.has(required)) return true;
    required = OPTION_DEPENDENCIES[required];
  }
  return false;
}

/**
 * Codes to drop when `code` is deselected: the code itself plus every option
 * that (transitively) depends on it. Deselecting "traducere" removes
 * "legalizare" and "apostila_notari" as well.
 */
export function cascadeDropCodes(code: string): Set<string> {
  const drop = new Set<string>([code]);
  let changed = true;
  while (changed) {
    changed = false;
    for (const [dependent, prerequisite] of Object.entries(OPTION_DEPENDENCIES)) {
      if (drop.has(prerequisite) && !drop.has(dependent)) {
        drop.add(dependent);
        changed = true;
      }
    }
  }
  return drop;
}
