import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../app/generated/prisma/client"; 

const connectionString = `${process.env.DATABASE_URL}`;

// 1. Define the function that creates the connection pool and client
const prismaClientSingleton = () => {
  const pool = new Pool({
    connectionString,
    max: 10,
    idleTimeoutMillis: 15000, // Close idle connections after 15 seconds to prevent stale pool clients
    connectionTimeoutMillis: 5000,
  });

  // Handle unexpected errors on idle pool clients to prevent app crashes or stale socket exceptions
  pool.on("error", (err) => {
    console.error("Unexpected error on idle pg client:", err);
  });
  
  const adapter = new PrismaPg(pool);
  
  return new PrismaClient({ adapter });
};

// 2. Declare the global variable to hold the instance
declare global {
  // eslint-disable-next-line no-var
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>;
}

// 3. Instantiate or retrieve the existing instance
const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

export { prisma };

// 4. Save the instance to the global object in development
if (process.env.NODE_ENV !== "production") {
  globalThis.prismaGlobal = prisma;
}