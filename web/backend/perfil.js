const handleLogout = () => {
    localStorage.clear(); 
    // Caminho corrigido para o index
    window.location.href = "/web/frontend/accounts/IndexGetGreen/index.html"; 
};

document.addEventListener('DOMContentLoaded', () => {
    const usuarioId = localStorage.getItem('usuarioId');
    const usuarioTipo = localStorage.getItem('usuarioTipo');
    const nomeArmazenado = localStorage.getItem('usuarioNome') || 'Parceiro';

    const loadingMessage = document.getElementById('loading-message');
    const perfilContainer = document.getElementById('perfil-detalhes');
    const campoSegmentoDiv = document.getElementById('campo-segmento');

    document.getElementById('saudacao-menu').textContent = `Olá, ${nomeArmazenado.split(' ')[0]}!`;
    document.getElementById('link-logout').addEventListener('click', (e) => {
        e.preventDefault();
        // Adiciona a confirmação
        if (confirm('Tem certeza que deseja sair da conta?')) { 
             handleLogout();
        }
    });

    if (!usuarioId || !usuarioTipo) {
        loadingMessage.textContent = 'Sessão expirada. Redirecionando para o login...';
        setTimeout(() => window.location.href = "../Login/Login.html", 1500);
        return;
    }

    loadingMessage.textContent = 'Carregando dados...';

    const apiUrl = `http://localhost:4000/api/perfil/${usuarioTipo}/${usuarioId}`;

    fetch(apiUrl)
        .then(response => response.json())
        .then(dadosUsuario => {
            if (dadosUsuario.error) {
                loadingMessage.textContent = `Erro ao carregar perfil: ${dadosUsuario.error}`;
                return;
            }

            loadingMessage.style.display = 'none';
            perfilContainer.style.display = 'block';

            document.getElementById('email-usuario').textContent = dadosUsuario.email;
            document.getElementById('tipo-conta').textContent = 
                dadosUsuario.tipo === 'empresa' ? 'Empresa Parceira' : 'Colaborador Individual';

            const endereco = [
                dadosUsuario.logradouro,
                dadosUsuario.numero ? `N° ${dadosUsuario.numero}` : '',
                dadosUsuario.bairro,
                dadosUsuario.cidade,
                dadosUsuario.uf,
                dadosUsuario.cep ? `(CEP: ${dadosUsuario.cep})` : ''
            ].filter(Boolean).join(', ');

            document.getElementById('endereco-completo').textContent = endereco || 'Endereço não cadastrado.';

            if (dadosUsuario.tipo === 'empresa') {
                document.getElementById('label-nome').textContent = 'Razão Social';
                document.getElementById('nome-usuario').textContent = dadosUsuario.razaoSocial;
                document.getElementById('documento-usuario').textContent = dadosUsuario.cnpj;

                campoSegmentoDiv.style.display = 'block';
                document.getElementById('segmento-empresa').textContent = dadosUsuario.segmento;

            } else {
                document.getElementById('label-nome').textContent = 'Nome Completo';
                document.getElementById('nome-usuario').textContent = dadosUsuario.nome;
                document.getElementById('documento-usuario').textContent = dadosUsuario.cpf;

                campoSegmentoDiv.remove();
            }
        
            const nomeCompleto = dadosUsuario.tipo === 'empresa' ? dadosUsuario.razaoSocial : dadosUsuario.nome;
            localStorage.setItem('usuarioNome', nomeCompleto);
        })
        .catch(error => {
            console.error('Erro de rede:', error);
            loadingMessage.textContent = 'Erro de conexão ao carregar os dados.';
        });
});