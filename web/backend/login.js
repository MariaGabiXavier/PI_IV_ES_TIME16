document.getElementById('login').addEventListener('submit', async function(e) {
  e.preventDefault();

  const email = e.target.email.value;
  const senha = e.target.senha.value;

  try {
    const resposta = await fetch('http://localhost:4000/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, senha })
    });

    const resultado = await resposta.json();

    if (resposta.ok && resultado.usuario) {
      const nome = resultado.usuario.razaoSocial || resultado.usuario.nome;
      
      // Salva os dados no localStorage
      localStorage.setItem('usuarioNome', nome);
      localStorage.setItem('usuarioTipo', resultado.tipo); // Salva o tipo (empresa/colaborador)
      localStorage.setItem('usuarioId', resultado.usuarioId); // Salva o ID do usuário

      // === LÓGICA DE REDIRECIONAMENTO CORRIGIDA AQUI ===
      if (resultado.tipo === 'empresa') {
        // Redireciona para a página da Empresa
        window.location.href = "../PrincipalGetGreen/principalEmpresa.html"; 
      } else if (resultado.tipo === 'colaborador') {
        // Redireciona para a página do Colaborador
        window.location.href = "../PrincipalGetGreen/principalColaborador.html"; 
      } else {
         // Fallback para tipo não reconhecido
         alert('Sucesso no login, mas tipo de usuário desconhecido.');
         window.location.href = "../PrincipalGetGreen/principalColaborador.html"; 
      }
      // =================================================

    } else {
      alert('Erro: ' + (resultado.error || 'Credenciais inválidas.'));
    }
  } catch (erro) {
    console.error('Erro ao conectar com o servidor:', erro);
    alert('Erro de conexão. Verifique se o servidor backend está rodando.');
  }
});