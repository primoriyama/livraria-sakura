const mongoose = require('mongoose');
require('dotenv').config();
const Book = require('../models/Book');

const listTitles = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/livraria-sakura');
    console.log('✅ Conectado ao MongoDB');
    
    const books = await Book.find({}, 'titulo').sort({ titulo: 1 });
    console.log('\n📚 Títulos atuais no banco:');
    books.forEach((book, index) => {
      console.log(`${index + 1}. "${book.titulo}"`);
    });
    
    console.log(`\n📊 Total: ${books.length} livros`);
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Conexão encerrada');
    process.exit(0);
  }
};

listTitles();