const nome = sessionStorage.getItem('usuarioNome');
const tipo = sessionStorage.getItem('usuarioTipo');
const id = sessionStorage.getItem('usuarioId'); 

const profileLink = document.getElementById('profileLink');
const boasVindas = document.getElementById('boasVindas'); 
const openBtn = document.getElementById('openNovaColeta');
const modal = document.getElementById('novaColetaModal');
const closeBtn = document.getElementById('closeNovaColeta');
const form = document.getElementById('formNovaColeta');
const listPendentes = document.getElementById('listPendentes'); 
const listConcluidas = document.getElementById('listConcluidas'); 
const listFinalizadas = document.getElementById('listFinalizadas'); 
const logoutLink = document.getElementById('logoutLink');

const btnChatbot = document.getElementById('openChatbot');
const overlayChatbot = document.getElementById('modalOverlay');
const closeChatbot = document.getElementById('closeModal');
const chatArea = document.getElementById('chatArea');
const opts = document.getElementById('optionsContainer');
const manualInput = document.getElementById('manualInput');
const sendManual = document.getElementById('sendManual');



if (nome && tipo) {
    document.getElementById('usuarioNome').textContent = nome;
    boasVindas.textContent = `Bem-vindo(a), ${nome}!`;
    profileLink.href = "../Perfil/Perfil.html";
} else {
    document.getElementById('usuarioNome').textContent = 'Usuário'; 
    boasVindas.textContent = 'Seja bem-vindo(a)!';
    profileLink.href = "/web/frontend/accounts/Login/loginGetGreen.html"; 
}

function logout() {
    sessionStorage.removeItem('usuarioNome');
    sessionStorage.removeItem('usuarioTipo');
    sessionStorage.removeItem('usuarioId'); 
    window.location.href = "/web/frontend/accounts/IndexGetGreen/index.html"; 
}
logoutLink.addEventListener('click', (e) => {
    e.preventDefault(); 
    if (confirm('Tem certeza que deseja sair da conta?')) {
        logout();
    }
});



function openNovaColetaModal() {
    const nomeLogado = sessionStorage.getItem('usuarioNome');
    const tipoLogado = sessionStorage.getItem('usuarioTipo');
    
    if (!nomeLogado || tipoLogado !== 'empresa') {
        alert('Você precisa estar logado como uma empresa para solicitar uma nova coleta.');
        window.location.href = "/web/frontend/accounts/IndexGetGreen/index.html"; 
        return; 
    }
    
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
}
function closeNovaColetaModal() {
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    form.reset(); 
}

openBtn.addEventListener('click', openNovaColetaModal);
closeBtn.addEventListener('click', closeNovaColetaModal);
modal.addEventListener('click', (e) => {
    if (e.target === modal) closeNovaColetaModal();
});



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

