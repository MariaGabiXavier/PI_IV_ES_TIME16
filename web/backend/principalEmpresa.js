const nome = localStorage.getItem('usuarioNome');
const tipo = localStorage.getItem('usuarioTipo');
const id = localStorage.getItem('usuarioId'); 

const profileLink = document.getElementById('profileLink');

if (nome && tipo) {
    document.getElementById('usuarioNome').textContent = nome;
    document.getElementById('boasVindas').textContent = `Bem-vindo(a), ${nome}!`;
    profileLink.href = "#"; 
} else {
    document.getElementById('usuarioNome').textContent = 'Usuário'; 
    document.getElementById('boasVindas').textContent = 'Seja bem-vindo(a)!';
    
    profileLink.href = "/web/frontend/accounts/Login/loginGetGreen.html"; 
}

const openBtn = document.getElementById('openNovaColeta');
const modal = document.getElementById('novaColetaModal');
const closeBtn = document.getElementById('closeNovaColeta');
const form = document.getElementById('formNovaColeta');
const listPendentes = document.getElementById('listPendentes'); 
const listConcluidas = document.getElementById('listConcluidas'); 

function openModal() {
    const nomeLogado = localStorage.getItem('usuarioNome');
    const tipoLogado = localStorage.getItem('usuarioTipo');
    
    if (!nomeLogado || tipoLogado !== 'empresa') {
        alert('Você precisa estar logado como uma empresa para solicitar uma nova coleta.');
        window.location.href = "/web/frontend/accounts/IndexGetGreen/index.html";
        return; 
    }
    
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
}
function closeModal() {
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    form.reset(); 
}
openBtn.addEventListener('click', openModal);
closeBtn.addEventListener('click', closeModal);
modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
});

// Excluir Coleta
async function excluirColeta(coletaId) {
    if (!confirm('Tem certeza que deseja cancelar esta coleta? Esta ação não pode ser desfeita.')) {
        return;
    }

    try {
        const response = await fetch(`http://localhost:4000/api/coletas/${coletaId}`, {
            method: 'DELETE'
        });

        const resultado = await response.json();

        if (response.ok) {
            alert(resultado.mensagem);
            carregarColetasEmpresa(); 
        } else {
            alert(`Erro ao cancelar coleta: ${resultado.error}`);
        }
    } catch (err) {
        console.error('Fetch error:', err);
        alert('Erro de conexão com o servidor ao tentar excluir a coleta.');
    }
}


