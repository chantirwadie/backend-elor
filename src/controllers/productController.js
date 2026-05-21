const prisma = require('../config/db');
const slugify = require('../utils/slugify');

const parseJsonArray = (value) => {
  try { return JSON.parse(value); } catch { return []; }
};

const serializeArray = (value) => {
  if (Array.isArray(value)) return JSON.stringify(value);
  return value || '[]';
};

const transformProduct = (p) => {
  if (!p) return p;
  return {
    ...p,
    images: parseJsonArray(p.images),
    sizes: parseJsonArray(p.sizes),
  };
};

const getProducts = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 12,
      sort,
      category,
      collection,
      search,
      minPrice,
      maxPrice,
      color,
      material,
      isFeatured,
      isBestSeller,
      isNewArrival,
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const where = { isActive: true };

    if (category) where.category = { slug: category };
    if (collection) where.collection = { slug: collection };
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
      ];
    }
    if (minPrice) where.price = { ...where.price, gte: parseFloat(minPrice) };
    if (maxPrice) where.price = { ...where.price, lte: parseFloat(maxPrice) };
    if (color) where.color = { contains: color };
    if (material) where.material = { contains: material };
    if (isFeatured === 'true') where.isFeatured = true;
    if (isBestSeller === 'true') where.isBestSeller = true;
    if (isNewArrival === 'true') where.isNewArrival = true;

    let orderBy = { createdAt: 'desc' };
    if (sort === 'price-asc') orderBy = { price: 'asc' };
    if (sort === 'price-desc') orderBy = { price: 'desc' };
    if (sort === 'name-asc') orderBy = { name: 'asc' };
    if (sort === 'name-desc') orderBy = { name: 'desc' };
    if (sort === 'best-sellers') orderBy = { isBestSeller: 'desc' };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take,
        include: {
          category: { select: { name: true, slug: true } },
          collection: { select: { name: true, slug: true } },
        },
      }),
      prisma.product.count({ where }),
    ]);

    res.json({
      products: products.map(transformProduct),
      page: parseInt(page),
      totalPages: Math.ceil(total / take),
      total,
    });
  } catch (error) {
    next(error);
  }
};

const getProductBySlug = async (req, res, next) => {
  try {
    const product = await prisma.product.findUnique({
      where: { slug: req.params.slug },
      include: {
        category: { select: { name: true, slug: true } },
        collection: { select: { name: true, slug: true } },
        reviews: {
          where: { isApproved: true },
          include: {
            user: { select: { firstName: true, lastName: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!product) {
      return res.status(404).json({ message: 'Produit non trouvé' });
    }

    res.json(transformProduct(product));
  } catch (error) {
    next(error);
  }
};

const createProduct = async (req, res, next) => {
  try {
    const {
      name, description, shortDescription, price, compareAtPrice,
      images, material, color, sizes, stock,
      isFeatured, isBestSeller, isNewArrival,
      waterproof, hypoallergenic, categoryId, collectionId,
    } = req.body;

    let slug = slugify(name);
    const existing = await prisma.product.findUnique({ where: { slug } });
    if (existing) slug = `${slug}-${Date.now()}`;

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description,
        shortDescription,
        price: parseFloat(price),
        compareAtPrice: compareAtPrice ? parseFloat(compareAtPrice) : null,
        images: serializeArray(images),
        material: material || 'Acier inoxydable',
        color: color || 'Doré',
        sizes: serializeArray(sizes),
        stock: parseInt(stock) || 50,
        isFeatured: isFeatured || false,
        isBestSeller: isBestSeller || false,
        isNewArrival: isNewArrival || false,
        waterproof: waterproof !== undefined ? waterproof : true,
        hypoallergenic: hypoallergenic !== undefined ? hypoallergenic : true,
        categoryId,
        collectionId,
      },
      include: {
        category: { select: { name: true, slug: true } },
        collection: { select: { name: true, slug: true } },
      },
    });

    res.status(201).json(transformProduct(product));
  } catch (error) {
    next(error);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const {
      name, description, shortDescription, price, compareAtPrice,
      images, material, color, sizes, stock,
      isFeatured, isBestSeller, isNewArrival, isActive,
      waterproof, hypoallergenic, categoryId, collectionId,
    } = req.body;

    const data = {};
    if (name) { data.name = name; data.slug = slugify(name); }
    if (description !== undefined) data.description = description;
    if (shortDescription !== undefined) data.shortDescription = shortDescription;
    if (price !== undefined) data.price = parseFloat(price);
    if (compareAtPrice !== undefined) data.compareAtPrice = compareAtPrice ? parseFloat(compareAtPrice) : null;
    if (images !== undefined) data.images = serializeArray(images);
    if (material !== undefined) data.material = material;
    if (color !== undefined) data.color = color;
    if (sizes !== undefined) data.sizes = serializeArray(sizes);
    if (stock !== undefined) data.stock = parseInt(stock);
    if (isFeatured !== undefined) data.isFeatured = isFeatured;
    if (isBestSeller !== undefined) data.isBestSeller = isBestSeller;
    if (isNewArrival !== undefined) data.isNewArrival = isNewArrival;
    if (isActive !== undefined) data.isActive = isActive;
    if (waterproof !== undefined) data.waterproof = waterproof;
    if (hypoallergenic !== undefined) data.hypoallergenic = hypoallergenic;
    if (categoryId !== undefined) data.categoryId = categoryId;
    if (collectionId !== undefined) data.collectionId = collectionId;

    const product = await prisma.product.update({
      where: { id: req.params.id },
      data,
      include: {
        category: { select: { name: true, slug: true } },
        collection: { select: { name: true, slug: true } },
      },
    });

    res.json(transformProduct(product));
  } catch (error) {
    next(error);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    await prisma.product.delete({ where: { id: req.params.id } });
    res.json({ message: 'Produit supprimé' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getProducts, getProductBySlug, createProduct, updateProduct, deleteProduct };
