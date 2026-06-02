const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const UKR_TRANSLIT = {
  'а':'a','б':'b','в':'v','г':'h','ґ':'g','д':'d','е':'e','є':'ye',
  'ж':'zh','з':'z','и':'y','і':'i','ї':'yi','й':'y','к':'k','л':'l',
  'м':'m','н':'n','о':'o','п':'p','р':'r','с':'s','т':'t','у':'u',
  'ф':'f','х':'kh','ц':'ts','ч':'ch','ш':'sh','щ':'shch','ь':'',
  'ю':'yu','я':'ya',
};

function transliterate(text) {
  return text.split('').map(ch => UKR_TRANSLIT[ch] || ch).join('');
}

function slugify(text) {
  return transliterate(text)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function parseNumericValue(raw) {
  const m = String(raw).match(/^(-?[\d.]+)\s*(.+)?$/);
  if (!m) return null;
  const val = parseFloat(m[1]);
  if (isNaN(val)) return null;
  return { value: val, unit: (m[2] || '').trim() };
}

function ensureCategory(db, name) {
  const slug = slugify(name);
  const existing = db.prepare('SELECT id FROM Category WHERE slug = ?').get(slug);
  if (existing) return existing.id;
  const info = db.prepare('INSERT INTO Category (name, slug) VALUES (?, ?)').run(name, slug);
  return Number(info.lastInsertRowid);
}

function ensureImage(db, url) {
  if (!url) return null;
  const existing = db.prepare('SELECT id FROM Image WHERE url = ?').get(url);
  if (existing) return existing.id;
  const info = db.prepare('INSERT INTO Image (url) VALUES (?)').run(url);
  return Number(info.lastInsertRowid);
}

function importProduct(db, productInsert, charInsert, piInsert, data) {
  const categoryName = data.category_path?.[data.category_path.length - 1] || 'Інше';
  const categoryId = ensureCategory(db, categoryName);

  const info = productInsert.run(data.name || '', data.price || 0, data.description || null, categoryId);
  const productId = Number(info.lastInsertRowid);

  const imgId = ensureImage(db, data.image);
  if (imgId != null) {
    piInsert.run(productId, imgId);
  }

  for (const attrs of Object.values(data.characteristics || {})) {
    for (const [name, raw] of Object.entries(attrs)) {
      const parsed = parseNumericValue(raw);
      if (!parsed) continue;
      charInsert.run(name, parsed.value, parsed.unit, productId);
    }
  }
}

function main() {
  if (process.argv.length < 4) {
    console.error('Usage: node import.js <database.db> <products.json>');
    process.exit(1);
  }

  const dbPath = path.resolve(process.argv[2]);
  const jsonPath = path.resolve(process.argv[3]);

  const products = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
  const db = new Database(dbPath);

  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  const productInsert = db.prepare(
    'INSERT INTO Product (name, price, description, categoryId) VALUES (?, ?, ?, ?)'
  );
  const charInsert = db.prepare(
    'INSERT INTO ProductCharacteristic (name, value, unit, productId) VALUES (?, ?, ?, ?)'
  );
  const piInsert = db.prepare('INSERT OR IGNORE INTO ProductImage (productId, imageId) VALUES (?, ?)');

  console.log(`\nImporting ${products.length} products into ${dbPath}...\n`);

  const insertAll = db.transaction(() => {
    for (let i = 0; i < products.length; i++) {
      const p = products[i];
      process.stdout.write(`  [${i + 1}/${products.length}] ${p.name} ... `);
      try {
        importProduct(db, productInsert, charInsert, piInsert, p);
        console.log('OK');
      } catch (err) {
        console.log('ERR:', err.message);
      }
    }
  });

  insertAll();

  console.log(`\nDone.\n`);
  db.close();
}

main();
