const handleLogout = () => {
    sessionStorage.removeItem('usuarioNome');
    sessionStorage.removeItem('usuarioTipo');
    sessionStorage.removeItem('usuarioId'); 
    
    window.location.href = "/web/frontend/accounts/IndexGetGreen/index.html"; 
};

document.addEventListener('DOMContentLoaded', () => {
    const usuarioId = sessionStorage.getItem('usuarioId');
    const usuarioTipo = sessionStorage.getItem('usuarioTipo');
    const nomeArmazenado = sessionStorage.getItem('usuarioNome') || 'Parceiro';

    const loadingMessage = document.getElementById('loading-message');
    const perfilContainer = document.getElementById('perfil-detalhes');
    const perfilPessoalContainer = document.getElementById('perfil-detalhes-pessoais'); 
    const campoSegmentoDiv = document.getElementById('campo-segmento');
    const labelDocumento = document.getElementById('label-documento'); 


    document.getElementById('saudacao-menu').textContent = `Olá, ${nomeArmazenado.split(' ')[0]}!`;
    document.getElementById('link-logout').addEventListener('click', (e) => {
        e.preventDefault();
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
        .then(response => {
             if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(dadosUsuario => {
            
            if (dadosUsuario.error) {
                console.error("Erro da API:", dadosUsuario.error);
                loadingMessage.textContent = 'Erro ao carregar dados: ' + dadosUsuario.error;
                return;
            }
            
            loadingMessage.style.display = 'none'; 
            perfilContainer.style.display = 'grid'; 
            if(perfilPessoalContainer) perfilPessoalContainer.style.display = 'grid'; 
            
            document.getElementById('email-usuario').textContent = dadosUsuario.email;
            
            const endereco = [
                dadosUsuario.logradouro,
                dadosUsuario.numero,
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
                if(labelDocumento) labelDocumento.textContent = 'CNPJ'; 
                
                if(campoSegmentoDiv) campoSegmentoDiv.style.display = 'block';
                document.getElementById('segmento-empresa').textContent = dadosUsuario.segmento;

            } else {
                document.getElementById('label-nome').textContent = 'Nome Completo';
                document.getElementById('nome-usuario').textContent = dadosUsuario.nome;
                document.getElementById('documento-usuario').textContent = dadosUsuario.cpf;
                if(labelDocumento) labelDocumento.textContent = 'CPF'; 

                if (campoSegmentoDiv) {
                    campoSegmentoDiv.style.display = 'none';
                }
            }
        
            const nomeCompleto = dadosUsuario.tipo === 'empresa' ? dadosUsuario.razaoSocial : dadosUsuario.nome;
            sessionStorage.setItem('usuarioNome', nomeCompleto);
        })
        .catch(error => {
            console.error('Erro de rede/API:', error);
            loadingMessage.textContent = 'Erro de conexão ou dados inválidos ao carregar os dados. Verifique o console.';
            loadingMessage.style.display = 'block';
            perfilContainer.style.display = 'none';
            if(perfilPessoalContainer) perfilPessoalContainer.style.display = 'none';
        });
});