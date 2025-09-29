const express = require('express');
const { body, query, validationResult } = require('express-validator');
const User = require('../models/User');
const { authenticateToken, requireAdmin, requireOwnershipOrAdmin } = require('../middleware/auth');

const router = express.Router();

// Função para tratar erros de validação
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

// GET /api/users - Listar usuários (Admin apenas)
router.get('/', authenticateToken, requireAdmin, [
  query('page').optional().isInt({ min: 1 }).withMessage('Página deve ser um número positivo'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limite deve ser entre 1 e 100'),
  query('search').optional().isString(),
  query('role').optional().isIn(['user', 'admin']),
  query('isActive').optional().isBoolean(),
  query('sort').optional().isIn(['name', 'email', 'createdAt', 'lastLogin']),
  query('order').optional().isIn(['asc', 'desc'])
], handleValidationErrors, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      role,
      isActive,
      sort = 'createdAt',
      order = 'desc'
    } = req.query;

    // Construir filtros
    const filters = {};

    if (role) filters.role = role;
    if (isActive !== undefined) filters.isActive = isActive === 'true';
    if (search) {
      filters.$or = [
        { name: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') }
      ];
    }

    // Configurar ordenação
    const sortOrder = order === 'desc' ? -1 : 1;
    const sortOptions = { [sort]: sortOrder };

    // Executar consulta com paginação
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [users, total] = await Promise.all([
      User.find(filters)
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit))
        .select('-password -loginAttempts -lockUntil'),
      User.countDocuments(filters)
    ]);

    const totalPages = Math.ceil(total / parseInt(limit));

    res.json({
      users,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems: total,
        itemsPerPage: parseInt(limit),
        hasNextPage: parseInt(page) < totalPages,
        hasPrevPage: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Erro ao listar usuários:', error);
    res.status(500).json({
      message: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

// GET /api/users/stats - Estatísticas de usuários (Admin apenas)
router.get('/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [
      totalUsers,
      activeUsers,
      adminUsers,
      recentUsers
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isActive: true }),
      User.countDocuments({ role: 'admin' }),
      User.countDocuments({ 
        createdAt: { 
          $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // últimos 30 dias
        } 
      })
    ]);

    res.json({
      stats: {
        totalUsers,
        activeUsers,
        inactiveUsers: totalUsers - activeUsers,
        adminUsers,
        regularUsers: totalUsers - adminUsers,
        recentUsers
      }
    });
  } catch (error) {
    console.error('Erro ao obter estatísticas:', error);
    res.status(500).json({
      message: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

// GET /api/users/:id - Obter usuário por ID
router.get('/:id', authenticateToken, requireOwnershipOrAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password -loginAttempts -lockUntil');

    if (!user) {
      return res.status(404).json({
        message: 'Usuário não encontrado',
        code: 'USER_NOT_FOUND'
      });
    }

    res.json({ user });
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    res.status(500).json({
      message: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

// PUT /api/users/:id - Atualizar usuário
router.put('/:id', authenticateToken, requireOwnershipOrAdmin, [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Nome deve ter entre 2 e 50 caracteres'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Email inválido'),
  body('phone')
    .optional()
    .isMobilePhone('pt-BR')
    .withMessage('Telefone inválido'),
  body('role')
    .optional()
    .isIn(['user', 'admin'])
    .withMessage('Role inválido'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive deve ser boolean')
], handleValidationErrors, async (req, res) => {
  try {
    const { name, email, phone, address, preferences, role, isActive } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: 'Usuário não encontrado',
        code: 'USER_NOT_FOUND'
      });
    }

    // Verificar se email já existe em outro usuário
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ 
        email, 
        _id: { $ne: req.params.id } 
      });
      if (existingUser) {
        return res.status(409).json({
          message: 'Email já está em uso',
          code: 'EMAIL_EXISTS'
        });
      }
    }

    // ===== CORREÇÃO APLICADA AQUI =====
    const isAdmin = req.user.role === 'admin';
    const isOwner = req.user._id.toString() === req.params.id;

    if ((role !== undefined || isActive !== undefined) && !isAdmin) {
      return res.status(403).json({
        message: 'Apenas administradores podem alterar role e status',
        code: 'ADMIN_REQUIRED'
      });
    }

    // Impedir que admin remova próprio privilégio
    if (isOwner && role === 'user' && req.user.role === 'admin') {
      return res.status(400).json({
        message: 'Você não pode remover seus próprios privilégios de administrador',
        code: 'CANNOT_DEMOTE_SELF'
      });
    }

    // Atualizar campos permitidos
    if (name) user.name = name;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    if (address) user.address = { ...user.address, ...address };
    if (preferences) user.preferences = { ...user.preferences, ...preferences };
    
    // Campos apenas para admin
    if (isAdmin) {
      if (role !== undefined) user.role = role;
      if (isActive !== undefined) user.isActive = isActive;
    }

    await user.save();

    res.json({
      message: 'Usuário atualizado com sucesso',
      user: user.getPublicProfile()
    });
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    res.status(500).json({
      message: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

// DELETE /api/users/:id - Deletar usuário (Admin apenas)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: 'Usuário não encontrado',
        code: 'USER_NOT_FOUND'
      });
    }

    // Impedir que admin delete a si mesmo
    if (req.user._id.toString() === req.params.id) {
      return res.status(400).json({
        message: 'Você não pode deletar sua própria conta',
        code: 'CANNOT_DELETE_SELF'
      });
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({
      message: 'Usuário deletado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao deletar usuário:', error);
    res.status(500).json({
      message: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

// POST /api/users/:id/toggle-status - Alternar status do usuário (Admin apenas)
router.post('/:id/toggle-status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: 'Usuário não encontrado',
        code: 'USER_NOT_FOUND'
      });
    }

    // Impedir que admin desative a si mesmo
    if (req.user._id.toString() === req.params.id) {
      return res.status(400).json({
        message: 'Você não pode alterar o status da sua própria conta',
        code: 'CANNOT_TOGGLE_SELF'
      });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({
      message: `Usuário ${user.isActive ? 'ativado' : 'desativado'} com sucesso`,
      user: user.getPublicProfile()
    });
  } catch (error) {
    console.error('Erro ao alterar status do usuário:', error);
    res.status(500).json({
      message: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

// POST /api/users/:id/toggle-role - Alternar role do usuário (Admin apenas)
router.post('/:id/toggle-role', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: 'Usuário não encontrado',
        code: 'USER_NOT_FOUND'
      });
    }

    // Impedir que admin altere próprio role
    if (req.user._id.toString() === req.params.id) {
      return res.status(400).json({
        message: 'Você não pode alterar seu próprio role',
        code: 'CANNOT_CHANGE_OWN_ROLE'
      });
    }

    user.role = user.role === 'admin' ? 'user' : 'admin';
    await user.save();

    res.json({
      message: `Usuário ${user.role === 'admin' ? 'promovido a administrador' : 'rebaixado para usuário comum'}`,
      user: user.getPublicProfile()
    });
  } catch (error) {
    console.error('Erro ao alterar role do usuário:', error);
    res.status(500).json({
      message: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

// POST /api/users/:id/unlock - Desbloquear usuário (Admin apenas)
router.post('/:id/unlock', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: 'Usuário não encontrado',
        code: 'USER_NOT_FOUND'
      });
    }

    if (!user.isLocked) {
      return res.status(400).json({
        message: 'Usuário não está bloqueado',
        code: 'USER_NOT_LOCKED'
      });
    }

    await user.resetLoginAttempts();

    res.json({
      message: 'Usuário desbloqueado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao desbloquear usuário:', error);
    res.status(500).json({
      message: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

// GET /api/users/:id/activity - Obter atividade do usuário (Owner ou Admin)
router.get('/:id/activity', authenticateToken, requireOwnershipOrAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('name email createdAt lastLogin loginAttempts isActive');

    if (!user) {
      return res.status(404).json({
        message: 'Usuário não encontrado',
        code: 'USER_NOT_FOUND'
      });
    }

    res.json({
      activity: {
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
        isActive: user.isActive,
        isLocked: user.isLocked
      }
    });
  } catch (error) {
    console.error('Erro ao obter atividade do usuário:', error);
    res.status(500).json({
      message: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

module.exports = router;