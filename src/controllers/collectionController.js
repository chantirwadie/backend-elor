const prisma = require('../config/db');
const slugify = require('../utils/slugify');

const getCollections = async (req, res, next) => {
  try {
    const collections = await prisma.collection.findMany({
      where: { isActive: true },
      include: { _count: { select: { products: true } } },
      orderBy: { name: 'asc' },
    });
    res.json(collections);
  } catch (error) {
    next(error);
  }
};

const getCollectionBySlug = async (req, res, next) => {
  try {
    const collection = await prisma.collection.findUnique({
      where: { slug: req.params.slug },
      include: { _count: { select: { products: true } } },
    });
    if (!collection) return res.status(404).json({ message: 'Collection non trouvée' });
    res.json(collection);
  } catch (error) {
    next(error);
  }
};

const createCollection = async (req, res, next) => {
  try {
    const { name, description, image, bannerImage } = req.body;
    let slug = slugify(name);

    const existing = await prisma.collection.findUnique({ where: { slug } });
    if (existing) slug = `${slug}-${Date.now()}`;

    const collection = await prisma.collection.create({
      data: { name, slug, description, image, bannerImage },
    });
    res.status(201).json(collection);
  } catch (error) {
    next(error);
  }
};

const updateCollection = async (req, res, next) => {
  try {
    const { name, description, image, bannerImage, isActive } = req.body;
    const data = {};
    if (name) data.name = name;
    if (description !== undefined) data.description = description;
    if (image !== undefined) data.image = image;
    if (bannerImage !== undefined) data.bannerImage = bannerImage;
    if (isActive !== undefined) data.isActive = isActive;

    const collection = await prisma.collection.update({
      where: { id: req.params.id },
      data,
    });
    res.json(collection);
  } catch (error) {
    next(error);
  }
};

const deleteCollection = async (req, res, next) => {
  try {
    await prisma.collection.delete({ where: { id: req.params.id } });
    res.json({ message: 'Collection supprimée' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getCollections, getCollectionBySlug, createCollection, updateCollection, deleteCollection };
