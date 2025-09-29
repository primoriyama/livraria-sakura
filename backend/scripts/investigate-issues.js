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
  categoria: String,
});

const Book = mongoose.model('Book', bookSchema);

async function investigateIssues() {
  try {
    console.log('=== INVESTIGANDO PROBLEMAS ===\n');

    console.log('1. VERIFICANDO ALICE E DRACULA:');
    const alice = await Book.findOne({ titulo: { $regex: 'Alice', $options: 'i' } });
    const dracula = await Book.findOne({ titulo: { $regex: 'Dracula', $options: 'i' } });

    if (alice) {
      console.log(`Alice: "${alice.titulo}"`);
      console.log(`Imagem: ${alice.imagemUrl}\n`);
    }

    if (dracula) {
      console.log(`Dracula: "${dracula.titulo}"`);
      console.log(`Imagem: ${dracula.imagemUrl}\n`);
    }

    console.log('2. LIVROS COM TÍTULOS LONGOS (>50 caracteres):');
    const longTitles = await Book.find({
      $expr: { $gt: [{ $strLenCP: "$titulo" }, 50] }
    }).sort({ titulo: 1 });

    longTitles.forEach(book => {
      console.log(`- "${book.titulo}" (${book.titulo.length} chars) - Categoria: ${book.categoria}`);
    });

    console.log('\n3. CATEGORIAS DISPONÍVEIS:');
    const categories = await Book.distinct('categoria');
    categories.sort().forEach(cat => {
      console.log(`- ${cat}`);
    });

    console.log('\n4. CONTAGEM POR CATEGORIA:');
    for (const category of categories.sort()) {
      const count = await Book.countDocuments({ categoria: category });
      console.log(`- ${category}: ${count} livros`);
    }

    console.log('\n5. LIVROS DE AUTO-AJUDA OU CATEGORIAS SIMILARES:');
    const selfHelpBooks = await Book.find({
      $or: [
        { categoria: { $regex: 'auto.?ajuda', $options: 'i' } },
        { categoria: { $regex: 'self.?help', $options: 'i' } },
        { categoria: { $regex: 'desenvolvimento', $options: 'i' } },
        { categoria: { $regex: 'motivação', $options: 'i' } },
        { titulo: { $regex: 'auto.?ajuda', $options: 'i' } }
      ]
    });

    if (selfHelpBooks.length > 0) {
      selfHelpBooks.forEach(book => {
        console.log(`- "${book.titulo}" - ${book.categoria}`);
      });
    } else {
      console.log('Nenhum livro de auto-ajuda encontrado.');
    }

    console.log('\n=== INVESTIGAÇÃO CONCLUÍDA ===');

  } catch (error) {
    console.error('Erro:', error);
  } finally {
    mongoose.connection.close();
  }
}

investigateIssues();
