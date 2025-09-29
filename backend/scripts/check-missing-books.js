const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/livraria-sakura');

const bookSchema = new mongoose.Schema({}, {strict: false});
const Book = mongoose.model('Book', bookSchema);

const expectedBooks = {
  "To Kill a Mockingbird": "O Sol é Para Todos",
  "1984": "1984",
  "Pride and Prejudice": "Orgulho e Preconceito",
  "The Great Gatsby": "O Grande Gatsby",
  "The Catcher in the Rye": "O Apanhador no Campo de Centeio",
  "Lord of the Flies": "O Senhor das Moscas",
  "Animal Farm": "A Revolução dos Bichos",
  "Brave New World": "Admirável Mundo Novo",
  "The Lord of the Rings": "O Senhor dos Anéis",
  "Harry Potter and the Philosopher's Stone": "Harry Potter e a Pedra Filosofal",
  "The Chronicles of Narnia": "As Crônicas de Nárnia",
  "Fahrenheit 451": "Fahrenheit 451",
  "The Hobbit": "O Hobbit",
  "Jane Eyre": "Jane Eyre",
  "Wuthering Heights": "O Morro dos Ventos Uivantes",
  "The Picture of Dorian Gray": "O Retrato de Dorian Gray",
  "Dracula": "Drácula",
  "Frankenstein": "Frankenstein",
  "The Strange Case of Dr. Jekyll and Mr. Hyde": "O Médico e o Monstro",
  "Alice's Adventures in Wonderland": "Alice no País das Maravilhas"
};

async function checkMissingBooks() {
  try {
    console.log('📚 Verificando livros da lista de 20...\n');

    const foundBooks = [];
    const missingBooks = [];

    for (const [englishTitle, portugueseTitle] of Object.entries(expectedBooks)) {
      let book = await Book.findOne({ titulo: englishTitle });

      if (!book) {
        book = await Book.findOne({ titulo: portugueseTitle });
      }

      if (book) {
        foundBooks.push({
          expected: `${englishTitle} / ${portugueseTitle}`,
          found: book.titulo
        });
      } else {
        missingBooks.push({
          english: englishTitle,
          portuguese: portugueseTitle
        });
      }
    }

    console.log(`✅ LIVROS ENCONTRADOS (${foundBooks.length}/20):`);
    foundBooks.forEach(book => {
      console.log(`  - ${book.found}`);
    });

    console.log(`\n❌ LIVROS FALTANDO (${missingBooks.length}/20):`);
    missingBooks.forEach(book => {
      console.log(`  - ${book.english} / ${book.portuguese}`);
    });

    console.log(`\n📊 RESUMO:`);
    console.log(`  - Encontrados: ${foundBooks.length}`);
    console.log(`  - Faltando: ${missingBooks.length}`);
    console.log(`  - Total esperado: 20`);

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    mongoose.connection.close();
  }
}

checkMissingBooks();
