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
      localStorage.setItem('usuarioNome', nome);
      localStorage.setItem('usuarioTipo', resultado.tipo);
      window.location.href = "../PrincipalGetGreen/principal.html";
    } else {
      alert('Erro: ' + resultado.error);
    }
  } catch (erro) {
    console.error('Erro ao conectar com o servidor:', erro);
    alert('Erro de conexão.');
  }
});