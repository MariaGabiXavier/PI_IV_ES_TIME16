document.getElementById('login').addEventListener('submit', async function(e) {
  e.preventDefault();

  const email = e.target.email.value;
  const senha = e.target.senha.value;
  const form = e.target;
  
  const erroSpan = document.getElementById('erro-login');
  const exibirErro = (mensagem) => {
    erroSpan.textContent = mensagem;
    erroSpan.classList.add('visivel');
    form.email.classList.add('input-erro');
    form.senha.classList.add('input-erro');
  };
  
  const limparErro = () => {
    erroSpan.textContent = '';
    erroSpan.classList.remove('visivel');
    form.email.classList.remove('input-erro');
    form.senha.classList.remove('input-erro');
  };
  
  limparErro();

  try {
    const resposta = await fetch('http://localhost:4000/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, senha })
    });

    const resultado = await resposta.json();

    if (resposta.ok && resultado.usuario) {
      const nome = resultado.usuario.razaoSocial || resultado.usuario.nome;
      
      localStorage.setItem('usuarioNome', nome);
      localStorage.setItem('usuarioTipo', resultado.tipo);
      localStorage.setItem('usuarioId', resultado.usuarioId); 

      if (resultado.tipo === 'empresa') {
        window.location.href = "../PrincipalGetGreen/principalEmpresa.html"; 
      } else if (resultado.tipo === 'colaborador') {
        window.location.href = "../PrincipalGetGreen/principalColaborador.html"; 
      } else {
         alert('Sucesso no login, mas tipo de usuário desconhecido.'); 
         window.location.href = "../PrincipalGetGreen/principalColaborador.html"; 
      }

    } else {
      exibirErro('Usuário ou Senha incorretos. Tente novamente.');
    }
  } catch (erro) {
    console.error('Erro ao conectar com o servidor:', erro);
    exibirErro('Erro de conexão. Verifique se o servidor backend está rodando.');
  }
});