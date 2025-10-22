import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      // Dependencies
      "node_modules/**",
      ".pnpm-store/**",

      // Next.js
      ".next/**",
      "out/**",
      "dist/**",
      "build/**",

      // Production
      "build/**",

      // Coverage
      "coverage/**",
      ".nyc_output/**",

      // TypeScript
      "*.tsbuildinfo",
      "next-env.d.ts",

      // Environment
      ".env",
      ".env*.local",

      // IDE
      ".vscode/**",
      ".idea/**",

      // OS
      ".DS_Store",
      "Thumbs.db",

      // Logs
      "*.log",
      "npm-debug.log*",
      "yarn-debug.log*",
      "yarn-error.log*",

      // Vercel
      ".vercel",
    ],
  },
];

export default eslintConfig;
