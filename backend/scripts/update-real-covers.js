const mongoose = require('mongoose');
require('dotenv').config();

// Conectar ao MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/livraria-sakura');

// Schema do livro
const bookSchema = new mongoose.Schema({
  titulo: String,
  autor: String,
  preco: Number,
  categoria: String,
  descricao: String,
  imagemUrl: String,
  isbn: String,
  editora: String,
  anoPublicacao: Number,
  numeroPaginas: Number,
  estoque: Number,
  disponivel: Boolean,
  destaques: [String],
  promocoes: [Object],
  tags: [String],
  idioma: String,
  vendas: Number
});

const Book = mongoose.model('Book', bookSchema);

// URLs de capas reais dos livros
const realBookCovers = [
  {
    titulo: "Alice's Adventures in Wonderland",
    imagemUrl: "https://m.media-amazon.com/images/I/91WQx2wKQgL._AC_UF1000,1000_QL80_.jpg"
  },
  {
    titulo: "Frankenstein",
    imagemUrl: "https://m.media-amazon.com/images/I/81z7E0uWdtL._AC_UF1000,1000_QL80_.jpg"
  },
  {
    titulo: "Dracula",
    imagemUrl: "https://m.media-amazon.com/images/I/81QKGpIBZeL._AC_UF1000,1000_QL80_.jpg"
  }
];

async function updateBookCovers() {
  try {
    console.log('🔄 Atualizando capas dos livros...');
    
    for (const bookUpdate of realBookCovers) {
      const result = await Book.updateOne(
        { titulo: bookUpdate.titulo },
        { $set: { imagemUrl: bookUpdate.imagemUrl } }
      );
      
      if (result.matchedCount > 0) {
        console.log(`✅ Atualizada capa do livro: ${bookUpdate.titulo}`);
      } else {
        console.log(`❌ Livro não encontrado: ${bookUpdate.titulo}`);
      }
    }
    
    console.log('🎉 Atualização de capas concluída!');
    
  } catch (error) {
    console.error('❌ Erro ao atualizar capas:', error);
  } finally {
    mongoose.connection.close();
  }
}

updateBookCovers();