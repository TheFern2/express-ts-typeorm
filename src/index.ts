require("dotenv").config();
import "reflect-metadata";
import express from "express";
import morgan from "morgan";
import cors from "cors";
import { join } from "path";
import { createConnection } from "typeorm";
import userRoutes from "./routes/user.routes";

const main = async () => {
  const credentials = {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  };

  console.log(
    `About to connect to db, host: ${credentials.host}:${credentials.port}`
  );

  const app = express();
  const conn = await createConnection({
    type: "postgres",
    database: process.env.DB_NAME,
    entities: [join(__dirname, "./entities/*")],
    //migrations: [join(__dirname, "./migrations/*")],
    synchronize: true,
    //logging: !__prod__,
    ...credentials,
  });

  // middleware
  app.use(cors());
  app.use(morgan("dev"));
  app.use(express.json());

  // latency simulation for local server
  if (process.env.LATENCY_ON === "true") {
    app.use((_req, _res, next) => {
      setTimeout(next, Number(process.env.LATENCY_MS));
    });
  }

  // routes
  app.use(userRoutes);

  app.listen(process.env.SERVER_PORT || 3000, () => {
    console.log(`Server started ${process.env.SERVER_PORT}`);
  });
};

main();
