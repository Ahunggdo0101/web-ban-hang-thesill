import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import * as bcrypt from 'bcrypt';

dotenv.config();

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const productsData = [
  {
    id: "snake-plant-laurentii",
    name: "Snake Plant Laurentii",
    botanicalName: "Sansevieria trifasciata 'Laurentii'",
    price: 38,
    description: "The Snake Plant Laurentii is a succulent plant characterized by its upright sword-like leaves with vibrant yellow edges. It is incredibly hardy and adaptable, making it one of the easiest house plants to care for.",
    category: "plants",
    image: "https://images.unsplash.com/photo-1596547609652-9cf5d8d76921?auto=format&fit=crop&q=80&w=800",
    images: [
      "https://images.unsplash.com/photo-1596547609652-9cf5d8d76921?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1620191892729-16b263c9b33b?auto=format&fit=crop&q=80&w=800"
    ],
    colorImages: {
      "Terracotta": "https://images.unsplash.com/photo-1596547609652-9cf5d8d76921?auto=format&fit=crop&q=80&w=800",
      "Cream": "https://images.unsplash.com/photo-1593487568522-746db88a4941?auto=format&fit=crop&q=80&w=800",
      "Mint": "https://images.unsplash.com/photo-1620191892729-16b263c9b33b?auto=format&fit=crop&q=80&w=800",
      "Charcoal": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=800"
    },
    light: "low",
    petFriendly: false,
    difficulty: "easy",
    size: "medium",
    rating: 4.8,
    reviewsCount: 312,
    careDetails: {
      light: "Thích nghi tốt từ ánh sáng yếu đến ánh sáng gián tiếp rực rỡ. Tránh ánh nắng trực tiếp gay gắt.",
      water: "Tưới nước 2-3 tuần một lần. Chỉ tưới khi đất đã khô hoàn toàn.",
      toxicity: "Có độc đối với mèo và chó nếu nuốt phải."
    }
  },
  {
    id: "monstera-deliciosa",
    name: "Monstera Deliciosa",
    botanicalName: "Monstera deliciosa",
    price: 48,
    description: "Nicknamed the 'Swiss Cheese Plant', the Monstera Deliciosa is famous for its natural leaf fenestrations. It is a fast-growing climber that adds an instant tropical feel to any room.",
    category: "plants",
    image: "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&q=80&w=800",
    images: [
      "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1497250681960-ef046c08a56e?auto=format&fit=crop&q=80&w=800"
    ],
    colorImages: {
      "Terracotta": "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&q=80&w=800",
      "Cream": "https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&q=80&w=800",
      "Mint": "https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&q=80&w=800",
      "Charcoal": "https://images.unsplash.com/photo-1497250681960-ef046c08a56e?auto=format&fit=crop&q=80&w=800"
    },
    light: "medium",
    petFriendly: false,
    difficulty: "moderate",
    size: "large",
    rating: 4.9,
    reviewsCount: 485,
    careDetails: {
      light: "Thích ánh sáng gián tiếp từ trung bình đến rực rỡ. Có thể bị cháy lá dưới ánh nắng trực tiếp.",
      water: "Tưới nước 1-2 tuần một lần. Hãy để đất khô khoảng 50% trước khi tưới lại.",
      toxicity: "Có chứa các tinh thể canxi oxalat, gây kích ứng miệng cho thú cưng."
    }
  },
  {
    id: "parlor-palm",
    name: "Parlor Palm",
    botanicalName: "Chamaedorea elegans",
    price: 32,
    description: "Popular since the Victorian era, the Parlor Palm is a compact, slow-growing palm featuring delicate, feathery fronds. It is highly adaptable and excellent for beginner plant parents.",
    category: "plants",
    image: "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&q=80&w=800",
    images: [
      "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1512428559087-560fa5ceab42?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&q=80&w=800"
    ],
    colorImages: {
      "Terracotta": "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&q=80&w=800",
      "Cream": "https://images.unsplash.com/photo-1512428559087-560fa5ceab42?auto=format&fit=crop&q=80&w=800",
      "Mint": "https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&q=80&w=800",
      "Charcoal": "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&q=80&w=800"
    },
    light: "medium",
    petFriendly: true,
    difficulty: "easy",
    size: "medium",
    rating: 4.7,
    reviewsCount: 198,
    careDetails: {
      light: "Thích ánh sáng gián tiếp trung bình. Chịu được ánh sáng yếu, nhưng sẽ phát triển chậm hơn.",
      water: "Tưới nước 1-2 tuần một lần. Giữ cho đất ẩm nhẹ nhưng không được sũng nước.",
      toxicity: "Hoàn toàn an toàn và thân thiện với chó và mèo!"
    }
  },
  {
    id: "zz-plant",
    name: "ZZ Plant",
    botanicalName: "Zamioculcas zamiifolia",
    price: 36,
    description: "The ZZ Plant is defined by its shiny, dark green waxy leaves and thick rhizomes that store water. It is almost indestructible, thriving in dry environments and low-light conditions.",
    category: "plants",
    image: "https://images.unsplash.com/photo-1632207691143-643e2a9a9361?auto=format&fit=crop&q=80&w=800",
    images: [
      "https://images.unsplash.com/photo-1632207691143-643e2a9a9361?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1525498128493-380d1990a112?auto=format&fit=crop&q=80&w=800"
    ],
    colorImages: {
      "Terracotta": "https://images.unsplash.com/photo-1632207691143-643e2a9a9361?auto=format&fit=crop&q=80&w=800",
      "Cream": "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?auto=format&fit=crop&q=80&w=800",
      "Mint": "https://images.unsplash.com/photo-1525498128493-380d1990a112?auto=format&fit=crop&q=80&w=800",
      "Charcoal": "https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&q=80&w=800"
    },
    light: "low",
    petFriendly: false,
    difficulty: "easy",
    size: "medium",
    rating: 4.9,
    reviewsCount: 264,
    careDetails: {
      light: "Chịu được ánh sáng cực thấp, văn phòng không cửa sổ. Tránh ánh nắng gắt chiếu thẳng.",
      water: "Tưới nước 3-4 tuần một lần. Thân và rễ củ lưu trữ nước cực kỳ tốt, tưới nhiều dễ gây thối rễ.",
      toxicity: "Tất cả các bộ phận của cây đều có độc tính trung bình đối với thú cưng và người."
    }
  },
  {
    id: "peperomia-obtusifolia",
    name: "Peperomia Obtusifolia",
    botanicalName: "Peperomia obtusifolia",
    price: 24,
    description: "Also known as the Baby Rubber Plant, this Peperomia has thick, glossy, spoon-shaped leaves. It is compact, easy to care for, and safe for households with curious pets.",
    category: "plants",
    image: "https://images.unsplash.com/photo-1592150621744-aca64f48394a?auto=format&fit=crop&q=80&w=800",
    images: [
      "https://images.unsplash.com/photo-1592150621744-aca64f48394a?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1533038590840-1cde6b66b72d?auto=format&fit=crop&q=80&w=800"
    ],
    colorImages: {
      "Terracotta": "https://images.unsplash.com/photo-1592150621744-aca64f48394a?auto=format&fit=crop&q=80&w=800",
      "Cream": "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&q=80&w=800",
      "Mint": "https://images.unsplash.com/photo-1533038590840-1cde6b66b72d?auto=format&fit=crop&q=80&w=800",
      "Charcoal": "https://images.unsplash.com/photo-1497250681960-ef046c08a56e?auto=format&fit=crop&q=80&w=800"
    },
    light: "medium",
    petFriendly: true,
    difficulty: "easy",
    size: "small",
    rating: 4.6,
    reviewsCount: 142,
    careDetails: {
      light: "Thích ánh sáng gián tiếp từ trung bình đến rực rỡ. Có thể chịu được ánh sáng yếu.",
      water: "Tưới nước 1-2 tuần một lần. Hãy để đất khô ráo hoàn toàn trước khi tưới lại vì lá mọng nước giữ nước rất tốt.",
      toxicity: "Hoàn toàn an sau cho vật nuôi."
    }
  },
  {
    id: "bird-of-paradise",
    name: "Bird of Paradise",
    botanicalName: "Strelitzia nicolai",
    price: 65,
    description: "The Bird of Paradise is a dramatic, large-stature plant with broad, banana-like leaves that fan out gracefully. It adds a bold, structural focal point to bright rooms.",
    category: "plants",
    image: "https://images.unsplash.com/photo-1497250681960-ef046c08a56e?auto=format&fit=crop&q=80&w=800",
    images: [
      "https://images.unsplash.com/photo-1497250681960-ef046c08a56e?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&q=80&w=800"
    ],
    colorImages: {
      "Terracotta": "https://images.unsplash.com/photo-1497250681960-ef046c08a56e?auto=format&fit=crop&q=80&w=800",
      "Cream": "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&q=80&w=800",
      "Mint": "https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&q=80&w=800",
      "Charcoal": "https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&q=80&w=800"
    },
    light: "bright",
    petFriendly: false,
    difficulty: "moderate",
    size: "large",
    rating: 4.8,
    reviewsCount: 388,
    careDetails: {
      light: "Cần ánh sáng gián tiếp rực rỡ hoặc nắng trực tiếp vài giờ mỗi ngày để lá phát triển to đẹp.",
      water: "Tưới nước hàng tuần. Giữ đất ẩm đều nhưng không ngập úng. Giảm tưới vào mùa đông.",
      toxicity: "Có độc nhẹ đối với chó mèo, có thể gây nôn mửa nếu ăn phải lá hoặc hoa."
    }
  },
  {
    id: "calathea-peacock",
    name: "Calathea Peacock",
    botanicalName: "Goeppertia makoyana",
    price: 42,
    description: "Famous for its stunning variegated leaves resembling a peacock's tail, this Calathea folds its leaves at night (prayer plant family). It loves humidity and a careful watering schedule.",
    category: "plants",
    image: "https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&q=80&w=800",
    images: [
      "https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1620191892729-16b263c9b33b?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1512428559087-560fa5ceab42?auto=format&fit=crop&q=80&w=800"
    ],
    colorImages: {
      "Terracotta": "https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&q=80&w=800",
      "Cream": "https://images.unsplash.com/photo-1512428559087-560fa5ceab42?auto=format&fit=crop&q=80&w=800",
      "Mint": "https://images.unsplash.com/photo-1620191892729-16b263c9b33b?auto=format&fit=crop&q=80&w=800",
      "Charcoal": "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=800"
    },
    light: "medium",
    petFriendly: true,
    difficulty: "care",
    size: "medium",
    rating: 4.5,
    reviewsCount: 175,
    careDetails: {
      light: "Thích ánh sáng gián tiếp trung bình đến yếu. Ánh sáng quá mạnh sẽ làm phai màu hoa văn trên lá.",
      water: "Tưới nước hàng tuần bằng nước lọc hoặc nước cất. Thích đất luôn ẩm nhẹ và môi trường có độ ẩm cao.",
      toxicity: "Tuyệt đối an toàn cho vật nuôi (chó và mèo)."
    }
  },
  {
    id: "anthurium-pink",
    name: "Anthurium Pink",
    botanicalName: "Anthurium andraeanum",
    price: 45,
    description: "The Anthurium features heart-shaped, glossy pink spathes (modified leaves) that bloom almost year-round. It is a stunning flowering plant that thrives in bright indoor spots.",
    category: "plants",
    image: "https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?auto=format&fit=crop&q=80&w=800",
    images: [
      "https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1533038590840-1cde6b66b72d?auto=format&fit=crop&q=80&w=800"
    ],
    colorImages: {
      "Terracotta": "https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?auto=format&fit=crop&q=80&w=800",
      "Cream": "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=800",
      "Mint": "https://images.unsplash.com/photo-1533038590840-1cde6b66b72d?auto=format&fit=crop&q=80&w=800",
      "Charcoal": "https://images.unsplash.com/photo-1525498128493-380d1990a112?auto=format&fit=crop&q=80&w=800"
    },
    light: "bright",
    petFriendly: false,
    difficulty: "moderate",
    size: "small",
    rating: 4.7,
    reviewsCount: 205,
    careDetails: {
      light: "Thích ánh sáng gián tiếp rực rỡ. Càng nhiều ánh sáng gián tiếp, cây sẽ ra hoa càng nhiều và đậm màu.",
      water: "Tưới nước 1-2 tuần một lần. Đợi lớp đất mặt khô khoảng 2-3 cm trước khi tưới tiếp.",
      toxicity: "Có độc cho vật nuôi do các tinh thể canxi oxalat gây kích ứng mạnh."
    }
  }
];

