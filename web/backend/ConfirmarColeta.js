const nome = sessionStorage.getItem('usuarioNome'); 
    const tipo = sessionStorage.getItem('usuarioTipo');
    const idLogado = sessionStorage.getItem('usuarioId'); 
    const usuarioNomeElement = document.getElementById('usuarioNome');
    const menuAtividadesColaborador = document.getElementById('menuAtividadesColaborador');
    const homeLink = document.getElementById('homeLink');
    const logoutLink = document.getElementById('logoutLink');

    if (nome) {
        usuarioNomeElement.textContent = nome;
    } else {
        usuarioNomeElement.textContent = 'Usuário';
    }

    if (tipo === 'colaborador') {
        menuAtividadesColaborador.innerHTML = `
            <li><a href="/web/frontend/accounts/MinhasColetasColaborador/ColetasColaborador.html"><span class="material-icons-outlined">recycling</span>minhas coletas</a></li>
        `;
        if(homeLink) homeLink.href = "/web/frontend/accounts/PrincipalGetGreen/principalColaborador.html";
    } else if (tipo === 'empresa') {
        menuAtividadesColaborador.innerHTML = '';
        if(homeLink) homeLink.href = "/web/frontend/accounts/PrincipalGetGreen/principalEmpresas.html";
    }

    function criarTag(texto) {
        const span = document.createElement("span");
        span.classList.add("tag");
        span.textContent = texto.trim();
        return span;
    }

    function formatarData(dataISO) {
        if (!dataISO) return "Data não informada";
        const data = new Date(dataISO);
        const dataAjustada = new Date(data.getTime() + data.getTimezoneOffset() * 60000);
        return dataAjustada.toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" });
    }

    async function carregarDetalhesColeta() {
        const params = new URLSearchParams(window.location.search);
        const id = params.get("id");
        if (!id) return;

        try {
            const response = await fetch(`http://localhost:4000/coletas/${id}`);
            if (!response.ok) throw new Error("Erro: " + response.status);
            const coleta = await response.json();

            document.getElementById("titulo").textContent = coleta.responsavel || "Sem responsável";

            const materialContainer = document.getElementById("material-tags");
            materialContainer.innerHTML = "";
            const materiais = (coleta.material || "").split(",").map(m => m.trim()).filter(Boolean);
            if (materiais.length > 0) {
                materiais.forEach(m => materialContainer.appendChild(criarTag(m)));
            } else {
                materialContainer.textContent = "Sem material informado";
            }

            document.getElementById("quantidade").textContent = 
                coleta.quantidade ? `${coleta.quantidade} ${coleta.unidadeMedida || ""}` : "Não informada";

            document.getElementById("data-preferencial").textContent = formatarData(coleta.dataPreferencial);

            document.getElementById("descricao").textContent = coleta.descricao || "Sem descrição.";

            document.getElementById("observacoes").textContent = coleta.observacoes || "Sem observações registradas.";

            const botaoConfirmar = document.getElementById("btn-confirmar");
            
            if (coleta.status === "concluida" || coleta.status === "confirmada") {
                botaoConfirmar.disabled = true;
                botaoConfirmar.textContent = "Coleta Confirmada";
                botaoConfirmar.style.backgroundColor = "#4CAF50";
                botaoConfirmar.style.color = "#fff";

            } else {
                botaoConfirmar.onclick = async () => {
                    const coletorId = sessionStorage.getItem('usuarioId'); 
                    const coletorNome = sessionStorage.getItem('usuarioNome'); 
                    
                    if (!coletorId || !coletorNome) {
                        alert("Erro: Dados do colaborador não encontrados. Faça login novamente.");
                        return;
                    }

                    try {
                        const res = await fetch(`http://localhost:4000/coletas/${id}/confirmar`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ coletorId: coletorId, coletorNome: coletorNome }) 
                        });
                        const data = await res.json();

                        if (res.ok) {
                            alert("Coleta confirmada com sucesso! Ela está na sua lista 'Pendentes'.");
                            botaoConfirmar.disabled = true;
                            botaoConfirmar.textContent = "Coleta Confirmada";
                            botaoConfirmar.style.backgroundColor = "#4CAF50";
                            window.location.href = "/web/frontend/accounts/MinhasColetasColaborador/ColetasColaborador.html"; 
                        } else {
                            alert("Erro: " + (data.error || "Não foi possível confirmar."));
                        }
                    } catch (err) {
                        alert("Erro ao confirmar coleta.");
                        console.error(err);
                    }
                };
            }
        } catch (error) {
            console.error("Erro ao carregar coleta:", error);
            document.getElementById("titulo").textContent = "Erro ao carregar coleta";
        }
    }

    carregarDetalhesColeta();

    
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

    const linkOpenDenuncia = document.getElementById('openDenuncia');
    const overlayDenuncia = document.getElementById('denunciaModalOverlay');
    const closeDenuncia = document.getElementById('closeDenunciaModal');
    const formDenuncia = document.getElementById('formDenuncia');

    function showDenunciaModal() {
        overlayDenuncia.style.display = 'flex';
        overlayDenuncia.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        document.getElementById('tituloDenuncia').focus();
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
        const nomeUsuario = sessionStorage.getItem('usuarioNome');

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
          usuarioNome: nomeUsuario,
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

    document.addEventListener('DOMContentLoaded', function () {
        const btn = document.getElementById('openChatbot');
        const overlay = document.getElementById('modalOverlay');
        const close = document.getElementById('closeModal');
        const chatArea = document.getElementById('chatArea');
        const opts = document.getElementById('optionsContainer');
        const manualInput = document.getElementById('manualInput');
        const sendManual = document.getElementById('sendManual');

        function showModal() {
            overlay.style.display = 'flex';
            overlay.setAttribute('aria-hidden','false');
            document.body.style.overflow = 'hidden';
        }
        function hideModal(){
            overlay.style.display = 'none';
            overlay.setAttribute('aria-hidden','true');
            document.body.style.overflow = '';
        }

        btn.addEventListener('click', function(e){ e.preventDefault(); showModal(); });
        close.addEventListener('click', hideModal);
        overlay.addEventListener('click', function(e){ if (e.target === overlay) hideModal(); });

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

        let connectedOnce = false;
        btn.addEventListener('click', ()=>{ if(!connectedOnce){ connectWS(); connectedOnce=true; } });
    });
