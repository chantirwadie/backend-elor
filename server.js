require('dotenv').config();
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const app = require('./src/app');

const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

async function createDefaultAdmin() {
  try {
    const existing = await prisma.user.findFirst({ where: { username: 'wahiba' } });
    if (!existing) {
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash('wahiba', salt);
      await prisma.user.create({
        data: {
          username: 'wahiba',
          email: 'wahiba@admin.com',
          password: hashedPassword,
          firstName: 'Wahiba',
          lastName: 'Admin',
          role: 'ADMIN',
        },
      });
      console.log('Default admin created: wahiba / wahiba');
    }
  } catch (error) {
    console.error('Error creating default admin:', error.message);
  }
}

app.listen(PORT, async () => {
  console.log(`Élor Paris API running on port ${PORT}`);
  await createDefaultAdmin();
});
