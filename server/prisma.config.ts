import "dotenv/config";
import { defineConfig } from "prisma/config";
import { PrismaLibSQL } from "@prisma/adapter-libsql";
import { createClient } from "@libsql/client";

// Use file-based SQLite via libsql adapter (Prisma v7 compatible)
const getDatasource = () => {
  const url = process.env.DATABASE_URL || "file:./prisma/dev.db";
  const client = createClient({ url });
  return new PrismaLibSQL(client);
};

export default defineConfig({
  schema: "prisma/schema.prisma",
});
