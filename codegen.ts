import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  overwrite: true,
  schema: "src/graphql/typedefs.graphql",
  generates: {
    "src/generated/types.ts": {
      plugins: [
        "typescript",
        "typescript-resolvers",
        "typescript-document-nodes",
      ],
    },
  },
};

export default config;
