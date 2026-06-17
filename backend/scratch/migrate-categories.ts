import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL is missing in environment variables');
}

const pool = new Pool({
  connectionString: connectionString.replace(/[?&]sslmode=[^&]+/g, ''),
  ssl: { rejectUnauthorized: false }
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  try {
    console.log("Starting product categories migration...");
    const products = await prisma.product.findMany();
    console.log(`Found ${products.length} products to check.`);

    let updatedCount = 0;
    for (const product of products) {
      // If the product has a single category but its categories array is empty, migrate it
      if (product.category && (!product.categories || product.categories.length === 0)) {
        await prisma.product.update({
          where: { id: product.id },
          data: {
            categories: [product.category],
          },
        });
        console.log(`Migrated product "${product.name}" (${product.id}): category "${product.category}" -> categories ["${product.category}"]`);
        updatedCount++;
      }
    }
    console.log(`Migration finished. Updated ${updatedCount} products.`);
  } catch (error) {
    console.error("ERROR during migration:", error);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main();
