import "dotenv/config";
import { defineConfig } from "prisma/config";

const placeholder =
  "postgresql://build:build@127.0.0.1:5432/build?schema=public";

const databaseUrl =
  process.env.DATABASE_URL?.trim() || placeholder;

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  engine: "classic",
  datasource: {
    url: databaseUrl,
    directUrl: process.env.DIRECT_URL?.trim() || databaseUrl,
  },
});
