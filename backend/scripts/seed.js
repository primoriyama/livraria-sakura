const mongoose = require('mongoose');
const axios = require('axios');
require('dotenv').config();

const Book = require('../models/Book');
const User = require('../models/User');

// Conectar ao MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/livraria-sakura');
    console.log('✅ Conectado ao MongoDB');
  } catch (error) {
    console.error('❌ Erro ao conectar ao MongoDB:', error);
    process.exit(1);
  }
};

// Categorias e termos de busca correspondentes com livros mais modernos e populares
const categoriesAndTerms = [
  { categoria: 'Ficção', terms: ['bestseller fiction 2023', 'popular novels 2024', 'contemporary fiction', 'literary fiction award'] },
  { categoria: 'Romance', terms: ['romance bestseller', 'contemporary romance', 'romantic comedy', 'love story 2023'] },
  { categoria: 'Mistério', terms: ['thriller bestseller', 'mystery novel 2023', 'crime fiction', 'detective story'] },
  { categoria: 'Fantasia', terms: ['fantasy bestseller', 'epic fantasy', 'urban fantasy', 'magical realism'] },
  { categoria: 'Biografia', terms: ['celebrity biography', 'memoir bestseller', 'autobiography 2023', 'inspiring biography'] },
  { categoria: 'História', terms: ['historical fiction', 'world history', 'biography historical', 'history bestseller'] },
  { categoria: 'Ciência', terms: ['popular science', 'science bestseller', 'physics for everyone', 'biology explained'] },
  { categoria: 'Tecnologia', terms: ['programming guide', 'tech innovation', 'artificial intelligence', 'computer science'] },
  { categoria: 'Autoajuda', terms: ['self improvement', 'productivity book', 'mindfulness guide', 'success habits'] },
  { categoria: 'Negócios', terms: ['business strategy', 'entrepreneurship guide', 'leadership book', 'startup success'] },
  { categoria: 'Infantil', terms: ['children bestseller', 'picture book award', 'kids adventure', 'educational children'] },
  { categoria: 'Jovem Adulto', terms: ['ya bestseller', 'teen fiction', 'young adult romance', 'ya fantasy'] }
];

// Função para gerar ISBN válido
const generateISBN = () => {
  const prefix = '978';
  const group = Math.floor(Math.random() * 10);
  const publisher = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
  const title = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  
  // Calcular dígito verificador
  const digits = (prefix + group + publisher + title).split('').map(Number);
  let sum = 0;
  for (let i = 0; i < digits.length; i++) {
    sum += digits[i] * (i % 2 === 0 ? 1 : 3);
  }
  const checkDigit = (10 - (sum % 10)) % 10;
  
  return prefix + group + publisher + title + checkDigit;
};

// Função para buscar livros na Google Books API
const fetchBooksFromGoogle = async (query, maxResults = 15) => {
  try {
    const apiKey = process.env.GOOGLE_BOOKS_API_KEY;
    const url = `https://www.googleapis.com/books/v1/volumes`;
    
    const params = {
      q: query,
      maxResults,
      printType: 'books',
      orderBy: 'newest', // Priorizar livros mais recentes
      filter: 'ebooks' // Filtrar apenas livros com melhor qualidade de dados
    };

    if (apiKey) {
      params.key = apiKey;
    }

    const response = await axios.get(url, { params });
    return response.data.items || [];
  } catch (error) {
    console.error(`Erro ao buscar livros para "${query}":`, error.message);
    return [];
  }
};

