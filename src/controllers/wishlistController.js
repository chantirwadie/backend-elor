const prisma = require('../config/db');

const getWishlist = async (req, res, next) => {
  try {
    const items = await prisma.wishlistItem.findMany({
      where: { userId: req.user.id },
      include: {
        product: {
          select: { id: true, name: true, slug: true, price: true, images: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(items);
  } catch (error) {
    next(error);
  }
};

const addToWishlist = async (req, res, next) => {
  try {
    const { productId } = req.body;

    const existing = await prisma.wishlistItem.findUnique({
      where: { userId_productId: { userId: req.user.id, productId } },
    });
    if (existing) return res.status(400).json({ message: 'Déjà dans vos favoris' });

    const item = await prisma.wishlistItem.create({
      data: { userId: req.user.id, productId },
      include: {
        product: { select: { id: true, name: true, slug: true, price: true, images: true } },
      },
    });
    res.status(201).json(item);
  } catch (error) {
    next(error);
  }
};

const removeFromWishlist = async (req, res, next) => {
  try {
    const { productId } = req.params;

    await prisma.wishlistItem.deleteMany({
      where: { userId: req.user.id, productId },
    });
    res.json({ message: 'Retiré des favoris' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getWishlist, addToWishlist, removeFromWishlist };
