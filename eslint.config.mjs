import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // One-off maintenance scripts run on Node directly (node scripts/x.cjs), not
  // through the bundler — CommonJS require is the point, not a mistake.
  {
    files: ["scripts/**/*.cjs"],
    rules: { "@typescript-eslint/no-require-imports": "off" },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Scripturi de analiză și artefacte de cercetare — se rulează pe Node, la
    // mână, nu intră în bundle. Un `require()` lăsat acolo pica build-ul în CI
    // (s-a întâmplat pe 03.09.2026, 4 build-uri roșii la rând).
    "docs/**",
    // Skill-uri instalate, cod terț.
    ".agents/**",
    ".claude/skills/**",
  ]),
]);

export default eslintConfig;
