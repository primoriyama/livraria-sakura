const mongoose = require('mongoose');
require('dotenv').config();
const Book = require('../models/Book');

const titleMapping = {
  "O Sol é Para Todos": "To Kill a Mockingbird",
  "1984": "1984",
  "Orgulho e Preconceito": "Pride and Prejudice",
  "O Grande Gatsby": "The Great Gatsby",
  "O Apanhador no Campo de Centeio": "The Catcher in the Rye",
  "O Senhor das Moscas": "Lord of the Flies",
  "A Revolução dos Bichos": "Animal Farm",
  "Admirável Mundo Novo": "Brave New World",
  "O Senhor dos Anéis": "The Lord of the Rings",
  "Harry Potter e a Pedra Filosofal": "Harry Potter and the Philosopher's Stone",
  "As Crônicas de Nárnia": "The Chronicles of Narnia",
  "Fahrenheit 451": "Fahrenheit 451",
  "O Hobbit": "The Hobbit",
  "Jane Eyre": "Jane Eyre",
  "O Morro dos Ventos Uivantes": "Wuthering Heights",
  "O Retrato de Dorian Gray": "The Picture of Dorian Gray",
  "Drácula": "Dracula",
  "Frankenstein": "Frankenstein",
  "O Médico e o Monstro": "The Strange Case of Dr. Jekyll and Mr. Hyde",
  "Alice no País das Maravilhas": "Alice's Adventures in Wonderland"
};

const updateTitles = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/livraria-sakura');
    console.log('✅ Conectado ao MongoDB');

    const books = await Book.find({});
    console.log(`📚 Encontrados ${books.length} livros no banco`);

    let updatedCount = 0;
    let notFoundCount = 0;

    for (const book of books) {
      const currentTitle = book.titulo;

      // Verificar se o título atual precisa ser convertido
      if (titleMapping[currentTitle]) {
        const newTitle = titleMapping[currentTitle];

        console.log(`🔄 Atualizando: "${currentTitle}" → "${newTitle}"`);

        await Book.findByIdAndUpdate(book._id, { titulo: newTitle });
        updatedCount++;
      } else {
        // Se não está no mapeamento, manter o título atual (já está em inglês)
        console.log(`ℹ️  Mantendo título: "${currentTitle}"`);
        notFoundCount++;
      }
    }

    console.log(`\n📊 Resumo da atualização:`);
    console.log(`✅ Títulos atualizados: ${updatedCount}`);
    console.log(`ℹ️  Títulos mantidos: ${notFoundCount}`);
    console.log(`📚 Total de livros: ${books.length}`);

    // Verificar alguns livros atualizados
    console.log('\n📖 Verificando alguns livros atualizados:');
    const updatedBooks = await Book.find({}).limit(5);
    updatedBooks.forEach((book, index) => {
      console.log(`${index + 1}. "${book.titulo}" - ${book.autor}`);
    });

  } catch (error) {
    console.error('❌ Erro durante a atualização:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Conexão encerrada');
    process.exit(0);
  }
};

// Verificar argumentos da linha de comando
const args = process.argv.slice(2);

if (args.includes('--help')) {
  console.log(`
📚 Script de Atualização de Títulos

Este script atualiza os títulos dos livros no banco de dados para usar títulos em inglês como chave.

Uso:
  node scripts/update-titles.js        # Executar atualização
  node scripts/update-titles.js --help # Mostrar esta ajuda

O script irá:
1. Conectar ao banco de dados MongoDB
2. Buscar todos os livros
3. Converter títulos em português para inglês usando o mapeamento definido
4. Manter títulos que já estão em inglês
5. Mostrar um resumo das alterações
  `);
  process.exit(0);
}

updateTitles();
