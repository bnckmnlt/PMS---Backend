import { readFileSync } from "fs";

export const typeDefs = readFileSync(
  require.resolve("../graphql/schema.graphql")
).toString("utf-8");
