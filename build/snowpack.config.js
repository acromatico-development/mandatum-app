export default {
  buildOptions: {
    out: "build"
  },
  optimize: {
    entrypoints: ["mandatum.ts"],
    bundle: true,
    minify: true
  }
};
