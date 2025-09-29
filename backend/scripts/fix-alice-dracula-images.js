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

async function fixAliceDraculaImages() {
  try {
    console.log('Corrigindo imagens de Alice e Dracula...\n');

    const updates = [
      {
        title: "Alice's Adventures in Wonderland",
        newImageUrl: "https://m.media-amazon.com/images/I/81OthjkJBuL._AC_UF1000,1000_QL80_.jpg"
      },
      {
        title: "Dracula",
        newImageUrl: "https://m.media-amazon.com/images/I/71TwNy2M5UL._AC_UF1000,1000_QL80_.jpg"
      }
    ];

    for (const update of updates) {
      const result = await Book.updateOne(
        { titulo: update.title },
        { $set: { imagemUrl: update.newImageUrl } }
      );

      if (result.matchedCount > 0) {
        console.log(`✓ ${update.title} - Nova imagem atualizada`);
        console.log(`  URL: ${update.newImageUrl}`);
      } else {
        console.log(`✗ ${update.title} - Livro não encontrado`);
      }
    }

    console.log('\nImagens corrigidas!');

  } catch (error) {
    console.error('Erro:', error);
  } finally {
    mongoose.connection.close();
  }
}

fixAliceDraculaImages();
