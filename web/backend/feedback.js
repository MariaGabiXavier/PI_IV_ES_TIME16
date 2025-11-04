const nome = sessionStorage.getItem('usuarioNome');
        const tipo = sessionStorage.getItem('usuarioTipo');
        const usuarioNomeElement = document.getElementById('usuarioNome');
        const menuAtividadesColaborador = document.getElementById('menuAtividadesColaborador');
        const logoutLinkFeedback = document.getElementById('logoutLinkFeedback');
        const homeLink = document.getElementById('homeLink');
        const idLogado = sessionStorage.getItem('usuarioId'); 

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
        
        const feedbackModal = document.getElementById('feedbackModal');
        const btnAdicionarFeedback = document.getElementById('btnAdicionarFeedback');
        const closeFeedbackModal = document.getElementById('closeFeedbackModal');
        const btnCancelarFeedbackModal = document.getElementById('btnCancelarFeedbackModal');
        const formFeedback = document.getElementById('feedbackForm'); 

        function openFeedbackModal() {
            feedbackModal.setAttribute('aria-hidden', 'false');
            feedbackModal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
            document.getElementById('titulo').focus();
        }

        function closeFeedbackModalFunction() {
            feedbackModal.setAttribute('aria-hidden', 'true');
            feedbackModal.style.display = 'none';
            document.body.style.overflow = '';
            formFeedback.reset(); 
            setRating(0);
        }

        btnAdicionarFeedback.addEventListener('click', openFeedbackModal);
        closeFeedbackModal.addEventListener('click', closeFeedbackModalFunction);
        btnCancelarFeedbackModal.addEventListener('click', closeFeedbackModalFunction); 

        feedbackModal.addEventListener('click', (e) => {
            if (e.target === feedbackModal) closeFeedbackModalFunction();
        });


        const picker = document.getElementById('starPicker');
        const ratingInput = document.getElementById('rating');
        function setRating(n) {
            ratingInput.value = n;
            [...picker.querySelectorAll('.star')].forEach((el, idx) => {
                const active = idx < n;
                el.classList.toggle('active', active);
                el.setAttribute('aria-checked', active ? 'true' : 'false');
            });
        }
        picker.addEventListener('click', (e) => {
            const btn = e.target.closest('.star');
            if (!btn) return;
            const val = Number(btn.getAttribute('data-value'));
            setRating(val);
        });

        const filtroTipo = document.getElementById('filtroTipo');
        const destinatarioSelect = document.getElementById('destinatario');
        const listFeedbacks = document.getElementById('listFeedbacks');
        
        function syncFiltroParaSelect() {
            const val = filtroTipo.value;
            if (val !== 'todos') {
                destinatarioSelect.value = val === 'coletor' ? 'coletor' : 'empresa';
            }
        }
        function syncSelectParaFiltro() {
            const val = destinatarioSelect.value;
            filtroTipo.value = val === 'coletor' ? 'coletor' : 'empresa';
        }

        formFeedback.addEventListener('submit', async (e) => {
            e.preventDefault();
            const data = Object.fromEntries(new FormData(formFeedback).entries());
            data.rating = Number(data.rating || 0);

            if (!data.rating || data.rating < 1) {
                alert('Selecione uma nota (1 a 5 estrelas).');
                return;
            }

            try {
                const clienteId = sessionStorage.getItem('usuarioId') || 'client4';
                const clienteNome = sessionStorage.getItem('usuarioNome') || 'Cliente 4';
                const payload = { ...data, clienteId, clienteNome };
                
                const resp = await fetch('http://localhost:4000/api/feedbacks', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                if (!resp.ok) {
                    const r = await resp.json().catch(() => ({}));
                    throw new Error(r.error || 'Falha ao salvar feedback');
                }
                alert('Obrigado! Seu feedback foi registrado.');
                closeFeedbackModalFunction();
            } catch (err) {
                console.warn('Falha ao salvar no backend:', err);
                alert('Obrigado! Seu feedback foi registrado (Falha de conexão com o servidor).');
            }
            carregarFeedbacks();
        });

        async function carregarFeedbacks() {
            const destino = filtroTipo.value;
            listFeedbacks.innerHTML = '<p>Carregando feedbacks...</p>';
            
            try {
                let url = 'http://localhost:4000/api/feedbacks';
                
                if (destino !== 'todos') {
                    url += `?destinatario=${encodeURIComponent(destino)}`;
                }
                
                const resp = await fetch(url);
                if (!resp.ok) throw new Error('Resposta não OK');
                const itens = await resp.json();
                const arr = Array.isArray(itens) ? itens : [];
                if (arr.length === 0) {
                    listFeedbacks.innerHTML = '<p>Nenhum feedback encontrado.</p>';
                    return;
                }
                listFeedbacks.innerHTML = '';
                arr.forEach(f => { listFeedbacks.innerHTML += renderFeedbackCard(f); });
            } catch (e) {
                console.warn('Erro ao buscar feedbacks, usando mock:', e);
                
                const mock = [
                    { _id: 'fb1', clienteNome: 'Cliente 4', destinatario: 'empresa', rating: 5, titulo: 'Ótima experiência (Empresa)', comentario: 'Coleta rápida e organizada.', dataCriacao: new Date().toISOString() },
                    { _id: 'fb2', clienteNome: 'Cliente 5', destinatario: 'coletor', rating: 4, titulo: 'Bom Coletor', comentario: 'Poderia ser mais rápido.', dataCriacao: new Date().toISOString() }
                ];

                const mockFiltrado = destino === 'todos' 
                    ? mock 
                    : mock.filter(f => f.destinatario === destino);

                listFeedbacks.innerHTML = '';
                if (mockFiltrado.length === 0) {
                     listFeedbacks.innerHTML = '<p>Nenhum feedback encontrado.</p>';
                     return;
                }
                mockFiltrado.forEach(f => { listFeedbacks.innerHTML += renderFeedbackCard(f); });
            }
        }
        
        function renderFeedbackCard(item) {
            const dataTexto = item.dataCriacao
                ? new Date(item.dataCriacao).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                : '';
            const stars = '★'.repeat(item.rating || 0) + '☆'.repeat(Math.max(0, 5 - (item.rating || 0)));
            
            const destinatarioTexto = item.destinatario === 'coletor' ? 'Colaborador' : 
                                      item.destinatario === 'empresa' ? 'Empresa' : 
                                      '—'; 

            return `
                <article class="request-card is-finalized">
                    <div class="request-main">
                        <div class="request-title">id:${item._id || '—'}</div>
                        <div class="request-sub">Cliente: ${item.clienteNome || '—'} | Destinatário: ${destinatarioTexto}</div>
                        <div class="request-status-details">
                            <span class="status-text">${stars} — ${item.titulo || ''}</span>
                        </div>
                        <div class="request-sub">${item.comentario || ''}</div>
                    </div>
                    <div class="request-side">
                        <div class="request-date">${dataTexto}</div>
                    </div>
                </article>
            `;
        }

        filtroTipo.addEventListener('change', carregarFeedbacks);
        
        carregarFeedbacks();
        
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