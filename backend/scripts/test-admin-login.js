const axios = require('axios');

const testAdminLogin = async () => {
  try {
    console.log('🔐 Testando login admin...');
    
    const response = await axios.post('http://localhost:3000/api/auth/login', {
      email: 'admin@livraria-sakura.com',
      password: 'admin123'
    });

    console.log('✅ Login bem-sucedido!');
    console.log('👤 Usuário:', response.data.user.name);
    console.log('📧 Email:', response.data.user.email);
    console.log('👑 Role:', response.data.user.role);
    console.log('🔑 Token recebido:', response.data.token ? 'Sim' : 'Não');
    
    // Testar acesso a rota admin
    console.log('\n🔒 Testando acesso a rota admin...');
    const adminResponse = await axios.get('http://localhost:3000/api/users', {
      headers: {
        'Authorization': `Bearer ${response.data.token}`
      }
    });
    
    console.log('✅ Acesso admin autorizado!');
    console.log('👥 Usuários encontrados:', adminResponse.data.length);

  } catch (error) {
    console.error('❌ Erro no teste:', error.response?.data || error.message);
    if (error.response?.status === 401) {
      console.log('🚨 Erro 401: Credenciais inválidas ou problema de autenticação');
    }
  }
};

testAdminLogin();