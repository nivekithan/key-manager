import { build, emptyDir } from "https://deno.land/x/dnt@0.37.0/mod.ts";

await emptyDir("./npm");

await build({
  entryPoints: ["./src/index.ts"],
  outDir: "./npm",
  package: {
    name: "@niveth/key-manager",
    version: Deno.args[0],
    description: "Your package.",
    license: "MIT",
    repository: {
      type: "git",
      url: "git+https://github.com/nivekithan/key-manager.git",
    },
    bugs: {
      url: "https://github.com/nivekithan/key-manager/issues",
    },
    private: false,
  },
  shims: {
    undici: true,
  },
});
