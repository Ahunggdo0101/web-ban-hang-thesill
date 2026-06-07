import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log("Checking remote database connection...");
    const mediaCount = await prisma.media.count();
    console.log("SUCCESS: Connection to remote database successful!");
    console.log("Media table exists! Current row count:", mediaCount);
  } catch (error) {
    console.error("ERROR connecting to DB or checking Media table:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
