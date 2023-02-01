import { DataSource } from "typeorm";

export function checkForDBEnvVars() {
  if (
    !process.env.POSTGRES_HOST ||
    !process.env.POSTGRES_PORT ||
    !process.env.POSTGRES_DB ||
    !process.env.POSTGRES_USER ||
    !process.env.POSTGRES_PASSWORD
  ) {
    console.log(
      `POSTGRES_ HOST: ${process.env.POSTGRES_HOST} - PORT: ${process.env.POSTGRES_PORT} - DB: ${process.env.POSTGRES_DB} - USER: ${process.env.POSTGRES_USER} - PASSWORD: ${process.env.POSTGRES_PASSWORD}`,
    );
    console.error("POSTGRES_ DB env vars not set!");
    process.exit(1);
  }
}

const ENTITIES = ["src/models/*.model.ts"];

export function db(logging: boolean) {
  return new DataSource({
    type: "postgres",
    host: process.env.POSTGRES_HOST,
    port: parseInt(process.env.POSTGRES_PORT),
    database: process.env.POSTGRES_DB,
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    logging: logging,
    synchronize: false,
    entities: ENTITIES,
  });
}
