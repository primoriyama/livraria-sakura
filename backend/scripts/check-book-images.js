const mongoose = require('mongoose');
require('dotenv').config();
const Book = require('../models/Book');

async function checkBookImages() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/livraria-sakura');
    console.log('✅ Conectado ao MongoDB');
    
    const books = await Book.find({}, 'titulo imagemUrl').sort({ titulo: 1 });
    console.log('\n📚 Livros no banco de dados:\n');
    
    books.forEach(book => {
      console.log(`- ${book.titulo}: ${book.imagemUrl}`);
    });
    
    console.log(`\n📊 Total de livros: ${books.length}`);
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    mongoose.connection.close();
    console.log('\n🔌 Conexão encerrada');
  }
}

checkBookImages();