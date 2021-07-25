// snowpack.config.mjs
// Example: Using Snowpack's built-in bundling support
export default {
  buildOptions: {
    out: "build"
  },
  optimize: {
    entrypoints: ["mandatum.ts"],
    bundle: true,
    minify: true,
  },
};
