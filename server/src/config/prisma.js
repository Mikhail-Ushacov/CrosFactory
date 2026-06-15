const Database = require('better-sqlite3');

const customDatabase = function(...args) {
  const db = new Database(...args);
  
  db.function('like', (pattern, str) => {
    if (typeof pattern !== 'string' || typeof str !== 'string') return 0;
    const escaped = pattern
      .toLowerCase()
      .replace(/[.+^${}()|[\]\\]/g, '\\$&')
      .replace(/%/g, '.*')
      .replace(/_/g, '.');
    return new RegExp('^' + escaped + '$').test(str.toLowerCase()) ? 1 : 0;
  });

  db.function('lower', (str) => typeof str === 'string' ? str.toLowerCase() : str);
  db.function('upper', (str) => typeof str === 'string' ? str.toUpperCase() : str);

  return db;
};

Object.setPrototypeOf(customDatabase, Database);
customDatabase.prototype = Database.prototype;

require.cache[require.resolve('better-sqlite3')].exports = customDatabase;

const { PrismaClient } = require('../../prisma/generated/client');
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');

const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

module.exports = prisma;