async function finalizarColeta(coletaId) {
    if (!confirm('Deseja realmente finalizar esta coleta? Esta ação é definitiva e será registrada como concluída.')) {
        return;
    }

    try {
        const response = await fetch(`http://localhost:4000/api/coletas/${coletaId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'concluida' })
        });

        const resultado = await response.json();

        if (response.ok) {
            alert('Coleta finalizada com sucesso! Ela foi movida para o histórico.');
            carregarColetasEmpresa();
        } else {
            alert(`Erro ao finalizar coleta: ${resultado.error}`);
        }
    } catch (err) {
        console.error('Fetch error:', err);
        alert('Erro de conexão com o servidor ao tentar finalizar a coleta.');
    }
}



const renderColetaCard = (coleta, isFinalized = false) => `
    <article class="request-card ${coleta.cardClass}">
        <div class="request-main">
            <div class="request-title">id:${coleta._id}</div>
            <div class="request-sub">Coletor parceiro: ${coleta.coletorNome}</div>
            <div class="request-status-details">
                <span class="status-text">${coleta.statusDetail}</span>
            </div>
        </div>
        <div class="request-side">
            <div class="request-date">${coleta.dataCriacaoFormatada}</div>
            ${coleta.actionButton}
        </div>
    </article>
`;

async function carregarColetasEmpresa() {
    const usuarioId = sessionStorage.getItem('usuarioId');
    
    if (!usuarioId || sessionStorage.getItem('usuarioTipo') !== 'empresa') {
        listPendentes.innerHTML = '<p>Faça login como Empresa para visualizar suas coletas.</p>';
        listConcluidas.innerHTML = '';
        listFinalizadas.innerHTML = '';
        return; 
    }
    
    listPendentes.innerHTML = '<p>Carregando coletas...</p>';
    listConcluidas.innerHTML = '<p>Carregando coletas...</p>';
    listFinalizadas.innerHTML = '<p>Carregando histórico...</p>';

    try {
        const response = await fetch(`http://localhost:4000/api/coletas?usuarioId=${usuarioId}`);
        const coletas = await response.json();
        
        listPendentes.innerHTML = '';
        listConcluidas.innerHTML = '';
        listFinalizadas.innerHTML = '';
        
        const coletasMapeadas = coletas.map((coleta) => {
            const dataCriacao = new Date(coleta.dataCriacao).toLocaleDateString('pt-BR', {
                day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
            });

            let statusText = '';
            let coletorNome = coleta.coletorNome || 'Aguardando atribuição';
            let actionButton = '';
            let cardClass = '';
            let listType;

            if (coleta.status === 'pendente' || coleta.status === 'confirmada') {
                 statusText = coleta.status === 'pendente' ? 'Aguardando Coletor' : 'Coletor Confirmado (Em Andamento)';
                 actionButton = `<button class="btn-action btn-cancel" data-coleta-id="${coleta._id}"><span class="material-icons-outlined">close</span>cancelar</button>`;
                 cardClass = 'is-pending';
                 listType = 'pendente';
            } else if (coleta.status === 'realizada') {
                statusText = 'Coleta Realizada (Aguardando Finalização)';
                actionButton = `<button class="btn-action btn-finish btn-finalizar" data-coleta-id="${coleta._id}"><span class="material-icons-outlined">check</span>finalizar</button>`;
                cardClass = 'is-done';
                listType = 'concluida';
                coletorNome = coleta.coletorNome || 'Coletor Parceiro';
            } else if (coleta.status === 'concluida') {
                statusText = 'Finalizada';
                actionButton = '';
                cardClass = 'is-finalized';
                listType = 'finalizada';
                coletorNome = coleta.coletorNome || 'Coletor Parceiro';
            }
            
            return {
                ...coleta,
                dataCriacaoFormatada: dataCriacao,
                coletorNome: coletorNome,
                statusDetail: statusText,
                actionButton: actionButton,
                listType: listType,
                cardClass: cardClass
            };
        });

        const pendentes = coletasMapeadas.filter(c => c.listType === 'pendente');
        const concluidas = coletasMapeadas.filter(c => c.listType === 'concluida');
        const finalizadas = coletasMapeadas.filter(c => c.listType === 'finalizada');
        
        if (pendentes.length === 0) {
            listPendentes.innerHTML = '<p>Nenhuma coleta pendente no momento.</p>';
        } else {
            pendentes.forEach(coleta => { listPendentes.innerHTML += renderColetaCard(coleta); });
        }
        
        if (concluidas.length === 0) {
            listConcluidas.innerHTML = '<p>Nenhuma coleta concluída ainda.</p>';
        } else {
             concluidas.forEach(coleta => { listConcluidas.innerHTML += renderColetaCard(coleta); });
            
            document.querySelectorAll('#listConcluidas .btn-finalizar').forEach(button => {
                button.addEventListener('click', (e) => {
                    e.preventDefault();
                    const coletaId = e.currentTarget.getAttribute('data-coleta-id');
                    if (coletaId) {
                        finalizarColeta(coletaId);
                    }
                });
            });
        }
        
        if (finalizadas.length === 0) {
            listFinalizadas.innerHTML = '<p>Nenhuma coleta finalizada registrada no histórico.</p>';
        } else {
             finalizadas.forEach(coleta => {
                const cardHTML = `
                    <article class="request-card ${coleta.cardClass}">
                        <div class="request-main">
                            <div class="request-title">id:${coleta._id}</div>
                            <div class="request-sub">Coletor parceiro: ${coleta.coletorNome}</div>
                            <div class="request-status-details">
                                <span class="status-text">${coleta.statusDetail}</span>
                            </div>
                        </div>
                        <div class="request-side">
                            <div class="request-date">${coleta.dataCriacaoFormatada}</div>
                        </div>
                    </article>
                `;
                listFinalizadas.innerHTML += cardHTML;
            });
        }
        
        document.querySelectorAll('#listPendentes .btn-cancel').forEach(button => {
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
        listFinalizadas.innerHTML = '';
    }
}


form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nomeLogado = sessionStorage.getItem('usuarioNome');
    const idLogado = sessionStorage.getItem('usuarioId');
    const tipoLogado = sessionStorage.getItem('usuarioTipo');

    if (!nomeLogado || !idLogado || tipoLogado !== 'empresa') {
        alert('Erro de autenticação: Você deve estar logado como empresa para solicitar uma coleta.');
        return; 
    }

    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    data.quantidade = parseFloat(data.quantidade);
    
    data.itensDisponiveis = parseInt(data.itensDisponiveis, 10);

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
            closeNovaColetaModal(); 
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


function showChatbotModal() {
    overlayChatbot.style.display = 'flex';
    overlayChatbot.setAttribute('aria-hidden','false');
}
function hideChatbotModal(){
    overlayChatbot.style.display = 'none';
    overlayChatbot.setAttribute('aria-hidden','true');
}

btnChatbot.addEventListener('click', function(e){ e.preventDefault(); showChatbotModal(); });
closeChatbot.addEventListener('click', hideChatbotModal);
overlayChatbot.addEventListener('click', function(e){ if (e.target === overlayChatbot) hideChatbotModal(); });


function appendMessage(text, who) {
    const el = document.createElement('div');
    el.className = 'msg ' + (who === 'user' ? 'user' : 'server');
    el.textContent = text;
    chatArea.appendChild(el);
    chatArea.scrollTop = chatArea.scrollHeight;
}

function connectWS() {
    const WS_URL = 'ws://localhost:8080';
    let ws = null;
    let reconnectTimer = null;
    
    if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) return;
    ws = new WebSocket(WS_URL);
    ws.addEventListener('open', () => { appendMessage('Conectado ao adaptador.', 'user'); });
    ws.addEventListener('message', (evt) => {
        let obj = null; try { obj = JSON.parse(evt.data); } catch (e) { return; }
        if (obj.type === 'RESP' || obj.type === 'MSG') {
            const text = obj.payload || '';
            if (text.toLowerCase().includes('bem-vindo') || text.toLowerCase().includes('0 - sair')) { renderOptions(text); }
            else appendMessage(text, 'server');
        } else if (obj.type === 'DES') appendMessage('Servidor está desligando.', 'server');
        else if (obj.type === 'ERROR') appendMessage('Erro: ' + obj.payload, 'server');
    });
    ws.addEventListener('close', () => { appendMessage('Conexão com adaptador fechada.', 'user'); if (!reconnectTimer) reconnectTimer = setTimeout(()=>{ reconnectTimer=null; connectWS(); },2000); });
    ws.addEventListener('error', (e)=>{ console.error('WS error', e); });

    function renderOptions(menuText){
        opts.innerHTML = ''; const lines = menuText.split('\n');
        for (const line of lines){ const m = line.match(/^\s*(\d+)\s*-\s*(.+)$/); if (m){ const btn = document.createElement('button'); btn.textContent = m[1] + ' — ' + m[2]; btn.className='option-btn'; btn.addEventListener('click', ()=>{ if (!ws||ws.readyState!==WebSocket.OPEN){ appendMessage('Adaptador indisponível','user'); return; } ws.send(JSON.stringify({type:'PED', payload: m[1]})); appendMessage('Você: '+m[2],'user'); }); opts.appendChild(btn);} }
    }
}

let connectedOnce = false;
btnChatbot.addEventListener('click', ()=>{ if(!connectedOnce){ connectWS(); connectedOnce=true; } });

sendManual.addEventListener('click', ()=>{
    const txt = manualInput.value.trim();
    if (!txt) return;

    if (/^\d+$/.test(txt)) {
        if (!ws || ws.readyState !== WebSocket.OPEN) { appendMessage('Adaptador indisponível','user'); return; }
        ws.send(JSON.stringify({ type: 'PED', payload: txt }));
        appendMessage('Você: ' + txt, 'user');
        manualInput.value = '';
        return;
    }

    appendMessage('Você: ' + txt, 'user');
    appendMessage(
        'No momento, só posso responder perguntas do menu. ' +
        'Caso queira fazer outra pergunta, entre em contato nas redes sociais e email.',
        'server'
    );
    manualInput.value = '';
});

   document.addEventListener('DOMContentLoaded', function () {
            const nome = sessionStorage.getItem('usuarioNome');
            const idLogado = sessionStorage.getItem('usuarioId'); 
            
            const usuarioNomeElement = document.getElementById('usuarioNome');
            if (usuarioNomeElement) usuarioNomeElement.textContent = nome || 'Usuário';
            
            const logoutLink = document.getElementById('logoutLink');
            if (logoutLink) {
                logoutLink.addEventListener('click', (e) => {
                    e.preventDefault();
                    if (confirm('Tem certeza que deseja sair da conta?')) {
                        sessionStorage.removeItem('usuarioNome');
                        sessionStorage.removeItem('usuarioTipo');
                        sessionStorage.removeItem('usuarioId'); 
                        window.location.href = "/web/frontend/accounts/IndexGetGreen/index.html"; 
                    }
                });
            }

            const linkOpenDenuncia = document.getElementById('openDenuncia');
            const overlayDenuncia = document.getElementById('denunciaModalOverlay');
            const closeDenuncia = document.getElementById('closeDenunciaModal');
            const formDenuncia = document.getElementById('formDenuncia');

            function showDenunciaModal() {
                overlayDenuncia.style.display = 'flex';
                overlayDenuncia.setAttribute('aria-hidden', 'false');
                document.body.style.overflow = 'hidden';
            }
            function hideDenunciaModal() {
                overlayDenuncia.style.display = 'none';
                overlayDenuncia.setAttribute('aria-hidden', 'true');
                document.body.style.overflow = '';
                formDenuncia.reset(); 
            }

            if (linkOpenDenuncia) linkOpenDenuncia.addEventListener('click', function(e){ e.preventDefault(); showDenunciaModal(); });
            if (closeDenuncia) closeDenuncia.addEventListener('click', hideDenunciaModal);
            if (overlayDenuncia) overlayDenuncia.addEventListener('click', function(e){ if (e.target === overlayDenuncia) hideDenunciaModal(); });


            formDenuncia.addEventListener('submit', async (e) => {
                e.preventDefault();

                if (!idLogado) {
                     alert('Erro de autenticação: ID de usuário não encontrado.');
                     return; 
                }

                const data = {
                  titulo: formDenuncia.titulo.value.trim(),
                  descricao: formDenuncia.descricao.value.trim(),
                  local: formDenuncia.local.value.trim(),
                  dataOcorrencia: formDenuncia.dataOcorrencia.value,
                  usuarioId: idLogado,
                  usuarioNome: nome,
                };

                try {
                  const response = await fetch('http://localhost:4000/api/denuncias', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                  });

                  const resultado = await response.json();

                  if (response.ok) {
                    alert('Denúncia enviada com sucesso!');
                    hideDenunciaModal(); 
                  } else {
                    alert('Erro ao enviar denúncia: ' + (resultado.error || 'Verifique a conexão.'));
                  }
                } catch (err) {
                  alert('Erro de conexão com o servidor.');
                  console.error(err);
                }
            });


            const btnChat = document.getElementById('openChatbot');
            const overlayChat = document.getElementById('modalOverlay');
            const closeChat = document.getElementById('closeModal');
            const chatArea = document.getElementById('chatArea');
            const opts = document.getElementById('optionsContainer');
            const manualInput = document.getElementById('manualInput');
            const sendManual = document.getElementById('sendManual');

            function showModalChat() {
                overlayChat.style.display = 'flex';
                overlayChat.setAttribute('aria-hidden','false');
            }
            function hideModalChat(){
                overlayChat.style.display = 'none';
                overlayChat.setAttribute('aria-hidden','true');
            }

            if (btnChat) btnChat.addEventListener('click', function(e){ e.preventDefault(); showModalChat(); });
            if (closeChat) closeChat.addEventListener('click', hideModalChat);
            if (overlayChat) overlayChat.addEventListener('click', function(e){ if (e.target === overlayChat) hideModalChat(); });

            const WS_URL = 'ws://localhost:8080';
            let ws = null;
            let reconnectTimer = null;

            function appendMessage(text, who) {
                const el = document.createElement('div');
                el.className = 'msg ' + (who === 'user' ? 'user' : 'server');
                el.textContent = text;
                chatArea.appendChild(el);
                chatArea.scrollTop = chatArea.scrollHeight;
            }

            function connectWS() {
                if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) return;
                ws = new WebSocket(WS_URL);
                ws.addEventListener('open', () => { appendMessage('Conectado ao adaptador.', 'user'); });
                ws.addEventListener('message', (evt) => {
                    let obj = null; try { obj = JSON.parse(evt.data); } catch (e) { return; }
                    if (obj.type === 'RESP' || obj.type === 'MSG') {
                        const text = obj.payload || '';
                        if (text.toLowerCase().includes('bem-vindo') || text.toLowerCase().includes('0 - sair')) { renderOptions(text); }
                        else appendMessage(text, 'server');
                    } else if (obj.type === 'DES') appendMessage('Servidor está desligando.', 'server');
                    else if (obj.type === 'ERROR') appendMessage('Erro: ' + obj.payload, 'server');
                });
                ws.addEventListener('close', () => { appendMessage('Conexão com adaptador fechada.', 'user'); if (!reconnectTimer) reconnectTimer = setTimeout(()=>{ reconnectTimer=null; connectWS(); },2000); });
                ws.addEventListener('error', (e)=>{ console.error('WS error', e); });
            }

            function renderOptions(menuText){
                opts.innerHTML = ''; const lines = menuText.split('\n');
                for (const line of lines){ const m = line.match(/^\s*(\d+)\s*-\s*(.+)$/); if (m){ const btn = document.createElement('button'); btn.textContent = m[1] + ' — ' + m[2]; btn.className='option-btn'; btn.addEventListener('click', ()=>{ if (!ws||ws.readyState!==WebSocket.OPEN){ appendMessage('Adaptador indisponível','user'); return; } ws.send(JSON.stringify({type:'PED', payload: m[1]})); appendMessage('Você: '+m[2],'user'); }); opts.appendChild(btn);} }
            }

            sendManual.addEventListener('click', ()=>{ 
                const txt = manualInput.value.trim(); 
                if (!txt) return; 

                appendMessage('Você: ' + txt, 'user');
                appendMessage(
                    'No momento, só posso responder perguntas do menu. ' +
                    'Caso queira fazer outra pergunta, entre em contato nas redes sociais e email.',
                    'server'
                );
                manualInput.value = '';
            });

            let connectedOnce = false;
            if (btnChat) btnChat.addEventListener('click', ()=>{ if(!connectedOnce){ connectWS(); connectedOnce=true; } }); 
        });