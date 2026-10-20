import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import babel from "@rolldown/plugin-babel";
import { defineConfig, lazyPlugins } from "vite-plus";
import path from "path";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  fmt: {
    printWidth: 80,
    ignorePatterns: [".agents/**", ".claude/**"],
  },
  lint: {
    ignorePatterns: [".agents/**", ".claude/**", "src/components/ui/**"],
    plugins: ["react", "typescript", "oxc"],
    rules: {
      "react/rules-of-hooks": "error",
      "react/only-export-components": [
        "warn",
        {
          allowConstantExport: true,
        },
      ],
      "vite-plus/prefer-vite-plus-imports": "error",
    },
    options: {
      typeAware: true,
      typeCheck: true,
    },
    jsPlugins: [
      {
        name: "vite-plus",
        specifier: "vite-plus/oxlint-plugin",
      },
    ],
  },
  test: {
    include: ["src/**/*.test.ts"],
    coverage: {
      reporter: ["text", "html"],
    },
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
  plugins: lazyPlugins(() => [
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    tailwindcss(),
  ]),
});
