const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/livraria-sakura');

const bookSchema = new mongoose.Schema({}, {strict: false});
const Book = mongoose.model('Book', bookSchema);

async function listAllBooks() {
  try {
    console.log('📚 Listando todos os livros no banco de dados...\n');
    
    const books = await Book.find({}, 'titulo autor categoria').sort({ titulo: 1 });
    
    console.log(`📊 Total de livros encontrados: ${books.length}\n`);
    
    books.forEach((book, index) => {
      console.log(`${index + 1}. "${book.titulo}" - ${book.autor} (${book.categoria})`);
    });
    
    console.log('\n✅ Listagem completa!');
    
  } catch (error) {
    console.error('❌ Erro ao listar livros:', error);
  } finally {
    mongoose.connection.close();
  }
}

listAllBooks();