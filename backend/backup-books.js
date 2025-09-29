const mongoose = require('mongoose');
const fs = require('fs');
require('dotenv').config();

const bookSchema = new mongoose.Schema({
  titulo: String,
  imagemUrl: String,
  categoria: String,
  preco: Number,
  autor: String,
  descricao: String,
  disponivel: Boolean
});

const Book = mongoose.model('Book', bookSchema);

async function backupBooks() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('🔗 Conectado ao MongoDB');

    const allBooks = await Book.find({});
    console.log(`📚 Fazendo backup de ${allBooks.length} livros...`);

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = `backup-books-${timestamp}.json`;

    fs.writeFileSync(backupFile, JSON.stringify(allBooks, null, 2));
    console.log(`✅ Backup salvo em: ${backupFile}`);

    await mongoose.disconnect();
    console.log('🔌 Desconectado do MongoDB');

  } catch (error) {
    console.error('❌ Erro no backup:', error);
  }
}

backupBooks();
