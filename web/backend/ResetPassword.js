document.addEventListener('DOMContentLoaded', function() {

    const form = document.getElementById('reset-password-form');
    const newPasswordInput = document.getElementById('newPassword');
    const confirmNewPasswordInput = document.getElementById('confirmNewPassword');
    const erroSpan = document.getElementById('erro-reset');

    const exibirMensagem = (mensagem, sucesso = false) => {
        erroSpan.textContent = mensagem;
        erroSpan.style.color = sucesso ? 'green' : 'red';

        if (mensagem) {
            erroSpan.classList.add('visivel');
        } else {
            erroSpan.classList.remove('visivel');
        }
    };

    // Toggle de visualização de senha
    const toggleNewPassword = document.getElementById('toggleNewPassword');
    const toggleConfirmNewPassword = document.getElementById('toggleConfirmNewPassword');

    if (toggleNewPassword) {
        toggleNewPassword.addEventListener('click', function() {
            const type = newPasswordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            newPasswordInput.setAttribute('type', type);
            const icon = toggleNewPassword.querySelector('i');
            if (type === 'text') {
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            } else {
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            }
        });
    }

    if (toggleConfirmNewPassword) {
        toggleConfirmNewPassword.addEventListener('click', function() {
            const type = confirmNewPasswordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            confirmNewPasswordInput.setAttribute('type', type);
            const icon = toggleConfirmNewPassword.querySelector('i');
            if (type === 'text') {
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            } else {
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            }
        });
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        exibirMensagem('');

        const newPassword = newPasswordInput.value.trim();
        const confirmPassword = confirmNewPasswordInput.value.trim();
        const MIN_LENGTH = 6;

        if (newPassword.length < MIN_LENGTH) {
            newPasswordInput.classList.add('input-erro');
            confirmNewPasswordInput.classList.remove('input-erro');
            return exibirMensagem(`A senha deve ter no mínimo ${MIN_LENGTH} caracteres.`);
        }
        newPasswordInput.classList.remove('input-erro');

        if (newPassword !== confirmPassword) {
            confirmNewPasswordInput.classList.add('input-erro');
            return exibirMensagem('As senhas não coincidem.');
        }
        confirmNewPasswordInput.classList.remove('input-erro');

        // Obter tipo de usuário (pode vir da URL ou de um campo no formulário)
        let tipo = new URLSearchParams(window.location.search).get('type');
        
        // Se não vier da URL, verificar se há um campo de tipo no formulário
        if (!tipo) {
            const tipoInput = document.getElementById('type');
            tipo = tipoInput ? tipoInput.value : null;
        }

        if (!tipo) {
            return exibirMensagem('Tipo de usuário é obrigatório (empresa ou colaborador).');
        }

        // Obter o token do campo de input
        const tokenInput = document.getElementById('tokenInput');
        const token = tokenInput ? tokenInput.value.trim() : null;

        if (!token) {
            return exibirMensagem('Token é obrigatório.');
        }

        try {
            const res = await fetch('http://localhost:4000/api/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    token,
                    type: tipo,
                    newPassword,
                    confirmPassword
                })
            });

            const data = await res.json();

            if (res.ok) {
                exibirMensagem(data.mensagem, true);

                setTimeout(() => {
                    window.location.href = '../Login/Login.html';
                }, 3000);
            } else {
                exibirMensagem(data.error || 'Erro ao redefinir senha.');
            }
        } catch (erro) {
            exibirMensagem('Erro de conexão com o servidor. Tente novamente.');
            console.error(erro);
        }
    });
});
