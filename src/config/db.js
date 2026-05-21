const { PrismaClient, Prisma } = require('@prisma/client');

console.log('PrismaClientVersion:', Prisma.prismaVersion.client);
console.log('DATABASE_URL:', process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0, 40) + '...' : 'NOT SET');

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

module.exports = prisma;
