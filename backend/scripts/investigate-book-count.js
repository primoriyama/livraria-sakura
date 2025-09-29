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
  categoria: String,
  disponivel: { type: Boolean, default: true },
  ativo: { type: Boolean, default: true },
});

const Book = mongoose.model('Book', bookSchema);

async function investigateBookCount() {
  try {
    console.log('=== INVESTIGAÇÃO DA CONTAGEM DE LIVROS ===\n');
    
    // 1. Contagem total no banco
    const totalBooks = await Book.countDocuments();
    console.log(`1. TOTAL NO BANCO DE DADOS: ${totalBooks} livros\n`);
    
    // 2. Contagem por categoria
    console.log('2. CONTAGEM POR CATEGORIA:');
    const categories = await Book.distinct('categoria');
    for (const category of categories.sort()) {
      const count = await Book.countDocuments({ categoria: category });
      console.log(`   ${category}: ${count} livros`);
    }
    
    // 3. Verificar livros com campos especiais
    console.log('\n3. VERIFICAÇÕES ESPECIAIS:');
    
    const booksWithDisponivel = await Book.countDocuments({ disponivel: { $exists: true } });
    const booksAvailable = await Book.countDocuments({ disponivel: true });
    const booksUnavailable = await Book.countDocuments({ disponivel: false });
    
    console.log(`   Livros com campo 'disponivel': ${booksWithDisponivel}`);
    console.log(`   Livros disponíveis (true): ${booksAvailable}`);
    console.log(`   Livros indisponíveis (false): ${booksUnavailable}`);
    
    const booksWithAtivo = await Book.countDocuments({ ativo: { $exists: true } });
    const booksActive = await Book.countDocuments({ ativo: true });
    const booksInactive = await Book.countDocuments({ ativo: false });
    
    console.log(`   Livros com campo 'ativo': ${booksWithAtivo}`);
    console.log(`   Livros ativos (true): ${booksActive}`);
    console.log(`   Livros inativos (false): ${booksInactive}`);
    
    // 4. Verificar livros que podem estar sendo filtrados
    console.log('\n4. POSSÍVEIS FILTROS NO FRONTEND:');
    const visibleBooks = await Book.countDocuments({ 
      $and: [
        { $or: [{ disponivel: { $ne: false } }, { disponivel: { $exists: false } }] },
        { $or: [{ ativo: { $ne: false } }, { ativo: { $exists: false } }] }
      ]
    });
    console.log(`   Livros potencialmente visíveis: ${visibleBooks}`);
    
    // 5. Listar alguns livros que podem estar ocultos
    console.log('\n5. LIVROS POTENCIALMENTE OCULTOS:');
    const hiddenBooks = await Book.find({ 
      $or: [
        { disponivel: false },
        { ativo: false }
      ]
    }).limit(10);
    
    if (hiddenBooks.length > 0) {
      hiddenBooks.forEach(book => {
        console.log(`   - "${book.titulo}" (disponivel: ${book.disponivel}, ativo: ${book.ativo})`);
      });
    } else {
      console.log('   Nenhum livro explicitamente oculto encontrado.');
    }
    
    // 6. Verificar livros sem imagem
    console.log('\n6. LIVROS SEM IMAGEM:');
    const booksWithoutImage = await Book.countDocuments({ 
      $or: [
        { imagemUrl: { $exists: false } },
        { imagemUrl: null },
        { imagemUrl: "" }
      ]
    });
    console.log(`   Livros sem imagem: ${booksWithoutImage}`);
    
    console.log('\n=== INVESTIGAÇÃO CONCLUÍDA ===');
    
  } catch (error) {
    console.error('Erro:', error);
  } finally {
    mongoose.connection.close();
  }
}

investigateBookCount();