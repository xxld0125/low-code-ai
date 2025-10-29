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

      // Legacy ignore files (from .eslintignore)
      "*.min.js",
      "*.min.css",
      "public/static/**",
      ".cache/**",
      "temp/**",
      ".tmp/**",
      "*.tmp",
      "*.temp",
      "*.pem",
      "designer-temp/**",
      "designer-exports/**",
      "designer-thumbnails/**",
    ],
  },
  {
    // 页面设计器相关文件的规则放宽
    files: [
      "app/api/page-designer/**/*",
      "stores/page-designer/**/*",
      "types/page-designer/**/*",
      "lib/page-designer/**/*",
      "hooks/use-page-*",
      "components/page-designer/**/*",
      "components/lowcode/**/*",
    ],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
      "react-hooks/exhaustive-deps": "warn",
      "prefer-const": "warn",
      "@typescript-eslint/no-empty-object-type": "off",
    },
  },
];

export default eslintConfig;
