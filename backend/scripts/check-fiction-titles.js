const mongoose = require('mongoose');
require('dotenv').config();
const Book = require('../models/Book');

const expectedFictionTitles = [
  "To Kill a Mockingbird",
  "1984",
  "Pride and Prejudice",
  "The Great Gatsby",
  "The Catcher in the Rye",
  "Lord of the Flies",
  "Animal Farm",
  "Brave New World",
  "The Lord of the Rings",
  "Harry Potter and the Philosopher's Stone",
  "The Chronicles of Narnia",
  "Fahrenheit 451",
  "The Hobbit",
  "Jane Eyre",
  "Wuthering Heights",
  "The Picture of Dorian Gray",
  "Dracula",
  "Frankenstein",
  "The Strange Case of Dr. Jekyll and Mr. Hyde",
  "Alice's Adventures in Wonderland"
];

const checkFictionTitles = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/livraria-sakura');
    console.log('✅ Conectado ao MongoDB');

    const books = await Book.find({});
    console.log(`📚 Total de livros no banco: ${books.length}`);

    console.log('\n🔍 Verificando títulos de ficção esperados:');
    let foundCount = 0;

    for (const expectedTitle of expectedFictionTitles) {
      const book = books.find(b => b.titulo === expectedTitle);
      if (book) {
        console.log(`✅ Encontrado: "${expectedTitle}"`);
        foundCount++;
      } else {
        console.log(`❌ NÃO encontrado: "${expectedTitle}"`);
      }
    }

    console.log(`\n📊 Resumo:`);
    console.log(`✅ Títulos de ficção encontrados: ${foundCount}/${expectedFictionTitles.length}`);
    console.log(`❌ Títulos de ficção faltando: ${expectedFictionTitles.length - foundCount}/${expectedFictionTitles.length}`);

    console.log('\n📖 Primeiros 10 títulos atuais no banco:');
    books.slice(0, 10).forEach((book, index) => {
      console.log(`${index + 1}. "${book.titulo}" - ${book.autor}`);
    });

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Conexão encerrada');
    process.exit(0);
  }
};

checkFictionTitles();