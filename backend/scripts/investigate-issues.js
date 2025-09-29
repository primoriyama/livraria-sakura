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
});

const Book = mongoose.model('Book', bookSchema);

async function investigateIssues() {
  try {
    console.log('=== INVESTIGANDO PROBLEMAS ===\n');
    
    // 1. Verificar Alice e Dracula especificamente
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
    
    // 2. Verificar livros com títulos muito longos
    console.log('2. LIVROS COM TÍTULOS LONGOS (>50 caracteres):');
    const longTitles = await Book.find({ 
      $expr: { $gt: [{ $strLenCP: "$titulo" }, 50] } 
    }).sort({ titulo: 1 });
    
    longTitles.forEach(book => {
      console.log(`- "${book.titulo}" (${book.titulo.length} chars) - Categoria: ${book.categoria}`);
    });
    
    // 3. Verificar categorias disponíveis
    console.log('\n3. CATEGORIAS DISPONÍVEIS:');
    const categories = await Book.distinct('categoria');
    categories.sort().forEach(cat => {
      console.log(`- ${cat}`);
    });
    
    // 4. Contar livros por categoria
    console.log('\n4. CONTAGEM POR CATEGORIA:');
    for (const category of categories.sort()) {
      const count = await Book.countDocuments({ categoria: category });
      console.log(`- ${category}: ${count} livros`);
    }
    
    // 5. Verificar se existem livros de auto-ajuda ou categorias similares
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