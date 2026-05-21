const prisma = require('../config/db');

const parseImage = (product) => {
  if (!product) return product;
  try { product.images = JSON.parse(product.images); } catch { product.images = []; }
  return product;
};

const getCart = async (req, res, next) => {
  try {
    let cart = await prisma.cart.findUnique({
      where: { userId: req.user.id },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                price: true,
                images: true,
                stock: true,
                isActive: true,
              },
            },
          },
        },
      },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId: req.user.id },
        include: { items: { include: { product: { select: { id: true, name: true, slug: true, price: true, images: true, stock: true, isActive: true } } } } },
      });
    }

    if (cart?.items) {
      cart.items = cart.items.map((item) => ({
        ...item,
        product: parseImage(item.product),
      }));
    }
    res.json(cart);
  } catch (error) {
    next(error);
  }
};

const addToCart = async (req, res, next) => {
  try {
    const { productId, quantity = 1, size } = req.body;

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) return res.status(404).json({ message: 'Produit non trouvé' });
    if (!product.isActive) return res.status(400).json({ message: 'Ce produit n\'est plus disponible' });

    let cart = await prisma.cart.findUnique({ where: { userId: req.user.id } });
    if (!cart) {
      cart = await prisma.cart.create({ data: { userId: req.user.id } });
    }

    const existingItem = await prisma.cartItem.findUnique({
      where: { cartId_productId: { cartId: cart.id, productId } },
    });

    if (existingItem) {
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity },
      });
    } else {
      await prisma.cartItem.create({
        data: { cartId: cart.id, productId, quantity, size },
      });
    }

    const updatedCart = await prisma.cart.findUnique({
      where: { id: cart.id },
      include: {
        items: {
          include: {
            product: {
              select: { id: true, name: true, slug: true, price: true, images: true, stock: true, isActive: true },
            },
          },
        },
      },
    });

    if (updatedCart?.items) {
      updatedCart.items = updatedCart.items.map((item) => ({
        ...item,
        product: parseImage(item.product),
      }));
    }
    res.json(updatedCart);
  } catch (error) {
    next(error);
  }
};

const updateCartItem = async (req, res, next) => {
  try {
    const { quantity } = req.body;

    const item = await prisma.cartItem.findUnique({
      where: { id: req.params.itemId },
      include: { cart: true },
    });

    if (!item) return res.status(404).json({ message: 'Article non trouvé' });
    if (item.cart.userId !== req.user.id) return res.status(403).json({ message: 'Non autorisé' });

    if (quantity <= 0) {
      await prisma.cartItem.delete({ where: { id: item.id } });
    } else {
      await prisma.cartItem.update({
        where: { id: item.id },
        data: { quantity },
      });
    }

    const cart = await prisma.cart.findUnique({
      where: { id: item.cartId },
      include: {
        items: {
          include: {
            product: {
              select: { id: true, name: true, slug: true, price: true, images: true, stock: true, isActive: true },
            },
          },
        },
      },
    });

    if (cart?.items) {
      cart.items = cart.items.map((item) => ({
        ...item,
        product: parseImage(item.product),
      }));
    }
    res.json(cart);
  } catch (error) {
    next(error);
  }
};

const removeCartItem = async (req, res, next) => {
  try {
    const item = await prisma.cartItem.findUnique({
      where: { id: req.params.itemId },
      include: { cart: true },
    });

    if (!item) return res.status(404).json({ message: 'Article non trouvé' });
    if (item.cart.userId !== req.user.id) return res.status(403).json({ message: 'Non autorisé' });

    await prisma.cartItem.delete({ where: { id: item.id } });

    const cart = await prisma.cart.findUnique({
      where: { id: item.cartId },
      include: {
        items: {
          include: {
            product: {
              select: { id: true, name: true, slug: true, price: true, images: true, stock: true, isActive: true },
            },
          },
        },
      },
    });

    if (cart?.items) {
      cart.items = cart.items.map((item) => ({
        ...item,
        product: parseImage(item.product),
      }));
    }
    res.json(cart);
  } catch (error) {
    next(error);
  }
};

module.exports = { getCart, addToCart, updateCartItem, removeCartItem };
