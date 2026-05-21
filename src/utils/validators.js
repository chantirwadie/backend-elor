const { body, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

const registerValidator = [
  body('firstName').trim().notEmpty().withMessage('Le prénom est requis'),
  body('lastName').trim().notEmpty().withMessage('Le nom est requis'),
  body('email').isEmail().withMessage('Email invalide'),
  body('password').isLength({ min: 6 }).withMessage('Le mot de passe doit contenir au moins 6 caractères'),
  handleValidationErrors,
];

const loginValidator = [
  body('email').trim().notEmpty().withMessage('Email ou identifiant requis'),
  body('password').notEmpty().withMessage('Le mot de passe est requis'),
  handleValidationErrors,
];

const productValidator = [
  body('name').trim().notEmpty().withMessage('Le nom est requis'),
  body('price').isFloat({ min: 0 }).withMessage('Le prix doit être un nombre positif'),
  body('description').trim().notEmpty().withMessage('La description est requise'),
  body('stock').isInt({ min: 0 }).withMessage('Le stock doit être un entier positif'),
  handleValidationErrors,
];

module.exports = { registerValidator, loginValidator, productValidator };
