import "reflect-metadata";
import * as dotenv from "dotenv";
dotenv.config();
import * as express from "express";
const app = express();
import * as morgan from "morgan";
import * as cors from "cors";
import * as helmet from "helmet";
import { typeDefs } from "./graphql/typeDefs";
import { resolvers } from "./graphql/resolvers";
import { corsOption } from "./config/cors-option";
import { authUtilities } from "./helpers/auth.helper";
import { DevelopmentDataSource, TestDataSource } from "./data-source";
import { createServer } from "http";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { makeExecutableSchema } from "@graphql-tools/schema";

import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import { useServer } from "graphql-ws/lib/use/ws";
import { WebSocketServer } from "ws";

export const initializeServer = async () => {
  const schema = makeExecutableSchema({ typeDefs, resolvers });

  const httpServer = createServer(app);

  const wsServer = new WebSocketServer({
    server: httpServer,
    path: "/graphql",
  });

  const serverCleanup = useServer({ schema }, wsServer);

  if (process.env.NODE_ENV === "test") {
    await TestDataSource.initialize();
  } else {
    await DevelopmentDataSource.initialize();
  }

  const server = new ApolloServer({
    schema,
    // context: AuthMiddleware,
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

  await server.start();

  app.use(
    "/graphql",
    cors<cors.CorsRequest>(corsOption),
    express.json(),
    helmet.crossOriginResourcePolicy({ policy: "cross-origin" }),
    morgan("dev"),
    expressMiddleware(server, {
      context: authUtilities.authMiddleware,
    })
  );

  httpServer.listen(4000, () => {
    console.log(`🚀 Query endpoint ready at http://localhost:${4000}/graphql`);
    console.log(
      `🚀 Subscription endpoint ready at ws://localhost:${4000}/graphql`
    );
  });

  return { server, app };
};

app.use(
  "/",
  cors<cors.CorsRequest>(corsOption),
  express.json(),
  helmet.crossOriginResourcePolicy({ policy: "cross-origin" }),
  morgan("dev")
);

// Express Routes
let receivedData: any = null;

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
