const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../models/User');

const checkAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/livraria-sakura');
    console.log('✅ Conectado ao MongoDB');

    // Verificar usuários admin
    const adminUsers = await User.find({ role: 'admin' });
    console.log(`👑 Usuários admin encontrados: ${adminUsers.length}`);
    
    if (adminUsers.length > 0) {
      console.log('\n📋 Lista de admins:');
      adminUsers.forEach((admin, index) => {
        console.log(`${index + 1}. ${admin.name} (${admin.email})`);
      });
    } else {
      console.log('❌ Nenhum usuário admin encontrado');
    }

    // Verificar total de usuários
    const totalUsers = await User.countDocuments();
    console.log(`\n👥 Total de usuários: ${totalUsers}`);

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Conexão encerrada');
    process.exit(0);
  }
};

checkAdmin();