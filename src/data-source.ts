import "reflect-metadata";
import { DataSource } from "typeorm";

export const DevelopmentDataSource = new DataSource({
  type: "postgres",
  host: "localhost",
  port: 5432,
  username: "postgres",
  password: "Montealto",
  database: "psql_graphql",
  synchronize: true,
  logging: false,
  entities: ["src/entity/**/*.ts"],
  migrations: [""],
  subscribers: [""],
});

export const TestDataSource = new DataSource({
  name: "test",
  type: "postgres",
  host: "localhost",
  port: 5432,
  username: "postgres",
  password: "Montealto",
  database: "psql_graphql_test",
  synchronize: true,
  logging: false,
  dropSchema: true,
  entities: ["src/entity/**/*.ts"],
  migrations: [""],
  subscribers: [""],
});
