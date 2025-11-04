const nome = sessionStorage.getItem('usuarioNome');
    const tipo = sessionStorage.getItem('usuarioTipo'); 
    const idLogado = sessionStorage.getItem('usuarioId'); 
    
    const homeLink = document.getElementById('homeLink');
    const logoutLinkFeedback = document.getElementById('logoutLinkFeedback');
    const form = document.getElementById('formDenuncia');

    const usuarioNomeElement = document.getElementById('usuarioNome');
    const menuAtividadesColaborador = document.getElementById('menuAtividadesColaborador');

    const btnOpenDenunciaSide = document.getElementById('openDenunciaModal');
    const btnOpenDenunciaMain = document.getElementById('openDenunciaMainButton');
    const overlayDenuncia = document.getElementById('denunciaModalOverlay');
    const closeDenuncia = document.getElementById('closeDenunciaModal');
    
    function showDenunciaModal() {
        overlayDenuncia.style.display = 'flex';
        overlayDenuncia.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    }
    function hideDenunciaModal() {
        overlayDenuncia.style.display = 'none';
        overlayDenuncia.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        form.reset(); 
    }

    if (btnOpenDenunciaSide) btnOpenDenunciaSide.addEventListener('click', function(e){ e.preventDefault(); showDenunciaModal(); });
    if (btnOpenDenunciaMain) btnOpenDenunciaMain.addEventListener('click', function(e){ e.preventDefault(); showDenunciaModal(); });
    if (closeDenuncia) closeDenuncia.addEventListener('click', hideDenunciaModal);
    if (overlayDenuncia) overlayDenuncia.addEventListener('click', function(e){ if (e.target === overlayDenuncia) hideDenunciaModal(); });


    usuarioNomeElement.textContent = nome || 'Usuário';

    if (tipo === 'colaborador') {
        menuAtividadesColaborador.innerHTML = `
            <li><a href="/web/frontend/accounts/MinhasColetasColaborador/ColetasColaborador.html"><span class="material-icons-outlined">recycling</span>minhas coletas</a></li>
        `;
        if(homeLink) homeLink.href = "/web/frontend/accounts/PrincipalGetGreen/principalColaborador.html";
    } else if (tipo === 'empresa') {
        menuAtividadesColaborador.innerHTML = '';
        if(homeLink) homeLink.href = "/web/frontend/accounts/PrincipalGetGreen/principalEmpresas.html";
    }


    homeLink.addEventListener('click', (e) => {
        e.preventDefault();
        if (tipo === 'empresa') {
            window.location.href = "/web/frontend/accounts/PrincipalGetGreen/principalEmpresas.html";
        } else if (tipo === 'colaborador') {
            window.location.href = "/web/frontend/accounts/PrincipalGetGreen/principalColaborador.html";
        } else {
            window.location.href = "/web/frontend/accounts/IndexGetGreen/index.html";
        }
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      if (!idLogado) {
           alert('Erro de autenticação: ID de usuário não encontrado.');
           return; 
      }

      const data = {
        titulo: form.titulo.value.trim(),
        descricao: form.descricao.value.trim(),
        local: form.local.value.trim(),
        dataOcorrencia: form.dataOcorrencia.value,
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
          alert('Erro ao enviar denúncia: ' + resultado.error);
        }
      } catch (err) {
        alert('Erro de conexão com o servidor.');
        console.error(err);
      }
    });
    
    function logout() {
        sessionStorage.removeItem('usuarioNome');
        sessionStorage.removeItem('usuarioTipo');
        sessionStorage.removeItem('usuarioId'); 
        window.location.href = "/web/frontend/accounts/IndexGetGreen/index.html"; 
    }
    if (logoutLinkFeedback) {
        logoutLinkFeedback.addEventListener('click', (e) => {
            e.preventDefault(); 
            if (confirm('Tem certeza que deseja sair da conta?')) {
                logout();
            }
        });
    }

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
        document.body.style.overflow = 'hidden';
    }
    function hideModalChat(){
        overlayChat.style.display = 'none';
        overlayChat.setAttribute('aria-hidden','true');
        document.body.style.overflow = '';
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