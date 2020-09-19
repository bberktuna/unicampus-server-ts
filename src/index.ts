import "reflect-metadata";
import { createConnection, getConnectionOptions } from "typeorm";
import http from "http";

//SERVER
import express from "express";
import session from "express-session";
import connectSqlite3 from "connect-sqlite3";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import * as path from "path";

const SQLiteStore = connectSqlite3(session);

async function bootstrap() {
  const app = express();
  // use express session

  app.use(
    session({
      store: new SQLiteStore({
        db: "database.sqlite",
        concurrentDB: true,
      }),
      name: "qid",
      secret: process.env.SESSION_SECRET || "SESSION_SECRET",
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 1000 * 60 * 60 * 24 * 7 * 365, // 7 years
      },
    })
  );

  // get options from ormconfig.js
  const dbOptions = await getConnectionOptions(
    process.env.NODE_ENV || "development"
  );
  createConnection({ ...dbOptions, name: "default" })
    .then(async () => {
      const schema = await buildSchema({
        resolvers: [__dirname + "/resolvers/*.ts"],
        emitSchemaFile: path.resolve(__dirname, "schema.gql"),
      });

      const apolloServer = new ApolloServer({
        schema,
        context: ({ req, res }) => ({ req, res }),
        introspection: true,
        playground: true,
        subscriptions: {
          keepAlive: 1000,
        },
      });

      apolloServer.applyMiddleware({ app, cors: true });

      const port = process.env.PORT || 4000;

      const httpServer = http.createServer(app);
      apolloServer.installSubscriptionHandlers(httpServer);

      httpServer.listen(port, () => {
        // app.listen
        console.log(`Server started at http://localhost:${port}/graphql`);
        console.log(
          `Subscriptions ready at ws://localhost:${port}${apolloServer.subscriptionsPath}/graphql`
        );
      });
    })

    .catch((error) => console.log(error));
}
bootstrap();
