import resolve from "@rollup/plugin-node-resolve";
import babel from "@rollup/plugin-babel";

export default {
  input: "./src/index.js",
  output: {
    file: "./bundle.js",
    format: "es",
    sourcemap: true,
  },
  plugins: [
    resolve(),
    babel({
      presets: [
        [
          "@babel/preset-env",
          {
            targets: {
              node: "12",
            },
          },
        ],
        "@babel/preset-react",
      ],
      plugins: ["@babel/transform-runtime"],
      babelHelpers: "runtime",
    }),
  ],
  external: ["react", "@microsoft/signalr", "prop-types"],
};
