import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    // Seed must be inside migrations
    seed: "node prisma/seed.js", 
  },
  "datasource": {
    "url": "file:./dev.db"
  }
});