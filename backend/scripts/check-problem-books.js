const mongoose = require('mongoose');
require('dotenv').config();

// Conectar ao MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Schema do livro
const bookSchema = new mongoose.Schema({
  titulo: String,
  imagemUrl: String,
  autor: String,
});

const Book = mongoose.model('Book', bookSchema);

async function checkProblemBooks() {
  try {
    console.log('Verificando livros com problemas de imagem...\n');
    
    // Lista de livros para verificar (títulos em português e inglês)
    const booksToCheck = [
      'Alice no País das Maravilhas',
      'Alice\'s Adventures in Wonderland',
      'Drácula', 
      'Dracula',
      'O Apanhador no Campo de Centeio',
      'The Catcher in the Rye',
      'O Grande Gatsby',
      'The Great Gatsby',
      'Orgulho e Preconceito',
      'Pride and Prejudice',
      '1984'
    ];
    
    for (const title of booksToCheck) {
      const book = await Book.findOne({ titulo: { $regex: title, $options: 'i' } });
      if (book) {
        console.log(`✓ Encontrado: "${book.titulo}"`);
        console.log(`  Imagem atual: ${book.imagemUrl}`);
        console.log(`  Autor: ${book.autor}\n`);
      }
    }
    
    console.log('Verificação concluída.');
    
  } catch (error) {
    console.error('Erro:', error);
  } finally {
    mongoose.connection.close();
  }
}

checkProblemBooks();