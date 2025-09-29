const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/livraria-sakura');

const bookSchema = new mongoose.Schema({}, {strict: false});
const Book = mongoose.model('Book', bookSchema);

async function findDracula() {
  try {
    // Buscar por diferentes variações do título
    const variations = ['Dracula', 'Drácula', 'dracula', 'drácula'];
    
    for (const variation of variations) {
      const books = await Book.find({ titulo: variation });
      if (books.length > 0) {
        console.log(`Encontrado com título "${variation}":`);
        books.forEach(book => console.log(`- ${book.titulo}`));
      }
    }
    
    // Buscar por autor
    const byAuthor = await Book.find({ autor: /Bram Stoker/i });
    if (byAuthor.length > 0) {
      console.log('Livros de Bram Stoker:');
      byAuthor.forEach(book => console.log(`- ${book.titulo}`));
    }
    
    // Buscar todos os livros para ver se existe
    const allBooks = await Book.find({});
    console.log(`\nTotal de livros no banco: ${allBooks.length}`);
    
  } catch (error) {
    console.error('Erro:', error);
  } finally {
    mongoose.connection.close();
  }
}

findDracula();