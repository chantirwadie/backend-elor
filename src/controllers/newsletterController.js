const prisma = require('../config/db');

const subscribe = async (req, res, next) => {
  try {
    const { email } = req.body;

    const existing = await prisma.newsletterSubscriber.findUnique({ where: { email } });
    if (existing) {
      if (existing.isActive) {
        return res.status(400).json({ message: 'Vous êtes déjà inscrit à la newsletter' });
      }
      await prisma.newsletterSubscriber.update({
        where: { email },
        data: { isActive: true, unsubscribedAt: null },
      });
      return res.json({ message: 'Réinscription réussie' });
    }

    await prisma.newsletterSubscriber.create({ data: { email } });
    res.status(201).json({ message: 'Inscription réussie à la newsletter' });
  } catch (error) {
    next(error);
  }
};

const unsubscribe = async (req, res, next) => {
  try {
    const { email } = req.body;

    await prisma.newsletterSubscriber.update({
      where: { email },
      data: { isActive: false, unsubscribedAt: new Date() },
    });

    res.json({ message: 'Désinscription réussie' });
  } catch (error) {
    next(error);
  }
};

const getSubscribers = async (req, res, next) => {
  try {
    const subscribers = await prisma.newsletterSubscriber.findMany({
      orderBy: { subscribedAt: 'desc' },
    });
    res.json(subscribers);
  } catch (error) {
    next(error);
  }
};

module.exports = { subscribe, unsubscribe, getSubscribers };
