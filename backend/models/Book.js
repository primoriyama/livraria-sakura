const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  titulo: {
    type: String,
    required: [true, 'Título é obrigatório'],
    trim: true,
    minlength: [1, 'Título deve ter pelo menos 1 caractere'],
    maxlength: [200, 'Título deve ter no máximo 200 caracteres']
  },
  autor: {
    type: String,
    required: [true, 'Autor é obrigatório'],
    trim: true,
    minlength: [1, 'Autor deve ter pelo menos 1 caractere'],
    maxlength: [100, 'Autor deve ter no máximo 100 caracteres']
  },
  preco: {
    type: Number,
    required: [true, 'Preço é obrigatório'],
    min: [0, 'Preço deve ser maior ou igual a 0'],
    max: [9999.99, 'Preço deve ser menor que R$ 10.000']
  },
  categoria: {
    type: String,
    required: [true, 'Categoria é obrigatória'],
    enum: [
      'Ficção',
      'Romance',
      'Mistério',
      'Fantasia',
      'Biografia',
      'História',
      'Ciência',
      'Tecnologia',
      'Autoajuda',
      'Negócios',
      'Infantil',
      'Jovem Adulto'
    ]
  },
  descricao: {
    type: String,
    required: [true, 'Descrição é obrigatória'],
    trim: true,
    minlength: [10, 'Descrição deve ter pelo menos 10 caracteres'],
    maxlength: [2000, 'Descrição deve ter no máximo 2000 caracteres']
  },
  imagemUrl: {
    type: String,
    required: [true, 'URL da imagem é obrigatória'],
    trim: true
  },
  isbn: {
    type: String,
    required: [true, 'ISBN é obrigatório'],
    unique: true,
    trim: true,
    match: [/^(?:ISBN(?:-1[03])?:? )?(?=[0-9X]{10}$|(?=(?:[0-9]+[- ]){3})[- 0-9X]{13}$|97[89][0-9]{10}$|(?=(?:[0-9]+[- ]){4})[- 0-9]{17}$)(?:97[89][- ]?)?[0-9]{1,5}[- ]?[0-9]+[- ]?[0-9]+[- ]?[0-9X]$/, 'ISBN inválido']
  },
  editora: {
    type: String,
    required: [true, 'Editora é obrigatória'],
    trim: true,
    minlength: [1, 'Editora deve ter pelo menos 1 caractere'],
    maxlength: [100, 'Editora deve ter no máximo 100 caracteres']
  },
  anoPublicacao: {
    type: Number,
    required: [true, 'Ano de publicação é obrigatório'],
    min: [1000, 'Ano de publicação deve ser maior que 1000'],
    max: [new Date().getFullYear() + 1, 'Ano de publicação não pode ser no futuro']
  },
  numeroPaginas: {
    type: Number,
    required: [true, 'Número de páginas é obrigatório'],
    min: [1, 'Número de páginas deve ser maior que 0'],
    max: [10000, 'Número de páginas deve ser menor que 10.000']
  },
  estoque: {
    type: Number,
    required: [true, 'Estoque é obrigatório'],
    min: [0, 'Estoque não pode ser negativo'],
    max: [9999, 'Estoque deve ser menor que 10.000'],
    default: 0
  },
  disponivel: {
    type: Boolean,
    default: true
  },
  destaque: {
    type: Boolean,
    default: false
  },
  promocao: {
    ativo: { type: Boolean, default: false },
    desconto: { type: Number, min: 0, max: 100, default: 0 },
    dataInicio: Date,
    dataFim: Date
  },
  avaliacoes: [{
    usuario: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    nota: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comentario: {
      type: String,
      maxlength: [500, 'Comentário deve ter no máximo 500 caracteres']
    },
    data: {
      type: Date,
      default: Date.now
    }
  }],
  tags: [String],
  idioma: {
    type: String,
    default: 'Português'
  },
  dimensoes: {
    altura: Number,
    largura: Number,
    profundidade: Number,
    peso: Number
  },
  vendas: {
    type: Number,
    default: 0,
    min: 0
  }
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: function(doc, ret) {
      delete ret.__v;
      return ret;
    }
  }
});

bookSchema.index({ titulo: 'text', autor: 'text', descricao: 'text' });
bookSchema.index({ categoria: 1 });
bookSchema.index({ preco: 1 });
bookSchema.index({ disponivel: 1 });
bookSchema.index({ destaque: 1 });
bookSchema.index({ 'promocao.ativo': 1 });
bookSchema.index({ vendas: -1 });
bookSchema.index({ createdAt: -1 });
bookSchema.index({ isbn: 1 }, { unique: true });

bookSchema.virtual('precoComDesconto').get(function() {
  if (this.promocao.ativo && this.promocao.desconto > 0) {
    const agora = new Date();
    if ((!this.promocao.dataInicio || agora >= this.promocao.dataInicio) &&
        (!this.promocao.dataFim || agora <= this.promocao.dataFim)) {
      return this.preco * (1 - this.promocao.desconto / 100);
    }
  }
  return this.preco;
});

bookSchema.virtual('mediaAvaliacoes').get(function() {
  if (this.avaliacoes.length === 0) return 0;
  const soma = this.avaliacoes.reduce((acc, avaliacao) => acc + avaliacao.nota, 0);
  return Math.round((soma / this.avaliacoes.length) * 10) / 10;
});

bookSchema.virtual('emEstoque').get(function() {
  return this.estoque > 0;
});

bookSchema.virtual('emPromocao').get(function() {
  if (!this.promocao.ativo || this.promocao.desconto <= 0) return false;

  const agora = new Date();
  const inicioValido = !this.promocao.dataInicio || agora >= this.promocao.dataInicio;
  const fimValido = !this.promocao.dataFim || agora <= this.promocao.dataFim;

  return inicioValido && fimValido;
});

bookSchema.methods.adicionarAvaliacao = function(usuarioId, nota, comentario) {
  const avaliacaoExistente = this.avaliacoes.find(
    av => av.usuario.toString() === usuarioId.toString()
  );

  if (avaliacaoExistente) {
    avaliacaoExistente.nota = nota;
    avaliacaoExistente.comentario = comentario;
    avaliacaoExistente.data = new Date();
  } else {
    this.avaliacoes.push({
      usuario: usuarioId,
      nota,
      comentario,
      data: new Date()
    });
  }

  return this.save();
};

bookSchema.methods.removerAvaliacao = function(usuarioId) {
  this.avaliacoes = this.avaliacoes.filter(
    av => av.usuario.toString() !== usuarioId.toString()
  );
  return this.save();
};

bookSchema.methods.decrementarEstoque = function(quantidade = 1) {
  if (this.estoque >= quantidade) {
    this.estoque -= quantidade;
    this.vendas += quantidade;
    return this.save();
  }
  throw new Error('Estoque insuficiente');
};

bookSchema.methods.incrementarEstoque = function(quantidade = 1) {
  this.estoque += quantidade;
  return this.save();
};

bookSchema.pre('save', function(next) {
  if (this.promocao.ativo) {
    if (this.promocao.dataInicio && this.promocao.dataFim) {
      if (this.promocao.dataInicio >= this.promocao.dataFim) {
        return next(new Error('Data de início da promoção deve ser anterior à data de fim'));
      }
    }
  }
  next();
});

module.exports = mongoose.model('Book', bookSchema);
