require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
console.log('DATABASE_URL from env:', process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0, 40) + '...' : 'NOT SET');
const prisma = new PrismaClient({ log: ['query', 'info', 'warn', 'error'] });
prisma.collection.findMany()
  .then(r => console.log('Success:', r.length, 'collections'))
  .catch(e => console.log('Error:', e.message))
  .finally(() => prisma.$disconnect());
