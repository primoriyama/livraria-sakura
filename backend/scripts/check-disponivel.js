const mongoose = require('mongoose');
require('dotenv').config();

const Book = require('../models/Book');

const checkDisponivel = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/livraria-sakura');
    console.log('✅ Conectado ao MongoDB');

    const sampleBooks = await Book.find().limit(5);

    console.log('\n📖 Verificando campo "disponivel":');
    sampleBooks.forEach((book, index) => {
      console.log(`${index + 1}. ${book.titulo}`);
      console.log(`   disponivel: ${book.disponivel} (tipo: ${typeof book.disponivel})`);
      console.log('');
    });

    console.log('🔍 Testando consultas:');

    const countTrue = await Book.countDocuments({ disponivel: true });
    console.log(`disponivel: true (boolean) -> ${countTrue} livros`);

    const countStringTrue = await Book.countDocuments({ disponivel: 'true' });
    console.log(`disponivel: 'true' (string) -> ${countStringTrue} livros`);

    const countAll = await Book.countDocuments({});
    console.log(`Todos os livros -> ${countAll} livros`);

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Conexão encerrada');
    process.exit(0);
  }
};

checkDisponivel();
