document.getElementById('cadastroEmpresa').addEventListener('submit', async function(e) {
  e.preventDefault();

  const form = e.target;
  const senha = form.senha.value;
  const confirmarSenha = form.confirmarSenha.value;

  const erroSpanConfirmar = document.getElementById('erro-confirmar-senha');
  const erroSpanGeral = document.getElementById('erro-cadastro-geral');
  const confirmarInput = form.confirmarSenha;
  const senhaInput = form.senha;
  const emailInput = form.email;

  const limparFeedbacks = () => {
    erroSpanConfirmar.textContent = '';
    erroSpanConfirmar.classList.remove('visivel');
    erroSpanGeral.textContent = '';
    erroSpanGeral.classList.remove('visivel');
    confirmarInput.classList.remove('input-erro');
    senhaInput.classList.remove('input-erro');
    emailInput.classList.remove('input-erro');
  };

  const exibirErroGeral = (mensagem) => {
    erroSpanGeral.textContent = mensagem;
    erroSpanGeral.classList.add('visivel');
  };
  
  limparFeedbacks(); 

  if (senha !== confirmarSenha) {
    erroSpanConfirmar.textContent = 'As senhas não coincidem. Por favor, verifique.';
    erroSpanConfirmar.classList.add('visivel');
    confirmarInput.classList.add('input-erro');
    confirmarInput.focus();
    return; 
  }

  confirmarInput.classList.remove('input-erro');

  const dados = {
    cnpj: form.cnpj.value,
    razaoSocial: form.razaoSocial.value,
    segmento: form.segmento.value,
    email: form.email.value,
    senha: senha,
    confirmarSenha: confirmarSenha,
    uf: form.uf.value,
    cidade: form.cidade.value,
    cep: form.cep.value,
    bairro: form.bairro.value,
    logradouro: form.logradouro.value,
    numero: form.numero.value
  };

  try {
    const resposta = await fetch('http://localhost:4000/api/userEmpresa', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dados)
    });

    const resultado = await resposta.json();
    
    if (resposta.ok) {
      const nome = resultado.usuario.razaoSocial;

      localStorage.setItem('usuarioNome', nome);
      localStorage.setItem('usuarioTipo', resultado.tipo);
      localStorage.setItem('usuarioId', resultado.usuarioId); 

      window.location.href = "../PrincipalGetGreen/principalEmpresa.html"; 

    } else {
      const errorMessage = resultado.error || 'Erro desconhecido ao cadastrar.';
      
      exibirErroGeral(errorMessage);
      
      if (errorMessage.includes('email já está cadastrado')) {
          emailInput.classList.add('input-erro');
          emailInput.focus();
      } else if (errorMessage.includes('senha deve ter no mínimo')) {
          senhaInput.classList.add('input-erro');
          senhaInput.focus();
      }
    }
  } catch (erro) {
    console.error('Erro ao conectar com o servidor:', erro);
    exibirErroGeral('Erro ao conectar com o servidor. Verifique sua conexão.');
  }
});