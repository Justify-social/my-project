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
      "node_modules/**",
      ".next/**",
      "build/**",
      "dist/**",
      "public/**",
      "scripts-backup-*/**",
      "src/components/ui/LoadingSpinner.tsx",
      "**/*.bak",
      "**/*.backup",
      "**/*.old",
      "**/*.tmp"
    ],
    rules: {
      "@typescript-eslint/no-unused-vars": ["warn", {
        "argsIgnorePattern": "^_",
        "varsIgnorePattern": "^_"
      }],
      "@typescript-eslint/no-explicit-any": "warn",
      "react/no-unescaped-entities": "off",
      "@next/next/no-img-element": "warn",
      "react/display-name": "off",
      "jsx-a11y/role-has-required-aria-props": "off",
      "react-hooks/exhaustive-deps": "warn",
      "prefer-const": "warn"
    }
  }
];

export default eslintConfig;