// Função para processar dados do livro da Google Books API
const processGoogleBook = (item, categoria) => {
  const volumeInfo = item.volumeInfo;
  const saleInfo = item.saleInfo;

  // Verificar se tem informações mínimas necessárias
  if (!volumeInfo.title || !volumeInfo.authors || !volumeInfo.description) {
    return null;
  }

  // Gerar preço aleatório se não disponível
  let preco = 29.90;
  if (saleInfo.listPrice && saleInfo.listPrice.amount) {
    preco = saleInfo.listPrice.amount;
  } else {
    preco = Math.floor(Math.random() * 80) + 20; // Entre R$ 20 e R$ 100
  }

  // Processar imagem - priorizar melhor qualidade
  let imagemUrl = 'https://via.placeholder.com/300x400/f0f0f0/666666?text=Sem+Imagem';
  if (volumeInfo.imageLinks) {
    // Priorizar imagens de melhor qualidade
    imagemUrl = volumeInfo.imageLinks.large || 
                volumeInfo.imageLinks.medium || 
                volumeInfo.imageLinks.thumbnail || 
                volumeInfo.imageLinks.smallThumbnail || 
                imagemUrl;
    
    // Usar HTTPS e melhorar resolução
    imagemUrl = imagemUrl.replace('http://', 'https://');
    // Tentar obter imagem em resolução maior
    imagemUrl = imagemUrl.replace('&zoom=1', '&zoom=2');
    imagemUrl = imagemUrl.replace('&edge=curl', '');
  }

  // Processar ISBN
  let isbn = generateISBN();
  if (volumeInfo.industryIdentifiers) {
    const isbn13 = volumeInfo.industryIdentifiers.find(id => id.type === 'ISBN_13');
    const isbn10 = volumeInfo.industryIdentifiers.find(id => id.type === 'ISBN_10');
    if (isbn13) {
      isbn = isbn13.identifier;
    } else if (isbn10) {
      isbn = isbn10.identifier;
    }
  }

  return {
    titulo: volumeInfo.title.substring(0, 200),
    autor: Array.isArray(volumeInfo.authors) ? volumeInfo.authors[0] : volumeInfo.authors || 'Autor Desconhecido',
    preco: parseFloat(preco.toFixed(2)),
    categoria,
    descricao: volumeInfo.description.substring(0, 2000),
    imagemUrl,
    isbn,
    editora: volumeInfo.publisher || 'Editora Desconhecida',
    anoPublicacao: volumeInfo.publishedDate ? 
      parseInt(volumeInfo.publishedDate.split('-')[0]) : 
      new Date().getFullYear(),
    numeroPaginas: volumeInfo.pageCount || Math.floor(Math.random() * 400) + 100,
    estoque: Math.floor(Math.random() * 50) + 5,
    disponivel: true,
    destaque: Math.random() < 0.3, // 30% chance de ser destaque
    promocao: {
      ativo: Math.random() < 0.2, // 20% chance de estar em promoção
      desconto: Math.random() < 0.2 ? Math.floor(Math.random() * 30) + 10 : 0,
      dataInicio: new Date(),
      dataFim: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 dias
    },
    tags: volumeInfo.categories || [],
    idioma: volumeInfo.language === 'pt' ? 'Português' : 'Inglês',
    vendas: Math.floor(Math.random() * 100)
  };
};

// Função para criar usuário administrador padrão
const createDefaultAdmin = async () => {
  try {
    const adminExists = await User.findOne({ role: 'admin' });
    
    if (!adminExists) {
      const admin = new User({
        name: 'Administrador',
        email: 'admin@livraria-sakura.com',
        password: 'admin123',
        role: 'admin',
        isActive: true
      });

      await admin.save();
      console.log('✅ Usuário administrador criado');
      console.log('📧 Email: admin@livraria-sakura.com');
      console.log('🔑 Senha: admin123');
    } else {
      console.log('ℹ️  Usuário administrador já existe');
    }
  } catch (error) {
    console.error('❌ Erro ao criar administrador:', error);
  }
};

