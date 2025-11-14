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
      
      sessionStorage.setItem('usuarioNome', nome);
      sessionStorage.setItem('usuarioTipo', resultado.tipo);
      sessionStorage.setItem('usuarioId', resultado.usuarioId); 

      if (resultado.tipo === 'empresa') {
        window.location.href = "../PrincipalGetGreen/principalEmpresas.html"; 
      } else if (resultado.tipo === 'colaborador') {
        window.location.href = "../PrincipalGetGreen/principalColaborador.html"; 
      } else {
         alert('Sucesso no login, mas tipo de usuário desconhecido.'); 
         window.location.href = "../PrincipalGetGreen/principalColaborador.html"; 
      }

    } else {
      exibirErro(resultado.error || 'Email ou senha inválidos. Por favor, verifique.');
    }

  } catch (erro) {
    exibirErro('Erro de conexão com o servidor. Tente novamente mais tarde.');
    console.error('Erro de requisição:', erro);
  }
});

const toggleSenhaSpan = document.getElementById('toggleSenha');
const senhaInput = document.getElementById('senha');
const toggleIcon = toggleSenhaSpan ? toggleSenhaSpan.querySelector('i') : null; 

if (toggleSenhaSpan && senhaInput && toggleIcon) {
    toggleSenhaSpan.addEventListener('click', function () {
        
        const type = senhaInput.getAttribute('type') === 'password' ? 'text' : 'password';
        senhaInput.setAttribute('type', type);
        
        if (type === 'text') {
            toggleIcon.classList.remove('fa-eye-slash');
            toggleIcon.classList.add('fa-eye');
        } else {
            toggleIcon.classList.remove('fa-eye');
            toggleIcon.classList.add('fa-eye-slash');
        }
    });
}

const forgotModal = document.getElementById('forgotPasswordModal');
const forgotLink = document.querySelector('.forgot');
const closeForgotBtn = document.getElementById('closeForgot');
const forgotForm = document.getElementById('forgot-password-form');
const forgotEmailInput = document.getElementById('forgotEmail');
const erroForgotSpan = document.getElementById('erro-forgot');


if (forgotLink) {
    forgotLink.addEventListener('click', function(e) {
        e.preventDefault();
        forgotModal.style.display = 'block';
        erroForgotSpan.textContent = '';
        erroForgotSpan.classList.remove('visivel');
        forgotEmailInput.classList.remove('input-erro');
    });
}

if (closeForgotBtn) {
    closeForgotBtn.addEventListener('click', function() {
        forgotModal.style.display = 'none';
        erroForgotSpan.textContent = '';
        erroForgotSpan.classList.remove('visivel');
        forgotEmailInput.classList.remove('input-erro');
    });
}

window.addEventListener('click', function(event) {
    if (event.target === forgotModal) {
        forgotModal.style.display = 'none';
        erroForgotSpan.textContent = '';
        erroForgotSpan.classList.remove('visivel');
        forgotEmailInput.classList.remove('input-erro');
    }
});

if (forgotForm) {
    forgotForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const email = forgotEmailInput.value;

        const exibirErro = (mensagem, isSucesso = false) => {
            erroForgotSpan.textContent = mensagem;
            erroForgotSpan.style.color = isSucesso ? 'green' : '#ff0000';
            erroForgotSpan.classList.add('visivel');
            forgotEmailInput.classList.toggle('input-erro', !isSucesso); 
        };
        
        exibirErro('', false); 

        try {
            const resposta = await fetch('http://localhost:4000/api/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            const resultado = await resposta.json();

            if (resposta.ok) {
                exibirErro('E-mail enviado com sucesso! Redirecionando...', true);
                console.log('Resultado da busca de email:', resultado);
                
                // Redirecionar para a página de reset de senha após 2 segundos
                setTimeout(() => {
                    window.location.href = '../ResetPassword/ResetPassword.html';
                }, 2000);
            } else {
                exibirErro(resultado.error || 'Erro ao processar a requisição.');
            }

        } catch (erro) {
            exibirErro('Erro de conexão com o servidor. Tente novamente mais tarde.');
            console.error('Erro de requisição:', erro);
        }
    });
}
