const mongoose = require('mongoose');
require('dotenv').config();
const Book = require('../models/Book');

const fictionBooks = [
  {
    titulo: "To Kill a Mockingbird",
    autor: "Harper Lee",
    preco: 29.90,
    categoria: "Ficção",
    descricao: "Um clássico da literatura americana que aborda temas de racismo e injustiça através dos olhos de uma criança.",
    imagemUrl: "/assets/images/to-kill-a-mockingbird.svg",
    isbn: "9780061120084",
    editora: "Harper Perennial",
    anoPublicacao: 1960,
    numeroPaginas: 376,
    estoque: 15,
    disponivel: true,
    destaques: ["Clássico", "Prêmio Pulitzer"],
    promocoes: [],
    tags: ["literatura americana", "clássico", "drama"],
    idioma: "pt",
    vendas: 0
  },
  {
    titulo: "1984",
    autor: "George Orwell",
    preco: 32.90,
    categoria: "Ficção",
    descricao: "Uma distopia que retrata um futuro totalitário onde o governo controla todos os aspectos da vida.",
    imagemUrl: "/assets/images/1984.svg",
    isbn: "9780451524935",
    editora: "Signet Classics",
    anoPublicacao: 1949,
    numeroPaginas: 328,
    estoque: 20,
    disponivel: true,
    destaques: ["Clássico", "Distopia"],
    promocoes: [],
    tags: ["distopia", "política", "clássico"],
    idioma: "pt",
    vendas: 0
  },
  {
    titulo: "Pride and Prejudice",
    autor: "Jane Austen",
    preco: 27.90,
    categoria: "Ficção",
    descricao: "Um romance clássico sobre amor, classe social e primeiras impressões na Inglaterra do século XIX.",
    imagemUrl: "/assets/images/pride-and-prejudice.svg",
    isbn: "9780141439518",
    editora: "Penguin Classics",
    anoPublicacao: 1813,
    numeroPaginas: 432,
    estoque: 18,
    disponivel: true,
    destaques: ["Clássico", "Romance"],
    promocoes: [],
    tags: ["romance", "clássico", "literatura inglesa"],
    idioma: "pt",
    vendas: 0
  },
  {
    titulo: "The Great Gatsby",
    autor: "F. Scott Fitzgerald",
    preco: 31.90,
    categoria: "Ficção",
    descricao: "Uma crítica ao sonho americano ambientada nos anos 1920, considerada uma das maiores obras da literatura americana.",
    imagemUrl: "/assets/images/the-great-gatsby.svg",
    isbn: "9780743273565",
    editora: "Scribner",
    anoPublicacao: 1925,
    numeroPaginas: 180,
    estoque: 12,
    disponivel: true,
    destaques: ["Clássico", "Anos 20"],
    promocoes: [],
    tags: ["literatura americana", "clássico", "anos 20"],
    idioma: "pt",
    vendas: 0
  },
  {
    titulo: "The Catcher in the Rye",
    autor: "J.D. Salinger",
    preco: 28.90,
    categoria: "Ficção",
    descricao: "A história de Holden Caulfield, um adolescente rebelde navegando pela vida adulta em Nova York.",
    imagemUrl: "/assets/images/the-catcher-in-the-rye.svg",
    isbn: "9780316769174",
    editora: "Little, Brown and Company",
    anoPublicacao: 1951,
    numeroPaginas: 277,
    estoque: 14,
    disponivel: true,
    destaques: ["Clássico", "Coming of Age"],
    promocoes: [],
    tags: ["literatura americana", "adolescência", "clássico"],
    idioma: "pt",
    vendas: 0
  },
  {
    titulo: "Lord of the Flies",
    autor: "William Golding",
    preco: 26.90,
    categoria: "Ficção",
    descricao: "Uma alegoria sobre a natureza humana através da história de meninos náufragos em uma ilha deserta.",
    imagemUrl: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop",
    isbn: "9780571056866",
    editora: "Faber & Faber",
    anoPublicacao: 1954,
    numeroPaginas: 224,
    estoque: 16,
    disponivel: true,
    destaques: ["Clássico", "Prêmio Nobel"],
    promocoes: [],
    tags: ["alegoria", "natureza humana", "clássico"],
    idioma: "pt",
    vendas: 0
  },
  {
    titulo: "Animal Farm",
    autor: "George Orwell",
    preco: 24.90,
    categoria: "Ficção",
    descricao: "Uma fábula política que critica o totalitarismo através da história de animais em uma fazenda.",
    imagemUrl: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop",
    isbn: "9780451526342",
    editora: "Signet Classics",
    anoPublicacao: 1945,
    numeroPaginas: 112,
    estoque: 22,
    disponivel: true,
    destaques: ["Clássico", "Fábula Política"],
    promocoes: [],
    tags: ["política", "fábula", "clássico"],
    idioma: "pt",
    vendas: 0
  },
  {
    titulo: "Brave New World",
    autor: "Aldous Huxley",
    preco: 33.90,
    categoria: "Ficção",
    descricao: "Uma distopia que explora temas de tecnologia, controle social e liberdade individual.",
    imagemUrl: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop",
    isbn: "9780060850524",
    editora: "Harper Perennial",
    anoPublicacao: 1932,
    numeroPaginas: 268,
    estoque: 13,
    disponivel: true,
    destaques: ["Clássico", "Ficção Científica"],
    promocoes: [],
    tags: ["distopia", "ficção científica", "clássico"],
    idioma: "pt",
    vendas: 0
  },
  {
    titulo: "The Lord of the Rings",
    autor: "J.R.R. Tolkien",
    preco: 89.90,
    categoria: "Fantasia",
    descricao: "A épica jornada de Frodo Baggins para destruir o Um Anel e salvar a Terra-média.",
    imagemUrl: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop",
    isbn: "9780544003415",
    editora: "Houghton Mifflin Harcourt",
    anoPublicacao: 1954,
    numeroPaginas: 1216,
    estoque: 8,
    disponivel: true,
    destaques: ["Épico", "Fantasia"],
    promocoes: [],
    tags: ["fantasia", "épico", "aventura"],
    idioma: "pt",
    vendas: 0
  },
  {
    titulo: "Harry Potter and the Philosopher's Stone",
    autor: "J.K. Rowling",
    preco: 34.90,
    categoria: "Fantasia",
    descricao: "O primeiro livro da série que apresenta Harry Potter e o mundo mágico de Hogwarts.",
    imagemUrl: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop",
    isbn: "9780747532699",
    editora: "Bloomsbury",
    anoPublicacao: 1997,
    numeroPaginas: 223,
    estoque: 25,
    disponivel: true,
    destaques: ["Bestseller", "Magia"],
    promocoes: [],
    tags: ["fantasia", "magia", "jovem adulto"],
    idioma: "pt",
    vendas: 0
  },
  {
    titulo: "The Chronicles of Narnia",
    autor: "C.S. Lewis",
    preco: 67.90,
    categoria: "Fantasia",
    descricao: "A série completa das aventuras no mundo mágico de Nárnia.",
    imagemUrl: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop",
    isbn: "9780066238500",
    editora: "HarperCollins",
    anoPublicacao: 1950,
    numeroPaginas: 767,
    estoque: 10,
    disponivel: true,
    destaques: ["Série Completa", "Fantasia"],
    promocoes: [],
    tags: ["fantasia", "aventura", "infantil"],
    idioma: "pt",
    vendas: 0
  },
  {
    titulo: "Fahrenheit 451",
    autor: "Ray Bradbury",
    preco: 29.90,
    categoria: "Ficção",
    descricao: "Uma distopia sobre uma sociedade que queima livros e proíbe o conhecimento.",
    imagemUrl: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop",
    isbn: "9781451673319",
    editora: "Simon & Schuster",
    anoPublicacao: 1953,
    numeroPaginas: 194,
    estoque: 17,
    disponivel: true,
    destaques: ["Clássico", "Distopia"],
    promocoes: [],
    tags: ["distopia", "ficção científica", "censura"],
    idioma: "pt",
    vendas: 0
  },
  {
    titulo: "The Hobbit",
    autor: "J.R.R. Tolkien",
    preco: 32.90,
    categoria: "Fantasia",
    descricao: "A aventura de Bilbo Baggins com treze anões para recuperar o tesouro guardado pelo dragão Smaug.",
    imagemUrl: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop",
    isbn: "9780547928227",
    editora: "Houghton Mifflin Harcourt",
    anoPublicacao: 1937,
    numeroPaginas: 366,
    estoque: 19,
    disponivel: true,
    destaques: ["Clássico", "Aventura"],
    promocoes: [],
    tags: ["fantasia", "aventura", "dragões"],
    idioma: "pt",
    vendas: 0
  },
  {
    titulo: "Jane Eyre",
    autor: "Charlotte Brontë",
    preco: 28.90,
    categoria: "Ficção",
    descricao: "A história de uma órfã que se torna governanta e encontra amor e independência.",
    imagemUrl: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop",
    isbn: "9780141441146",
    editora: "Penguin Classics",
    anoPublicacao: 1847,
    numeroPaginas: 624,
    estoque: 14,
    disponivel: true,
    destaques: ["Clássico", "Romance Gótico"],
    promocoes: [],
    tags: ["romance", "gótico", "literatura inglesa"],
    idioma: "pt",
    vendas: 0
  },
  {
    titulo: "Wuthering Heights",
    autor: "Emily Brontë",
    preco: 27.90,
    categoria: "Ficção",
    descricao: "Uma história de paixão obsessiva e vingança nas charnecas inglesas.",
    imagemUrl: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop",
    isbn: "9780141439556",
    editora: "Penguin Classics",
    anoPublicacao: 1847,
    numeroPaginas: 416,
    estoque: 11,
    disponivel: true,
    destaques: ["Clássico", "Romance Gótico"],
    promocoes: [],
    tags: ["romance", "gótico", "paixão"],
    idioma: "pt",
    vendas: 0
  },
  {
    titulo: "The Picture of Dorian Gray",
    autor: "Oscar Wilde",
    preco: 30.90,
    categoria: "Ficção",
    descricao: "A história de um jovem cuja beleza é preservada em um retrato enquanto sua alma se corrompe.",
    imagemUrl: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop",
    isbn: "9780141439570",
    editora: "Penguin Classics",
    anoPublicacao: 1890,
    numeroPaginas: 272,
    estoque: 13,
    disponivel: true,
    destaques: ["Clássico", "Estética"],
    promocoes: [],
    tags: ["estética", "moralidade", "clássico"],
    idioma: "pt",
    vendas: 0
  },
  {
    titulo: "Dracula",
    autor: "Bram Stoker",
    preco: 31.90,
    categoria: "Mistério",
    descricao: "O clássico romance de vampiros que definiu o gênero de terror gótico.",
    imagemUrl: "/assets/images/dracula.svg",
    isbn: "9780141439846",
    editora: "Penguin Classics",
    anoPublicacao: 1897,
    numeroPaginas: 488,
    estoque: 15,
    disponivel: true,
    destaques: ["Clássico", "Terror"],
    promocoes: [],
    tags: ["terror", "vampiros", "gótico"],
    idioma: "pt",
    vendas: 0
  },
  {
    titulo: "Frankenstein",
    autor: "Mary Shelley",
    preco: 29.90,
    categoria: "Ficção",
    descricao: "A história do cientista Victor Frankenstein e sua criatura, considerada o primeiro romance de ficção científica.",
    imagemUrl: "/assets/images/frankenstein.svg",
    isbn: "9780141439471",
    editora: "Penguin Classics",
    anoPublicacao: 1818,
    numeroPaginas: 280,
    estoque: 16,
    disponivel: true,
    destaques: ["Clássico", "Ficção Científica"],
    promocoes: [],
    tags: ["ficção científica", "terror", "criação"],
    idioma: "pt",
    vendas: 0
  },
  {
    titulo: "The Strange Case of Dr. Jekyll and Mr. Hyde",
    autor: "Robert Louis Stevenson",
    preco: 25.90,
    categoria: "Mistério",
    descricao: "A história da dualidade humana através do médico Jekyll e sua personalidade sombria, Hyde.",
    imagemUrl: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop",
    isbn: "9780141439730",
    editora: "Penguin Classics",
    anoPublicacao: 1886,
    numeroPaginas: 144,
    estoque: 18,
    disponivel: true,
    destaques: ["Clássico", "Psicológico"],
    promocoes: [],
    tags: ["psicológico", "dualidade", "terror"],
    idioma: "pt",
    vendas: 0
  },
  {
    titulo: "Alice's Adventures in Wonderland",
    autor: "Lewis Carroll",
    preco: 26.90,
    categoria: "Infantil",
    descricao: "As aventuras fantásticas de Alice em um mundo mágico e nonsense.",
    imagemUrl: "/assets/images/alice-in-wonderland.svg",
    isbn: "9780141439761",
    editora: "Penguin Classics",
    anoPublicacao: 1865,
    numeroPaginas: 192,
    estoque: 20,
    disponivel: true,
    destaques: ["Clássico", "Infantil"],
    promocoes: [],
    tags: ["infantil", "fantasia", "nonsense"],
    idioma: "pt",
    vendas: 0
  }
];

const addFictionBooks = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/livraria-sakura');
    console.log('✅ Conectado ao MongoDB');

    console.log(`📚 Adicionando ${fictionBooks.length} livros de ficção clássica...`);

    let addedCount = 0;
    let skippedCount = 0;

    for (const bookData of fictionBooks) {
      const existingBook = await Book.findOne({ titulo: bookData.titulo });

      if (existingBook) {
        console.log(`⏭️  Pulando (já existe): "${bookData.titulo}"`);
        skippedCount++;
      } else {
        const newBook = new Book(bookData);
        await newBook.save();
        console.log(`✅ Adicionado: "${bookData.titulo}" - ${bookData.autor}`);
        addedCount++;
      }
    }

    console.log(`\n📊 Resumo:`);
    console.log(`✅ Livros adicionados: ${addedCount}`);
    console.log(`⏭️  Livros já existentes: ${skippedCount}`);
    console.log(`📚 Total processado: ${fictionBooks.length}`);

    const totalBooks = await Book.countDocuments();
    console.log(`📖 Total de livros no banco agora: ${totalBooks}`);

  } catch (error) {
    console.error('❌ Erro ao adicionar livros:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Conexão encerrada');
    process.exit(0);
  }
};

addFictionBooks();