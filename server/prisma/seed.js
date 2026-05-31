const { PrismaClient } = require('./generated/client');
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');
const bcrypt = require('bcrypt');
const path = require('path');

async function main() {
  // Налаштування адаптера (шлях до бази відносно кореня виконання)
  const adapter = new PrismaBetterSqlite3({ url: 'file:./dev.db' });
  const prisma = new PrismaClient({ adapter });

  console.log('⏳ Початок очищення бази даних...');
  // Очищення в правильному порядку (спочатку таблиці зі зовнішніми ключами)
  await prisma.item.deleteMany();
  await prisma.order.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.bannerImage.deleteMany();
  await prisma.newsImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.banner.deleteMany();
  await prisma.news.deleteMany();
  await prisma.image.deleteMany();
  await prisma.user.deleteMany();

  console.log('✅ База очищена. Починаємо заповнення...');

  // 1. СТВОРЕННЯ КОРИСТУВАЧІВ
  const hashedPassword = await bcrypt.hash('1234', 10);
  
  const admin = await prisma.user.create({
    data: {
      login: 'admin',
      password: hashedPassword,
      role: 'admin',
    },
  });

  const simpleUser = await prisma.user.create({
    data: {
      login: 'user',
      password: hashedPassword,
      role: 'user',
    },
  });
  console.log('👤 Користувачі створені (admin/1234, user/1234)');

  // 2. КАТЕГОРІЇ ТА ТОВАРИ
  const categories = [
    { name: 'Електроніка', slug: 'electronics' },
    { name: 'Одяг', slug: 'clothing' },
    { name: 'Аксесуари', slug: 'accessories' },
  ];

  for (const cat of categories) {
    const createdCategory = await prisma.category.create({
      data: {
        name: cat.name,
        slug: cat.slug,
      },
    });

    // Створюємо по 3 товари в кожній категорії
    for (let i = 1; i <= 3; i++) {
      await prisma.product.create({
        data: {
          name: `${cat.name} Товар #${i}`,
          price: Math.floor(Math.random() * 5000) + 200,
          description: `Це детальний опис для ${cat.name} моделі #${i}. Висока якість та гарантія.`,
          categoryId: createdCategory.id,
          images: {
            create: [
              {
                image: {
                  create: { url: `https://picsum.photos/seed/prod${cat.slug}${i}/600/600` }
                }
              },
              {
                image: {
                  create: { url: `https://picsum.photos/seed/extra${cat.slug}${i}/600/600` }
                }
              }
            ]
          }
        }
      });
    }
  }
  console.log('📦 Категорії та товари додані');

  // 3. БАНЕРИ
  const bannersData = [
    {
      title: 'Весняний розпродаж',
      description: 'Знижки до 50% на всю нову колекцію',
      text: 'Акція діє до кінця травня. Встигніть оновити свій гардероб за вигідними цінами!',
      img: 'https://picsum.photos/seed/banner1/1200/400'
    },
    {
      title: 'Нова Електроніка',
      description: 'Найкращі гаджети сезону',
      text: 'Відкрийте для себе світ інновацій з нашими новинками.',
      img: 'https://picsum.photos/seed/banner2/1200/400'
    }
  ];

  for (const b of bannersData) {
    await prisma.banner.create({
      data: {
        title: b.title,
        description: b.description,
        text: b.text,
        images: {
          create: [{ image: { create: { url: b.img } } }]
        }
      }
    });
  }
  console.log('🖼️ Банери створені');

  // 4. НОВИНИ
  const newsData = [
    {
      title: 'Нове надходження: Високоміцне кріплення класу 10.9',
      description: 'Розширюємо асортимент болтів та гайок для високонавантажених конструкцій.',
      text: 'Ми отримали велику партію кріплення класу міцності 10.9 та 12.9. Всі вироби сертифіковані згідно DIN 931 та DIN 933. Ідеально підходить для автомобільної промисловості та важкого машинобудування. Доступні розміри від М6 до М24.',
      tag: 'Асортимент',
      img: 'https://images.unsplash.com/photo-1530124560676-41999250e275?auto=format&fit=crop&q=80&w=800&h=500'
    },
    {
      title: 'Як обрати саморізи для покрівлі',
      description: 'Дізнайтесь, чому якісна EPDM-прокладка рятує ваш дах від протікання.',
      text: 'У цій статті ми розберемо основні критерії вибору покрівельних саморізів. Чому важливо звертати увагу на товщину цинкового покриття та як перевірити якість гумової шайби.',
      tag: 'Блог',
      img: 'https://images.unsplash.com/photo-1581094271901-8022df4466f9?auto=format&fit=crop&q=80&w=800&h=500'
    }
  ];

  for (const n of newsData) {
    await prisma.news.create({
      data: {
        title: n.title,
        description: n.description,
        tag: n.tag,
        // Створюємо зв'язок із зображенням
        images: {
          create: [{
            image: {
              create: { url: n.img }
            }
          }]
        },
        // ВИПРАВЛЕНО: Переносимо текст у блоки контенту (contentBlocks)
        contentBlocks: {
          create: [{
            title: 'Основна інформація',
            text: n.text
          }]
        }
      }
    });
  }
  console.log('📰 Новини додані через contentBlocks');

  // 5. ЗАМОВЛЕННЯ (Тестові дані для кабінету користувача)
  const allProducts = await prisma.product.findMany();
  
  if (allProducts.length > 0) {
    await prisma.order.create({
      data: {
        userId: simpleUser.id,
        sum: allProducts[0].price + allProducts[1].price,
        customerType: 'individual',
        customerName: 'Іван Петренко',
        email: 'ivan@example.com',
        phone: '+380990000000',
        address: 'Київ, вул. Хрещатик, 1',
        items: {
          create: [
            { productId: allProducts[0].id, quantity: 1 },
            { productId: allProducts[1].id, quantity: 1 }
          ]
        }
      }
    });

    // Бізнес замовлення
    await prisma.order.create({
      data: {
        userId: simpleUser.id,
        sum: allProducts[2].price * 2,
        customerType: 'business',
        customerName: 'ТОВ "Сучасні Технології"',
        email: 'corp@tech.ua',
        phone: '+380441112233',
        address: 'Львів, вул. Промислова, 10',
        edrpou: '12345678',
        iban: 'UA123456789012345678901234567',
        bank: 'ПриватБанк',
        taxStatus: 'Платник ПДВ',
        items: {
          create: [
            { productId: allProducts[2].id, quantity: 2 }
          ]
        }
      }
    });
  }
  console.log('🛒 Тестові замовлення створені');

  console.log('🚀 DATABASE SEEDED SUCCESSFULLY!');
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error('❌ Помилка при заповненні бази:', e);
  process.exit(1);
});