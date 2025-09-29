const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/livraria-sakura');

const bookSchema = new mongoose.Schema({}, {strict: false});
const Book = mongoose.model('Book', bookSchema);

async function checkTitles() {
  try {
    const books = await Book.find({
      titulo: {$regex: /(Alice|Frankenstein|Drácula)/i}
    });
    
    console.log('Livros encontrados:');
    books.forEach(book => {
      console.log(`- "${book.titulo}"`);
    });
    
  } catch (error) {
    console.error('Erro:', error);
  } finally {
    mongoose.connection.close();
  }
}

checkTitles();