async function main() {
  console.log('Start seeding products...');

  // Xóa các dữ liệu cũ theo thứ tự khóa ngoại để tránh conflict
  await prisma.orderItem.deleteMany({});
  await prisma.wishlist.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.product.deleteMany({});

  // Seed sản phẩm
  for (const product of productsData) {
    await prisma.product.create({
      data: {
        id: product.id,
        name: product.name,
        botanicalName: product.botanicalName,
        price: product.price,
        description: product.description,
        category: product.category,
        image: product.image,
        images: product.images,
        colorImages: product.colorImages,
        light: product.light,
        petFriendly: product.petFriendly,
        difficulty: product.difficulty,
        size: product.size,
        rating: product.rating,
        reviewsCount: product.reviewsCount,
        careDetails: product.careDetails,
      },
    });
  }

  // Seed một admin user mẫu
  const adminPasswordHash = await bcrypt.hash('admin', 10);
  await prisma.user.create({
    data: {
      email: 'dohungg0101@gmail.com',
      name: 'Đỗ Xuân Hùng',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
      role: 'admin',
      password: adminPasswordHash,
      googleId: 'admin_google_id_9999',
    },
  });

  // Seed một user customer mẫu
  const customerPasswordHash = await bcrypt.hash('password123', 10);
  await prisma.user.create({
    data: {
      email: 'khachhang@caycanhnamdinh.vn',
      name: 'Khách hàng Cây Cảnh Đỗ Xuân Hùng',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      role: 'user',
      password: customerPasswordHash,
      googleId: 'mock_google_id_customer',
    },
  });

  console.log('Seeding finished successfully!');
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