// Função para criar usuários de exemplo
const createSampleUsers = async () => {
  try {
    const userCount = await User.countDocuments({ role: 'user' });
    
    if (userCount < 5) {
      const sampleUsers = [
        { name: 'João Silva', email: 'joao@email.com', password: 'senha123' },
        { name: 'Maria Santos', email: 'maria@email.com', password: 'senha123' },
        { name: 'Pedro Oliveira', email: 'pedro@email.com', password: 'senha123' },
        { name: 'Ana Costa', email: 'ana@email.com', password: 'senha123' },
        { name: 'Carlos Ferreira', email: 'carlos@email.com', password: 'senha123' }
      ];

      for (const userData of sampleUsers) {
        const existingUser = await User.findOne({ email: userData.email });
        if (!existingUser) {
          const user = new User(userData);
          await user.save();
          console.log(`✅ Usuário ${userData.name} criado`);
        }
      }
    } else {
      console.log('ℹ️  Usuários de exemplo já existem');
    }
  } catch (error) {
    console.error('❌ Erro ao criar usuários de exemplo:', error);
  }
};

// Função principal de seed
const seedDatabase = async () => {
  try {
    console.log('🌱 Iniciando seed do banco de dados...\n');

    // Conectar ao banco
    await connectDB();

    // Criar usuários
    await createDefaultAdmin();
    await createSampleUsers();

    // Verificar se já existem livros suficientes
    const existingBooksCount = await Book.countDocuments();
    if (existingBooksCount >= 40) {
      console.log(`ℹ️  Já existem ${existingBooksCount} livros no banco. Pulando criação de livros.`);
      return;
    }

    console.log('\n📚 Buscando livros modernos na Google Books API...');

    const allBooks = [];
    const targetBooks = 50; // Buscar mais para ter opções de qualidade
    const booksPerCategory = Math.ceil(targetBooks / categoriesAndTerms.length);

    for (const { categoria, terms } of categoriesAndTerms) {
      console.log(`🔍 Buscando livros para categoria: ${categoria}`);
      
      for (const term of terms) {
        if (allBooks.length >= targetBooks) break;
        
        const googleBooks = await fetchBooksFromGoogle(term, 8);
        
        for (const item of googleBooks) {
          if (allBooks.length >= targetBooks) break;
          
          const bookData = processGoogleBook(item, categoria);
          if (bookData) {
            // Verificar se título já existe (evitar duplicatas por título similar)
            const titleToCheck = bookData.titulo.substring(0, 20).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const existingBook = await Book.findOne({ 
              $or: [
                { isbn: bookData.isbn },
                { titulo: { $regex: new RegExp(titleToCheck, 'i') } }
              ]
            });
            if (!existingBook) {
              allBooks.push(bookData);
            }
          }
        }
        
        // Delay para não sobrecarregar a API
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }

    // Salvar livros no banco
    console.log(`\n💾 Salvando ${allBooks.length} livros no banco de dados...`);
    
    for (let i = 0; i < allBooks.length; i++) {
      try {
        const book = new Book(allBooks[i]);
        await book.save();
        console.log(`✅ Livro ${i + 1}/${allBooks.length}: ${book.titulo}`);
      } catch (error) {
        console.error(`❌ Erro ao salvar livro ${allBooks[i].titulo}:`, error.message);
      }
    }

    console.log('\n🎉 Seed concluído com sucesso!');
    console.log(`📊 Total de livros criados: ${allBooks.length}`);
    
  } catch (error) {
    console.error('❌ Erro durante o seed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Conexão com MongoDB encerrada');
    process.exit(0);
  }
};

// Função para limpar banco (usar com cuidado!)
const clearDatabase = async () => {
  try {
    console.log('🗑️  Limpando banco de dados...');
    await connectDB();
    
    await Book.deleteMany({});
    await User.deleteMany({});
    
    console.log('✅ Banco de dados limpo');
  } catch (error) {
    console.error('❌ Erro ao limpar banco:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

// Verificar argumentos da linha de comando
const args = process.argv.slice(2);

if (args.includes('--clear')) {
  clearDatabase();
} else {
  seedDatabase();
}