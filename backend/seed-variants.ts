import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

dotenv.config({ path: './.env' });

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({
  connectionString,
  ssl: connectionString && (connectionString.includes('sslmode=require') || connectionString.includes('supabase.co'))
    ? { rejectUnauthorized: false }
    : undefined
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const variantsConfig = [
  { size: 'small', heightMin: 15, heightMax: 30, priceMultiplier: 0.75, stock: 20 },
  { size: 'medium', heightMin: 30, heightMax: 60, priceMultiplier: 1.0, stock: 15 },
  { size: 'large', heightMin: 60, heightMax: 90, priceMultiplier: 1.35, stock: 10 },
  { size: 'xlarge', heightMin: 90, heightMax: 120, priceMultiplier: 1.75, stock: 5 },
];

async function main() {
  console.log('Fetching all products from database...');
  const products = await prisma.product.findMany({
    include: { variants: true },
  });

  console.log(`Found ${products.length} products. Seeding variants...`);

  let count = 0;
  for (const product of products) {
    if (product.variants.length > 0) {
      console.log(`Product "${product.name}" (${product.id}) already has ${product.variants.length} variants. Skipping.`);
      continue;
    }

    console.log(`Creating variants for product: "${product.name}" (${product.id}) - Base price: ${product.price}`);
    for (const cfg of variantsConfig) {
      const calculatedPrice = Math.round(product.price * cfg.priceMultiplier);
      
      await prisma.productVariant.create({
        data: {
          productId: product.id,
          size: cfg.size,
          heightMin: cfg.heightMin,
          heightMax: cfg.heightMax,
          price: calculatedPrice,
          stock: cfg.stock,
        },
      });
    }
    count++;
  }

  console.log(`Successfully seeded variants for ${count} products!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
