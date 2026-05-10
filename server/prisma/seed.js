const { PrismaClient } = require('@prisma/client');
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');
const bcrypt = require('bcrypt');

const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  // 1. Створення адміна
  const adminPassword = await bcrypt.hash('1234', 10);
  await prisma.user.upsert({
    where: { login: 'admin' },
    update: {},
    create: {
      login: 'admin',
      password: adminPassword,
      role: 'admin',
    },
  });

  // 2. Створення категорій та товарів
  const categoriesData = [
    { name: 'Електроніка', slug: 'electronics' },
    { name: 'Одяг', slug: 'clothing' },
    { name: 'Взуття', slug: 'shoes' },
    { name: 'Дім', slug: 'home' },
    { name: 'Краса', slug: 'beauty' },
  ];

  for (const cat of categoriesData) {
    const category = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: {
        name: cat.name,
        slug: cat.slug,
        products: {
          create: [
            {
              name: `${cat.name} Товар #1`,
              price: Math.floor(Math.random() * 10000) + 500,
              description: `Опис для ${cat.name} #1`,
              images: {
                create: Array.from({ length: 3 }).map((_, i) => ({
                  url: `https://picsum.photos/seed/${cat.slug}${i}/400/400`
                }))
              }
            }
          ]
        }
      },
    });
  }

  console.log('✅ Database seeded!');
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());