import "reflect-metadata";
import * as express from "express";
import * as helmet from "helmet";
import * as morgan from "morgan";
import { createServer } from "http";
import * as cors from "cors";
import { typeDefs } from "./graphql/typeDefs";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { resolvers } from "./graphql/resolvers";
import { DevelopmentDataSource, TestDataSource } from "./data-source";
import { corsOption } from "./config/cors-option";
import { WebSocketServer } from "ws";
import { useServer } from "graphql-ws/lib/use/ws";

export const initializeServer = async () => {
  const app = express();
  const httpServer = createServer(app);

  const schema = makeExecutableSchema({ typeDefs, resolvers });

  const wsServer = new WebSocketServer({
    server: httpServer,
    path: "/subscriptions",
  });
  const serverCleanup = useServer({ schema }, wsServer);

  const server = new ApolloServer({
    schema,
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),

      {
        async serverWillStart() {
          return {
            async drainServer() {
              await serverCleanup.dispose();
            },
          };
        },
      },
    ],
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
