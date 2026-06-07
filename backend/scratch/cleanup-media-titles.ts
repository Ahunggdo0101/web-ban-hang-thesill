import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is missing');
}

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  try {
    console.log("Connecting to Database for title cleanup...");
    const mediaItems = await prisma.media.findMany();
    console.log(`Found ${mediaItems.length} media items in DB. Starting check and cleanup...`);
    
    let updatedCount = 0;
    for (const item of mediaItems) {
      const title = item.title;
      
      // Nhận diện mã hash ngẫu nhiên vô nghĩa (dài >= 12 ký tự, chỉ gồm chữ/số không có khoảng trắng, chứa cả chữ lẫn số)
      const isRandomHash = /^[a-zA-Z0-9]{12,}$/.test(title) && /[0-9]/.test(title) && /[a-zA-Z]/.test(title);
      
      if (isRandomHash) {
        console.log(`Updating Media item ID: ${item.id} — old title: "${title}" -> "Ảnh Tải Lên"`);
        await prisma.media.update({
          where: { id: item.id },
          data: { title: 'Ảnh Tải Lên' }
        });
        updatedCount++;
      }
    }
    
    console.log(`SUCCESS: Database title cleanup completed! Successfully updated ${updatedCount} media items.`);
  } catch (error) {
    console.error("ERROR during database title cleanup:", error);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main();
