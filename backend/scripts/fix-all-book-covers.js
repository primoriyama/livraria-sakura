const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const bookSchema = new mongoose.Schema({
  titulo: String,
  imagemUrl: String,
  autor: String,
});

const Book = mongoose.model('Book', bookSchema);

async function fixBookCovers() {
  try {
    console.log('Corrigindo capas dos livros...\n');

    const bookUpdates = [
      {
        title: "Alice's Adventures in Wonderland",
        newImageUrl: "https://m.media-amazon.com/images/I/71yJLhQekBL._AC_UF1000,1000_QL80_.jpg"
      },
      {
        title: "Dracula",
        newImageUrl: "https://m.media-amazon.com/images/I/81aY1lxk+9L._AC_UF1000,1000_QL80_.jpg"
      },
      {
        title: "The Catcher in the Rye",
        newImageUrl: "https://m.media-amazon.com/images/I/8125BDk3l9L._AC_UF1000,1000_QL80_.jpg"
      },
      {
        title: "The Great Gatsby",
        newImageUrl: "https://m.media-amazon.com/images/I/81QuEGw8VPL._AC_UF1000,1000_QL80_.jpg"
      },
      {
        title: "Pride and Prejudice",
        newImageUrl: "https://m.media-amazon.com/images/I/712P0p5cXIS._AC_UF1000,1000_QL80_.jpg"
      },
      {
        title: "1984",
        newImageUrl: "https://m.media-amazon.com/images/I/71kxa1-0mfL._AC_UF1000,1000_QL80_.jpg"
      }
    ];

    for (const update of bookUpdates) {
      const result = await Book.updateOne(
        { titulo: update.title },
        { $set: { imagemUrl: update.newImageUrl } }
      );

      if (result.matchedCount > 0) {
        console.log(`✓ ${update.title} - Capa atualizada com sucesso`);
      } else {
        console.log(`✗ ${update.title} - Livro não encontrado`);
      }
    }

    console.log('\nTodas as capas foram atualizadas!');

  } catch (error) {
    console.error('Erro:', error);
  } finally {
    mongoose.connection.close();
  }
}

fixBookCovers();
