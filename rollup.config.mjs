export default [
  {
    input: "public/views/InitSheet.js",
    output: {
      file: "public/dist/bundleInitSheet.js",
      format: "es",
    },
  },
  {
    input: "public/views/Table.js",
    output: [
      {
        file: "public/dist/bundleTable.js",
        format: "es",
      },
    ],
  },
];
