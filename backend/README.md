# Livraria Sakura - Backend API

Backend Node.js/Express para o sistema de livraria online Sakura.

## 🚀 Tecnologias

- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **MongoDB** - Banco de dados NoSQL
- **Mongoose** - ODM para MongoDB
- **JWT** - Autenticação e autorização
- **Bcrypt** - Hash de senhas
- **Multer** - Upload de arquivos
- **Helmet** - Segurança HTTP
- **CORS** - Cross-Origin Resource Sharing

## 📋 Pré-requisitos

- Node.js (versão 16 ou superior)
- MongoDB (local ou MongoDB Atlas)
- npm ou yarn

## 🔧 Instalação

1. **Instalar dependências:**
   ```bash
   cd backend
   npm install
   ```

2. **Configurar variáveis de ambiente:**
   - Copie o arquivo `.env.example` para `.env`
   - Configure as variáveis conforme necessário:
   ```env
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/livraria-sakura
   JWT_SECRET=sua_chave_secreta_jwt
   JWT_REFRESH_SECRET=sua_chave_refresh_jwt
   FRONTEND_URL=http://localhost:4200
   ```

3. **Iniciar MongoDB:**
   - Se usando MongoDB local, certifique-se de que está rodando
   - Se usando MongoDB Atlas, configure a string de conexão no `.env`

## 🎯 Scripts Disponíveis

```bash
# Desenvolvimento (com auto-reload)
npm run dev

# Produção
npm start

# Popular banco com dados de exemplo
npm run seed

# Limpar banco de dados
npm run seed:clear
```

## 📊 Seed do Banco de Dados

O script de seed popula o banco com:
- **Usuário administrador padrão:**
  - Email: `admin@livraria-sakura.com`
  - Senha: `admin123`
- **5 usuários de exemplo**
- **50 livros** buscados da Google Books API

### Para usar o seed:

1. **Popular banco:**
   ```bash
   npm run seed
   ```

2. **Limpar banco (cuidado!):**
   ```bash
   npm run seed:clear
   ```

## 🛣️ Rotas da API

### Autenticação (`/api/auth`)
- `POST /register` - Registrar usuário
- `POST /login` - Login
- `POST /refresh` - Renovar token
- `GET /profile` - Perfil do usuário
- `PUT /profile` - Atualizar perfil
- `PUT /change-password` - Alterar senha

### Livros (`/api/books`)
- `GET /` - Listar livros (com filtros)
- `GET /:id` - Obter livro específico
- `POST /` - Criar livro (admin)
- `PUT /:id` - Atualizar livro (admin)
- `DELETE /:id` - Deletar livro (admin)
- `POST /:id/upload-image` - Upload de imagem (admin)
- `POST /:id/reviews` - Adicionar avaliação
- `DELETE /:id/reviews/:reviewId` - Remover avaliação

### Usuários (`/api/users`)
- `GET /` - Listar usuários (admin)
- `GET /stats` - Estatísticas (admin)
- `PUT /:id/toggle-status` - Ativar/desativar usuário (admin)
- `PUT /:id/toggle-role` - Alterar role (admin)
- `PUT /:id/unlock` - Desbloquear conta (admin)

## 🔒 Autenticação

A API usa JWT (JSON Web Tokens) para autenticação:

1. **Login** retorna `accessToken` e `refreshToken`
2. **AccessToken** expira em 1 hora
3. **RefreshToken** expira em 7 dias
4. Use o header: `Authorization: Bearer <token>`

## 👥 Roles de Usuário

- **user** - Usuário comum (comprar livros, avaliar)
- **admin** - Administrador (gerenciar livros e usuários)

## 📁 Estrutura de Pastas

```
backend/
├── middleware/          # Middlewares (auth, validation)
├── models/             # Modelos do MongoDB
├── routes/             # Rotas da API
├── scripts/            # Scripts utilitários (seed)
├── uploads/            # Arquivos enviados
├── .env                # Variáveis de ambiente
├── .env.example        # Exemplo de configuração
├── server.js           # Arquivo principal
└── package.json        # Dependências e scripts
```

## 🛡️ Segurança

- **Helmet** - Headers de segurança HTTP
- **Rate Limiting** - Limite de requisições
- **CORS** - Configurado para frontend
- **Bcrypt** - Hash de senhas
- **JWT** - Tokens seguros
- **Validação** - Entrada de dados validada

## 📝 Logs

O servidor registra:
- Requisições HTTP
- Erros de aplicação
- Conexões de banco
- Operações de autenticação

## 🚀 Deploy

Para produção:

1. Configure variáveis de ambiente
2. Use `NODE_ENV=production`
3. Configure MongoDB Atlas ou servidor dedicado
4. Use PM2 ou similar para gerenciamento de processo

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT.