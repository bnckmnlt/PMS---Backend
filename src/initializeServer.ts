import "reflect-metadata";
import * as express from "express";
import * as helmet from "helmet";
import * as morgan from "morgan";
import * as http from "http";
import * as cors from "cors";
import { readFileSync } from "fs";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import { resolvers } from "./graphql/resolvers";
import { DevelopmentDataSource, TestDataSource } from "./data-source";
import { corsOption } from "./config/cors-option";

const app = express();
const httpServer = http.createServer(app);

export const initializeServer = async () => {
  const typeDefs = readFileSync(
    require.resolve("./graphql/typedefs.graphql")
  ).toString("utf-8");

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  });

  if (process.env.NODE_ENV === "test") {
    await TestDataSource.initialize();
  } else {
    await DevelopmentDataSource.initialize();
  }

  await server.start();

  app.use(
    "/graphql",
    cors<cors.CorsRequest>(corsOption),
    express.json(),
    helmet.crossOriginResourcePolicy({ policy: "cross-origin" }),
    morgan("dev"),
    expressMiddleware(server, {
      context: async ({ req }) => ({ token: req.headers.token }),
    })
  );
  app.use(
    "/",
    cors<cors.CorsRequest>(corsOption),
    express.json(),
    helmet.crossOriginResourcePolicy({ policy: "cross-origin" }),
    morgan("dev")
  );

  let receivedData: any = null;

  const waitForData = () => {
    return new Promise((resolve) => {
      const checkData = () => {
        if (receivedData !== null) {
          resolve(receivedData);
        } else {
          setTimeout(checkData, 100);
        }
      };
      checkData();
    });
  };

  app.post("/data", (req, res) => {
    try {
      const patientData = req.body;

      if (patientData !== undefined) {
        receivedData = patientData;
        res.json({
          message: "Data received and processed successfully",
          data: receivedData,
        });
      } else {
        res.status(400).json({ error: "Invalid data received" });
      }
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/result", async (_: any, res) => {
    try {
      const data = await waitForData();

      receivedData = null;
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  await new Promise<void>((resolve) =>
    httpServer.listen({ port: 4000 }, resolve)
  );
  console.log(`🚀 Server ready at http://localhost:4000/`);
};