// Carregar coletas
async function carregarColetasEmpresa() {
    const usuarioId = localStorage.getItem('usuarioId');
    
    if (!usuarioId) {
        listPendentes.innerHTML = '<p>Faça login para visualizar suas coletas.</p>';
        listConcluidas.innerHTML = '';
        return; 
    }
    
    listPendentes.innerHTML = '<p>Carregando coletas...</p>';
    listConcluidas.innerHTML = '<p>Carregando coletas...</p>';

    try {
        const response = await fetch(`http://localhost:4000/api/coletas?usuarioId=${usuarioId}`);
        const coletas = await response.json();
        
        listPendentes.innerHTML = ''; 
        listConcluidas.innerHTML = '';
        
        
        const coletasMapeadas = coletas.map((coleta, index) => {
            const dataCriacao = new Date(coleta.dataCriacao).toLocaleDateString('pt-BR', {
                day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
            });

            let statusText = 'Aguardando atribuição de coleta';
            let coletorNome = '-';
            let actionButton = `<button class="btn-action btn-cancel" data-coleta-id="${coleta._id}"><span class="material-icons-outlined">close</span>cancelar</button>`;
            let isDone = false;

            if (coleta.status === 'concluida') {
                statusText = 'Coleta realizada';
                coletorNome = '-'; 
                actionButton = `<button class="btn-action btn-finish"><span class="material-icons-outlined">check</span>finalizar</button>`;
                isDone = true;
            }
            
            return {
                ...coleta,
                dataCriacaoFormatada: dataCriacao,
                coletorNome: coletorNome,
                statusDetail: statusText,
                actionButton: actionButton,
                isDone: isDone
            };
        });

        const pendentes = coletasMapeadas.filter(c => !c.isDone);
        const concluidas = coletasMapeadas.filter(c => c.isDone);
        
        if (pendentes.length === 0) {
            listPendentes.innerHTML = '<p>Nenhuma coleta pendente no momento.</p>';
        } else {
            pendentes.forEach(coleta => {
                const cardHTML = `
                    <article class="request-card is-pending">
                        <div class="request-main">
                            <div class="request-title">id:${coleta._id}</div>
                            <div class="request-sub">Coletor parceiro: ${coleta.coletorNome}</div>
                            <div class="request-status-details">
                                <span class="status-text">Status: ${coleta.statusDetail}</span>
                            </div>
                        </div>
                        <div class="request-side">
                            <div class="request-date">${coleta.dataCriacaoFormatada}</div>
                            ${coleta.actionButton}
                        </div>
                    </article>
                `;
                listPendentes.innerHTML += cardHTML;
            });
        }

        if (concluidas.length === 0) {
            listConcluidas.innerHTML = '<p>Nenhuma coleta concluída ainda.</p>';
        } else {
                concluidas.forEach(coleta => {
                const cardHTML = `
                    <article class="request-card is-done">
                        <div class="request-main">
                            <div class="request-title">id:${coleta._id}</div>
                            <div class="request-sub">Coletor parceiro: ${coleta.coletorNome}</div>
                            <div class="request-status-details">
                                <span class="status-text">Status: ${coleta.statusDetail}</span>
                            </div>
                        </div>
                        <div class="request-side">
                            <div class="request-date">${coleta.dataCriacaoFormatada}</div>
                            ${coleta.actionButton}
                        </div>
                    </article>
                `;
                listConcluidas.innerHTML += cardHTML;
            });
        }
        
        document.querySelectorAll('.btn-cancel').forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault(); 
                

                const coletaId = e.currentTarget.getAttribute('data-coleta-id');
                
                if (coletaId) {
                    excluirColeta(coletaId);
                }
            });
        });


    } catch (error) {
        console.error('Erro ao buscar coletas:', error);
        listPendentes.innerHTML = '<p>Erro ao carregar as coletas. Verifique a conexão com o servidor.</p>';
        listConcluidas.innerHTML = '';
    }
}

// Enviar formulário
form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nomeLogado = localStorage.getItem('usuarioNome');
    const idLogado = localStorage.getItem('usuarioId');
    const tipoLogado = localStorage.getItem('usuarioTipo'); 

    if (!nomeLogado || !idLogado || tipoLogado !== 'empresa') {
        alert('Erro de autenticação: Você deve estar logado como empresa para solicitar uma coleta.');
        return; 
    }

    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    data.quantidade = parseFloat(data.quantidade);

    data.usuarioId = idLogado; 
    data.usuarioNome = nomeLogado; 

    try {
        const response = await fetch('http://localhost:4000/api/coletas', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        const resultado = await response.json();

        if (response.ok) {
            alert('Coleta solicitada com sucesso!');
            closeModal();
            carregarColetasEmpresa(); 
        } else if (response.status === 401) {
                alert(`Acesso negado: ${resultado.error}`);
        }
        else {
            alert(`Erro ao solicitar coleta: ${resultado.error}`);
        }
    } catch (err) {
        alert('Erro de conexão com o servidor. Verifique se o backend está rodando.');
        console.error('Fetch error:', err);
    }
});

carregarColetasEmpresa();

// Adicionando a função e o event listener de logout aqui
const logoutLink = document.getElementById('logoutLink');

function logout() {
    localStorage.removeItem('usuarioNome');
    localStorage.removeItem('usuarioTipo');
    localStorage.removeItem('usuarioId'); 
    
    window.location.href = "/web/frontend/accounts/IndexGetGreen/index.html"; 
}

logoutLink.addEventListener('click', (e) => {
    e.preventDefault(); 
    if (confirm('Tem certeza que deseja sair da conta?')) { // Adiciona a confirmação
        logout();
    }
});