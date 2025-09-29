const mongoose = require('mongoose');
require('dotenv').config();
const Book = require('../models/Book');

const bookImageUpdates = [
  {
    titulo: "To Kill a Mockingbird",
    imagemUrl: "assets/images/to-kill-a-mockingbird.svg"
  },
  {
    titulo: "1984",
    imagemUrl: "assets/images/1984.svg"
  },
  {
    titulo: "Pride and Prejudice",
    imagemUrl: "assets/images/pride-and-prejudice.svg"
  },
  {
    titulo: "The Great Gatsby",
    imagemUrl: "assets/images/the-great-gatsby.svg"
  },
  {
    titulo: "The Catcher in the Rye",
    imagemUrl: "assets/images/the-catcher-in-the-rye.svg"
  },
  {
    titulo: "Dracula",
    imagemUrl: "assets/images/dracula.svg"
  },
  {
    titulo: "Frankenstein",
    imagemUrl: "assets/images/frankenstein.svg"
  },
  {
    titulo: "Alice's Adventures in Wonderland",
    imagemUrl: "assets/images/alice-in-wonderland.svg"
  }
];

const updateBookImages = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/livraria-sakura');
    console.log('✅ Conectado ao MongoDB');

    console.log(`📸 Atualizando imagens de ${bookImageUpdates.length} livros...`);

    let updatedCount = 0;
    let notFoundCount = 0;

    for (const update of bookImageUpdates) {
      try {
        const result = await Book.updateOne(
          { titulo: update.titulo },
          { $set: { imagemUrl: update.imagemUrl } }
        );

        if (result.matchedCount > 0) {
          console.log(`✅ Atualizado: "${update.titulo}"`);
          updatedCount++;
        } else {
          console.log(`❌ Não encontrado: "${update.titulo}"`);
          notFoundCount++;
        }
      } catch (error) {
        console.error(`❌ Erro ao atualizar "${update.titulo}":`, error.message);
      }
    }

    console.log('\n📊 Resumo:');
    console.log(`✅ Livros atualizados: ${updatedCount}`);
    console.log(`❌ Livros não encontrados: ${notFoundCount}`);
    console.log(`📚 Total processado: ${bookImageUpdates.length}`);

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Conexão encerrada');
  }
};

updateBookImages();
