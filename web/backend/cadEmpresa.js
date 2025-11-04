const mostrarModalSucesso = (mensagem) => {
    const modal = document.getElementById('modal-sucesso');
    const modalMensagem = document.getElementById('modal-mensagem');
    
    if (modal && modalMensagem) {
        modalMensagem.textContent = mensagem;
        modal.style.display = 'flex'; 

        setTimeout(() => {
            modal.style.display = 'none';
        }, 2000);
    }
};

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
  const cnpjInput = form.cnpj;
  const cepInput = form.cep;

  const validarEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validarCep = (cep) => {
    const cepLimpo = cep.replace(/\D/g, ''); 
    return cepLimpo.length === 8;
  };

  const validarCnpj = (cnpj) => {
    const cnpjLimpo = cnpj.replace(/\D/g, '');
    if (cnpjLimpo.length !== 14 || /^(\d)\1{13}$/.test(cnpjLimpo)) {
      return false;
    }
    return true;
  };

  const limparFeedbacks = () => {
    erroSpanConfirmar.textContent = '';
    erroSpanConfirmar.classList.remove('visivel');
    erroSpanGeral.textContent = '';
    erroSpanGeral.classList.remove('visivel');
    confirmarInput.classList.remove('input-erro');
    senhaInput.classList.remove('input-erro');
    emailInput.classList.remove('input-erro');
    cnpjInput.classList.remove('input-erro');
    cepInput.classList.remove('input-erro');
  };

  const exibirErroGeral = (mensagem) => {
    erroSpanGeral.textContent = mensagem;
    erroSpanGeral.classList.add('visivel');
  };
  
  limparFeedbacks(); 

  const cnpj = form.cnpj.value;
  const email = form.email.value;
  const cep = form.cep.value;

  if (!validarCnpj(cnpj)) {
    exibirErroGeral('CNPJ inválido. Deve conter 14 dígitos.');
    cnpjInput.classList.add('input-erro');
    cnpjInput.focus();
    return;
  }

  if (!validarEmail(email)) {
    exibirErroGeral('E-mail inválido. Certifique-se de incluir um "@" e um domínio.');
    emailInput.classList.add('input-erro');
    emailInput.focus();
    return;
  }

  if (!validarCep(cep)) {
    exibirErroGeral('CEP inválido. Deve conter 8 dígitos.');
    cepInput.classList.add('input-erro');
    cepInput.focus();
    return;
  }

  if (senha !== confirmarSenha) {
    erroSpanConfirmar.textContent = 'As senhas não coincidem. Por favor, verifique.';
    erroSpanConfirmar.classList.add('visivel');
    confirmarInput.classList.add('input-erro');
    confirmarInput.focus();
    return;
  }

  const dados = {
    cnpj: cnpj,
    razaoSocial: form.razaoSocial.value,
    segmento: form.segmento.value,
    email: email,
    senha: senha,
    confirmarSenha: confirmarSenha,
    uf: form.uf.value,
    cidade: form.cidade.value,
    cep: cep,
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
      mostrarModalSucesso('Empresa cadastrada com sucesso!'); 

      const nome = resultado.usuario.razaoSocial;

      sessionStorage.setItem('usuarioNome', nome);
      sessionStorage.setItem('usuarioTipo', resultado.tipo);
      sessionStorage.setItem('usuarioId', resultado.usuarioId); 

       setTimeout(() => {
          window.location.href = "../PrincipalGetGreen/principalEmpresas.html"; 
      }, 2000); 

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
    exibirErroGeral('Erro de conexão com o servidor. Tente novamente mais tarde.');
    console.error('Erro de requisição:', erro);
  }
});

const toggleButtons = document.querySelectorAll('.toggle-senha');

toggleButtons.forEach(button => {
    button.addEventListener('click', function () {
        const targetId = this.getAttribute('data-target'); 
        const input = document.getElementById(targetId);
        const icon = this.querySelector('i');

        if (input && icon) {
            const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
            input.setAttribute('type', type);
            
            if (type === 'text') {
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            } else {
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            }
        }
    });
});