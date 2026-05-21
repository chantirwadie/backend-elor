const bcrypt = require('bcryptjs');
const prisma = require('../config/db');
const generateToken = require('../utils/generateToken');

const register = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password, username } = req.body;

    const userExists = await prisma.user.findUnique({ where: { email } });

    if (username) {
      const usernameExists = await prisma.user.findFirst({ where: { username } });
      if (usernameExists) {
        return res.status(400).json({ message: "Ce nom d'utilisateur est déjà utilisé" });
      }
    }
    if (userExists) {
      return res.status(400).json({ message: 'Cet email est déjà utilisé' });
    }

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        username: username || null,
        password: hashedPassword,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
      },
    });

    await prisma.cart.create({
      data: { userId: user.id },
    });

    const token = generateToken(user.id);

    res.status(201).json({
      user,
      token,
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    let user;
    if (email && email.includes('@')) {
      user = await prisma.user.findUnique({ where: { email } });
    } else {
      user = await prisma.user.findFirst({ where: { username: email } });
    }

    if (!user) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    const token = generateToken(user.id);

    res.json({
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
        city: user.city,
        zipCode: user.zipCode,
        country: user.country,
        avatar: user.avatar,
      },
      token,
    });
  } catch (error) {
    next(error);
  }
};

const getMe = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        phone: true,
        address: true,
        city: true,
        zipCode: true,
        country: true,
        avatar: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    res.json(user);
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const { firstName, lastName, phone, address, city, zipCode, country } = req.body;

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { firstName, lastName, phone, address, city, zipCode, country },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        phone: true,
        address: true,
        city: true,
        zipCode: true,
        country: true,
        avatar: true,
      },
    });

    res.json(user);
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, getMe, updateProfile };
