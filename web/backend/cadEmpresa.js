
document.getElementById('cadastroEmpresa').addEventListener('submit', async function(e) {
  e.preventDefault();

  const form = e.target;
  const dados = {
    cnpj: form.cnpj.value,
    razaoSocial: form.razaoSocial.value,
    segmento: form.segmento.value,
    email: form.email.value,
    senha: form.senha.value,
    confirmarSenha: form.confirmarSenha.value,
    uf: form.uf.value,
    cidade: form.cidade.value,
    cep: form.cep.value,
    bairro: form.bairro.value,
    logradouro: form.logradouro.value,
    numero: form.numero.value
  };

  try {
    const resposta = await fetch('http://localhost:4000/api/user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dados)
    });

    const resultado = await resposta.json();
    if (resposta.ok) {
      alert('Cadastro realizado com sucesso!');
      form.reset();
    } else {
      alert('Erro: ' + resultado.error);
    }
  } catch (erro) {
    console.error('Erro ao enviar:', erro);
    alert('Erro ao conectar com o servidor.');
  }
});