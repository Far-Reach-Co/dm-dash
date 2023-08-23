const isProduction = process.env.SERVER_ENV === "prod";

export default [
  {
    input: "public/views/InitSheet.js",
    plugins: [
      isProduction && (await import("@rollup/plugin-terser")).default(),
    ],
    output: {
      file: "public/dist/bundleInitSheet.js",
      format: "es",
    },
  },
  {
    input: "public/views/Table.js",
    plugins: [
      isProduction && (await import("@rollup/plugin-terser")).default(),
    ],
    output: [
      {
        file: "public/dist/bundleTable.js",
        format: "es",
      },
    ],
  },
];
