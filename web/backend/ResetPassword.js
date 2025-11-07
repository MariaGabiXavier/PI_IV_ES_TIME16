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


        const token = new URLSearchParams(window.location.search).get('token');
        if (!token) return exibirMensagem('Token de redefinição não encontrado.');

        try {
            const res = await fetch(`http://localhost:4000/api/reset-password/${token}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ newPassword })
            });
            const data = await res.json();

            if (res.ok) {
                exibirMensagem(data.message || 'Senha redefinida com sucesso!', true);
                setTimeout(() => {
                    window.location.href = '../Login/Login.html';
                }, 3000);
            } else {
                exibirMensagem(data.error || 'Erro ao redefinir a senha.');
            }
        } catch (err) {
            console.error(err);
            exibirMensagem('Erro de conexão com o servidor.');
        }
    });

    function setupPasswordToggle(toggleId, inputId) {
        const toggle = document.getElementById(toggleId);
        const input = document.getElementById(inputId);
        const icon = toggle?.querySelector('i');

        if (toggle && input && icon) {
            toggle.addEventListener('click', () => {
                const isPassword = input.type === 'password';
                input.type = isPassword ? 'text' : 'password';

                if (input.type === 'text') {
                    icon.classList.remove('fa-eye-slash');
                    icon.classList.add('fa-eye');
                } else {
                    icon.classList.remove('fa-eye');
                    icon.classList.add('fa-eye-slash');
                }
            });
        }
    }

    setupPasswordToggle('toggleNewPassword', 'newPassword');
    setupPasswordToggle('toggleConfirmNewPassword', 'confirmNewPassword');
});