const mongoose = require('mongoose');
require('dotenv').config();

const Book = require('../models/Book');

const listFictionBooks = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/livraria-sakura');
    console.log('✅ Conectado ao MongoDB');

    const fictionBooks = await Book.find({ categoria: 'Ficção' }).sort({ titulo: 1 });
    console.log(`📚 Total de livros de ficção: ${fictionBooks.length}`);
    
    if (fictionBooks.length > 0) {
      console.log('\n📖 Livros de ficção no banco:');
      fictionBooks.forEach((book, index) => {
        console.log(`${index + 1}. "${book.titulo}" - ${book.autor}`);
      });
    }

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Conexão encerrada');
    process.exit(0);
  }
};

listFictionBooks();