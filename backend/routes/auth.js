const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const {
  generateToken,
  generateRefreshToken,
  validateRefreshToken,
  authenticateToken
} = require('../middleware/auth');

const router = express.Router();

const registerValidation = [
  body('name').trim().isLength({ min: 2, max: 50 }).withMessage('Nome deve ter entre 2 e 50 caracteres'),
  body('email').isEmail().normalizeEmail().withMessage('Email inválido'),
  body('password').isLength({ min: 6 }).withMessage('Senha deve ter pelo menos 6 caracteres').matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Senha deve conter pelo menos uma letra minúscula, uma maiúscula e um número')
];

const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Email inválido'),
  body('password').notEmpty().withMessage('Senha é obrigatória')
];

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Dados inválidos',
      errors: errors.array()
    });
  }
  next();
};

router.post('/register', registerValidation, handleValidationErrors, async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        message: 'Email já está em uso',
        code: 'EMAIL_EXISTS'
      });
    }
    const user = new User({ name, email, password });
    await user.save();
    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);
    res.status(201).json({
      message: 'Usuário criado com sucesso',
      user: user.getPublicProfile(),
      token,
      refreshToken
    });
  } catch (error) {
    console.error('Erro no registro:', error);
    res.status(500).json({ message: 'Erro interno do servidor', code: 'INTERNAL_ERROR' });
  }
});

router.post('/login', loginValidation, handleValidationErrors, async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    
    if (!user || !(await user.comparePassword(password))) {
      if(user) await user.incLoginAttempts();
      return res.status(401).json({ message: 'Credenciais inválidas', code: 'INVALID_CREDENTIALS' });
    }
    if (!user.isActive) {
      return res.status(401).json({ message: 'Conta desativada', code: 'ACCOUNT_DISABLED' });
    }
    if (user.isLocked) {
      return res.status(401).json({ message: 'Conta temporariamente bloqueada', code: 'ACCOUNT_LOCKED' });
    }
    await user.resetLoginAttempts();
    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);
    res.json({
      message: 'Login realizado com sucesso',
      user: user.getPublicProfile(),
      token,
      refreshToken
    });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ message: 'Erro interno do servidor', code: 'INTERNAL_ERROR' });
  }
});

router.post('/refresh', validateRefreshToken, async (req, res) => {
  try {
    const user = req.user;
    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);
    res.json({
      message: 'Token renovado com sucesso',
      user: user.getPublicProfile(),
      token,
      refreshToken
    });
  } catch (error) {
    console.error('Erro na renovação do token:', error);
    res.status(500).json({ message: 'Erro interno do servidor', code: 'INTERNAL_ERROR' });
  }
});

router.get('/me', authenticateToken, async (req, res) => {
  res.json({ user: req.user.getPublicProfile() });
});

router.put('/profile', authenticateToken, [
  body('name').optional().trim().isLength({ min: 2, max: 50 }).withMessage('Nome deve ter entre 2 e 50 caracteres'),
  body('phone').optional().isMobilePhone('pt-BR').withMessage('Telefone inválido'),
  body('address.street').optional().trim().isLength({ max: 100 }).withMessage('Endereço deve ter no máximo 100 caracteres'),
  body('address.city').optional().trim().isLength({ max: 50 }).withMessage('Cidade deve ter no máximo 50 caracteres'),
  body('address.state').optional().trim().isLength({ max: 50 }).withMessage('Estado deve ter no máximo 50 caracteres'),
  body('address.zipCode').optional().matches(/^\d{5}-?\d{3}$/).withMessage('CEP inválido')
], handleValidationErrors, async (req, res) => {
    const { name, phone, address, preferences } = req.body;
    const user = req.user;
    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (address) user.address = { ...user.address, ...address };
    if (preferences) user.preferences = { ...user.preferences, ...preferences };
    await user.save();
    res.json({
      message: 'Perfil atualizado com sucesso',
      user: user.getPublicProfile()
    });
});

router.put('/password', authenticateToken, [
  body('currentPassword').notEmpty().withMessage('Senha atual é obrigatória'),
  body('newPassword').isLength({ min: 6 }).withMessage('Nova senha deve ter pelo menos 6 caracteres').matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Nova senha deve conter pelo menos uma letra minúscula, uma maiúscula e um número')
], handleValidationErrors, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        message: 'Senha atual incorreta',
        code: 'INVALID_CURRENT_PASSWORD'
      });
    }
    user.password = newPassword;
    await user.save();
    res.json({
      message: 'Senha alterada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao alterar senha:', error);
    res.status(500).json({
      message: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

router.post('/logout', authenticateToken, (req, res) => {
  res.json({
    message: 'Logout realizado com sucesso'
  });
});

module.exports = router;