const express = require('express');
const { body, query, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Book = require('../models/Book');
const { authenticateToken, requireAdmin, optionalAuth } = require('../middleware/auth');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = 'uploads/books';
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'book-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Apenas imagens são permitidas (JPEG, JPG, PNG, WebP)'));
    }
  }
});

const bookValidation = [
  body('titulo').trim().isLength({ min: 1, max: 200 }).withMessage('Título deve ter entre 1 e 200 caracteres'),
  body('autor').trim().isLength({ min: 1, max: 100 }).withMessage('Autor deve ter entre 1 e 100 caracteres'),
  body('preco').isFloat({ min: 0, max: 9999.99 }).withMessage('Preço deve ser entre R$ 0,00 e R$ 9.999,99'),
  body('categoria').isIn(['Ficção', 'Romance', 'Mistério', 'Fantasia', 'Biografia', 'História', 'Ciência', 'Tecnologia', 'Autoajuda', 'Negócios', 'Infantil', 'Jovem Adulto']).withMessage('Categoria inválida'),
  body('descricao').trim().isLength({ min: 10, max: 2000 }).withMessage('Descrição deve ter entre 10 e 2000 caracteres'),
  body('isbn').trim().matches(/^(?:ISBN(?:-1[03])?:? )?(?=[0-9X]{10}$|(?=(?:[0-9]+[- ]){3})[- 0-9X]{13}$|97[89][0-9]{10}$|(?=(?:[0-9]+[- ]){4})[- 0-9]{17}$)(?:97[89][- ]?)?[0-9]{1,5}[- ]?[0-9]+[- ]?[0-9]+[- ]?[0-9X]$/).withMessage('ISBN inválido'),
  body('editora').trim().isLength({ min: 1, max: 100 }).withMessage('Editora deve ter entre 1 e 100 caracteres'),
  body('anoPublicacao').isInt({ min: 1000, max: new Date().getFullYear() + 1 }).withMessage('Ano de publicação inválido'),
  body('numeroPaginas').isInt({ min: 1, max: 10000 }).withMessage('Número de páginas deve ser entre 1 e 10.000'),
  body('estoque').isInt({ min: 0, max: 9999 }).withMessage('Estoque deve ser entre 0 e 9.999')
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

router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Página deve ser um número positivo'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limite deve ser entre 1 e 100'),
  query('categoria').optional().isString(),
  query('autor').optional().isString(),
  query('precoMin').optional().isFloat({ min: 0 }),
  query('precoMax').optional().isFloat({ min: 0 }),
  query('search').optional().isString(),
  query('sort').optional().isIn(['titulo', 'autor', 'preco', 'createdAt', 'vendas', 'mediaAvaliacoes']),
  query('order').optional().isIn(['asc', 'desc'])
], handleValidationErrors, optionalAuth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 100,
      categoria,
      autor,
      precoMin,
      precoMax,
      search,
      sort = 'createdAt',
      order = 'desc',
      disponivel
    } = req.query;

    const filters = {};
    
    if (disponivel !== undefined) {
      filters.disponivel = disponivel === 'true' || disponivel === true;
    }

    if (categoria) filters.categoria = categoria;
    if (autor) filters.autor = new RegExp(autor, 'i');
    if (precoMin || precoMax) {
      filters.preco = {};
      if (precoMin) filters.preco.$gte = parseFloat(precoMin);
      if (precoMax) filters.preco.$lte = parseFloat(precoMax);
    }
    if (search) {
      filters.$text = { $search: search };
    }

    const sortOrder = order === 'desc' ? -1 : 1;
    const sortOptions = { [sort]: sortOrder };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [books, total] = await Promise.all([
      Book.find(filters)
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit))
        .populate('avaliacoes.usuario', 'name avatar'),
      Book.countDocuments(filters)
    ]);

    const totalPages = Math.ceil(total / parseInt(limit));

    res.json({
      books,
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
    console.error('Erro ao listar livros:', error);
    res.status(500).json({
      message: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

router.get('/featured', async (req, res) => {
  try {
    const books = await Book.find({ 
      destaque: true, 
      disponivel: true 
    })
    .sort({ vendas: -1 })
    .limit(8)
    .populate('avaliacoes.usuario', 'name avatar');

    res.json({ books });
  } catch (error) {
    console.error('Erro ao buscar livros em destaque:', error);
    res.status(500).json({
      message: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

router.get('/categories', async (req, res) => {
  try {
    const categories = await Book.distinct('categoria');
    res.json({ categories });
  } catch (error) {
    console.error('Erro ao listar categorias:', error);
    res.status(500).json({
      message: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id)
      .populate('avaliacoes.usuario', 'name avatar');

    if (!book) {
      return res.status(404).json({
        message: 'Livro não encontrado',
        code: 'BOOK_NOT_FOUND'
      });
    }

    res.json({ book });
  } catch (error) {
    console.error('Erro ao buscar livro:', error);
    res.status(500).json({
      message: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

router.post('/', authenticateToken, requireAdmin, bookValidation, handleValidationErrors, async (req, res) => {
  try {
    const bookData = req.body;
    const existingBook = await Book.findOne({ isbn: bookData.isbn });
    if (existingBook) {
      return res.status(409).json({
        message: 'ISBN já existe',
        code: 'ISBN_EXISTS'
      });
    }

    const book = new Book(bookData);
    await book.save();

    res.status(201).json({
      message: 'Livro criado com sucesso',
      book
    });
  } catch (error) {
    console.error('Erro ao criar livro:', error);
    res.status(500).json({
      message: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

router.put('/:id', authenticateToken, requireAdmin, bookValidation, handleValidationErrors, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({
        message: 'Livro não encontrado',
        code: 'BOOK_NOT_FOUND'
      });
    }

    if (req.body.isbn && req.body.isbn !== book.isbn) {
      const existingBook = await Book.findOne({ 
        isbn: req.body.isbn, 
        _id: { $ne: req.params.id } 
      });
      if (existingBook) {
        return res.status(409).json({
          message: 'ISBN já existe',
          code: 'ISBN_EXISTS'
        });
      }
    }

    Object.assign(book, req.body);
    await book.save();

    res.json({
      message: 'Livro atualizado com sucesso',
      book
    });
  } catch (error) {
    console.error('Erro ao atualizar livro:', error);
    res.status(500).json({
      message: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);

    if (!book) {
      return res.status(404).json({
        message: 'Livro não encontrado',
        code: 'BOOK_NOT_FOUND'
      });
    }

    res.json({
      message: 'Livro deletado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao deletar livro:', error);
    res.status(500).json({
      message: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

router.post('/:id/upload-image', authenticateToken, requireAdmin, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: 'Nenhuma imagem foi enviada',
        code: 'NO_IMAGE'
      });
    }

    const book = await Book.findById(req.params.id);
    if (!book) {
      fs.unlinkSync(req.file.path);
      return res.status(404).json({
        message: 'Livro não encontrado',
        code: 'BOOK_NOT_FOUND'
      });
    }

    if (book.imagemUrl && book.imagemUrl.startsWith('/uploads/')) {
      const oldImagePath = path.join(__dirname, '..', book.imagemUrl);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }

    book.imagemUrl = `/uploads/books/${req.file.filename}`;
    await book.save();

    res.json({
      message: 'Imagem enviada com sucesso',
      imagemUrl: book.imagemUrl
    });
  } catch (error) {
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    console.error('Erro no upload da imagem:', error);
    res.status(500).json({
      message: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

router.post('/:id/reviews', authenticateToken, [
  body('nota').isInt({ min: 1, max: 5 }).withMessage('Nota deve ser entre 1 e 5'),
  body('comentario').optional().isLength({ max: 500 }).withMessage('Comentário deve ter no máximo 500 caracteres')
], handleValidationErrors, async (req, res) => {
  try {
    const { nota, comentario } = req.body;
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({
        message: 'Livro não encontrado',
        code: 'BOOK_NOT_FOUND'
      });
    }

    await book.adicionarAvaliacao(req.user._id, nota, comentario);

    res.json({
      message: 'Avaliação adicionada com sucesso',
      mediaAvaliacoes: book.mediaAvaliacoes
    });
  } catch (error) {
    console.error('Erro ao adicionar avaliação:', error);
    res.status(500).json({
      message: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

router.delete('/:id/reviews', authenticateToken, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({
        message: 'Livro não encontrado',
        code: 'BOOK_NOT_FOUND'
      });
    }

    await book.removerAvaliacao(req.user._id);

    res.json({
      message: 'Avaliação removida com sucesso'
    });
  } catch (error) {
    console.error('Erro ao remover avaliação:', error);
    res.status(500).json({
      message: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

module.exports = router;