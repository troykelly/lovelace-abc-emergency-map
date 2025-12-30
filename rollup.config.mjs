import typescript from "@rollup/plugin-typescript";
import nodeResolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import terser from "@rollup/plugin-terser";

const production = !process.env.ROLLUP_WATCH;

export default {
  input: "src/abc-emergency-map-card.ts",
  output: {
    file: "dist/abc-emergency-map-card.js",
    format: "es",
    // Always generate source maps for debugging
    // In production, generate external source map file
    sourcemap: true,
    // Banner with version info for debugging
    banner: `/* ABC Emergency Map Card - v${process.env.npm_package_version || "0.1.0"} */`,
  },
  plugins: [
    // Resolve node_modules dependencies
    nodeResolve({
      browser: true,
      preferBuiltins: false,
    }),
    // Convert CommonJS modules to ES6
    commonjs(),
    // Compile TypeScript
    typescript({
      tsconfig: "./tsconfig.json",
      declaration: false,
      declarationMap: false,
      sourceMap: true,
      inlineSources: true,
    }),
    // Minify in production
    production &&
      terser({
        format: {
          comments: /^!/,
        },
        compress: {
          drop_console: false, // Keep console for debugging in HA
          pure_getters: true,
        },
        mangle: {
          properties: false, // Don't mangle property names
        },
      }),
  ].filter(Boolean),
  // Preserve module structure for tree-shaking
  treeshake: {
    moduleSideEffects: true,
    propertyReadSideEffects: false,
  },
};
