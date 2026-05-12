const { PrismaClient } = require('./generated/client'); // Зверніть увагу на шлях, якщо генеруєте в окрему папку
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');
const bcrypt = require('bcrypt');

async function main() {
  // Налаштування адаптера як у основному файлі
  const adapter = new PrismaBetterSqlite3({ url: 'file:./dev.db' });
  const prisma = new PrismaClient({ adapter });

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
    await prisma.category.upsert({
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
                  image: {
                    create: {
                      url: `https://picsum.photos/seed/${cat.slug}${i}/400/400`
                    }
                  }
                }))
              }
            }
          ]
        }
      },
    });
  }

  console.log('✅ Database seeded!');
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});