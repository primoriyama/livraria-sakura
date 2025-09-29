const mongoose = require('mongoose');
require('dotenv').config();

const Book = require('../models/Book');

const checkDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/livraria-sakura');
    console.log('✅ Conectado ao MongoDB');

    const totalBooks = await Book.countDocuments();
    console.log(`📚 Total de livros no banco: ${totalBooks}`);

    if (totalBooks > 0) {
      const availableBooks = await Book.countDocuments({ disponivel: true });
      console.log(`✅ Livros disponíveis: ${availableBooks}`);

      const unavailableBooks = await Book.countDocuments({ disponivel: false });
      console.log(`❌ Livros indisponíveis: ${unavailableBooks}`);

      // Mostrar alguns livros
      const sampleBooks = await Book.find().limit(3);
      console.log('\n📖 Exemplos de livros:');
      sampleBooks.forEach((book, index) => {
        console.log(`${index + 1}. ${book.titulo} - ${book.autor} (Disponível: ${book.disponivel})`);
      });
    }

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Conexão encerrada');
    process.exit(0);
  }
};

checkDatabase();