    const logoutLink = document.getElementById('logoutLink');
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
        
            const nome = sessionStorage.getItem('usuarioNome');
            const tipo = sessionStorage.getItem('usuarioTipo');
            const id = sessionStorage.getItem('usuarioId'); 

            const profileLink = document.getElementById('profileLink');
            const listARealizar = document.getElementById('listARealizar'); 
            const listRealizadas = document.getElementById('listRealizadas'); 
            const listFinalizadas = document.getElementById('listFinalizadas'); 
            const pageTitle = document.getElementById('pageTitle');

            if (nome && tipo) {
                document.getElementById('usuarioNome').textContent = nome;
                pageTitle.textContent = `Minhas Coletas`;
                profileLink.href = "../Perfil/Perfil.html"; 
            } else {
                document.getElementById('usuarioNome').textContent = 'Colaborador';
                pageTitle.textContent = 'Minhas Coletas';
                profileLink.href = "/web/frontend/accounts/Login/loginGetGreen.html"; 
            }

            
            async function cancelarColeta(coletaId) {
                if (!confirm('Tem certeza que deseja cancelar esta coleta que você aceitou? Ela voltará para a lista de coletas disponíveis.')) return;
                try {
                    const response = await fetch(`http://localhost:4000/api/coletas/${coletaId}`, {
                        method: 'PUT', headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ coletorId: null, coletorNome: null, status: 'pendente' }) 
                    });
                    const resultado = await response.json();
                    if (response.ok) {
                        alert('Coleta cancelada. Ela retornará para a lista de coletas disponíveis.');
                        carregarColetasColaborador(); 
                    } else {
                        alert(`Erro ao cancelar coleta: ${resultado.error}`);
                    }
                } catch (err) {
                    console.error('Fetch error:', err);
                    alert('Erro de conexão com o servidor ao tentar cancelar a coleta.');
                }
            }


            
            
            function visualizarColetaFinalizada() {
                 alert("Esta coleta já foi marcada como FINALIZADA pelo solicitante. Use esta aba para visualizar o histórico.");
            }

            const linkOpenDenuncia = document.getElementById('openDenuncia');
            const overlayDenuncia = document.getElementById('denunciaModalOverlay');
            const closeDenuncia = document.getElementById('closeDenunciaModal');
            const formDenuncia = document.getElementById('formDenuncia');
            const idLogado = sessionStorage.getItem('usuarioId'); 

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
                const nomeColaborador = sessionStorage.getItem('usuarioNome');

                if (!idLogado || sessionStorage.getItem('usuarioTipo') !== 'colaborador') {
                     alert('Erro de autenticação: ID ou Tipo de usuário não encontrado. Faça login como Colaborador.');
                     return; 
                }

                const data = {
                  titulo: formDenuncia.titulo.value.trim(),
                  descricao: formDenuncia.descricao.value.trim(),
                  local: formDenuncia.local.value.trim(),
                  dataOcorrencia: formDenuncia.dataOcorrencia.value,
                  usuarioId: idLogado,
                  usuarioNome: nomeColaborador,
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


            async function carregarColetasColaborador() {
                const coletorId = sessionStorage.getItem('usuarioId');
                
                if (!coletorId || sessionStorage.getItem('usuarioTipo') !== 'colaborador') {
                    listARealizar.innerHTML = '<p>Faça login como Colaborador para visualizar suas coletas.</p>';
                    listRealizadas.innerHTML = ''; listFinalizadas.innerHTML = ''; return; 
                }
                
                listARealizar.innerHTML = '<p>Carregando coletas...</p>';
                listRealizadas.innerHTML = '<p>Carregando coletas...</p>';
                listFinalizadas.innerHTML = '<p>Carregando coletas...</p>'; 

                try {
                    const response = await fetch(`http://localhost:4000/api/coletas?coletorId=${coletorId}`);
                    const coletas = await response.json();
                    
                    listARealizar.innerHTML = ''; listRealizadas.innerHTML = ''; listFinalizadas.innerHTML = ''; 
                    
                    const coletasMapeadas = coletas.map((coleta, index) => {
                        const dataCriacao = new Date(coleta.dataCriacao).toLocaleDateString('pt-BR', {
                            day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
                        });

                        const isFinalizada = coleta.status === 'concluida'; 
                        const isRealizada = coleta.status === 'realizada'; 
                        const isPendente = coleta.status === 'confirmada'; 

                        let statusText = coleta.status || 'Agendada com o Colaborador';
                        let actionButton = '';
                        let destinatarioNome = coleta.usuarioNome || '-';
                        let cardClass = '';
                        let requestSideClass = 'request-side'; 

                        if (isPendente) {
                            statusText = 'Coleta Confirmada'; 
                            cardClass = 'is-pending';
                            requestSideClass = 'request-side request-side-pending-actions'; 
                            actionButton = `
                                <div class="action-buttons-group">
                                    <button class="btn-action btn-cancel" data-coleta-id="${coleta._id}"><span class="material-icons-outlined">close</span>Cancelar</button>
                                </div>
                            `;
                        } else if (isRealizada) {
                            statusText = 'Aguardando Finalização';
                            cardClass = 'is-done'; 
                            actionButton = `<button class="btn-action btn-finish btn-realizada" data-coleta-id="${coleta._id}"><span class="material-icons-outlined">visibility</span>Visualizar</button>`;
                        } else if (isFinalizada) {
                            statusText = 'Coleta Finalizada';
                            cardClass = 'is-finalized'; 
                            actionButton = `<button class="btn-action btn-finish btn-finalizada" data-coleta-id="${coleta._id}"><span class="material-icons-outlined">check_circle</span>Finalizada</button>`;
                        }
                        
                        return { ...coleta, dataCriacaoFormatada: dataCriacao, destinatarioNome: destinatarioNome, statusDetail: statusText, actionButton: actionButton, isPendente: isPendente, isRealizada: isRealizada, isFinalizada: isFinalizada, cardClass: cardClass, requestSideClass: requestSideClass };
                    });

                    const aRealizar = coletasMapeadas.filter(c => c.isPendente); 
                    const realizadas = coletasMapeadas.filter(c => c.isRealizada);
                    const finalizadas = coletasMapeadas.filter(c => c.isFinalizada);
                    
                    
                    if (aRealizar.length === 0) {
                        listARealizar.innerHTML = '<p>Nenhuma coleta pendente para você no momento.</p>';
                    } else {
                        aRealizar.forEach(coleta => {
                            const cardHTML = `<article class="request-card ${coleta.cardClass}"><div class="request-main"><div class="request-title">id:${coleta._id}</div><div class="request-sub">Solicitante: ${coleta.destinatarioNome}</div><div class="request-status-details"><span class="status-text">${coleta.statusDetail}</span></div></div><div class="${coleta.requestSideClass}"><div class="request-date">${coleta.dataCriacaoFormatada}</div>${coleta.actionButton}</div></article>`;
                            listARealizar.innerHTML += cardHTML;
                        });
                        
                        document.querySelectorAll('#listARealizar .btn-cancel').forEach(button => {
                            button.addEventListener('click', (e) => {
                                e.preventDefault(); const coletaId = e.currentTarget.getAttribute('data-coleta-id');
                                if (coletaId) cancelarColeta(coletaId);
                            });
                        });
                        
                         document.querySelectorAll('#listARealizar .btn-finish').forEach(button => {
                            button.addEventListener('click', (e) => {
                                e.preventDefault(); const coletaId = e.currentTarget.getAttribute('data-coleta-id');
                                if (coletaId) marcarComoRealizada(coletaId); 
                            });
                        });
                    }

                    if (realizadas.length === 0) {
                        listRealizadas.innerHTML = '<p>Nenhuma coleta marcada como concluída (aguardando finalização do solicitante).</p>';
                    } else {
                         realizadas.forEach(coleta => {
                             const cardHTML = `<article class="request-card ${coleta.cardClass}"><div class="request-main"><div class="request-title">id:${coleta._id}</div><div class="request-sub">Solicitante: ${coleta.destinatarioNome}</div><div class="request-status-details"><span class="status-text">${coleta.statusDetail}</span></div></div><div class="request-side"><div class="request-date">${coleta.dataCriacaoFormatada}</div>${coleta.actionButton}</div></article>`;
                            listRealizadas.innerHTML += cardHTML;
                        });
                        
                        document.querySelectorAll('#listRealizadas .btn-realizada').forEach(button => {
                            button.addEventListener('click', (e) => {
                                e.preventDefault(); alert("Esta coleta foi marcada como realizada por você e está aguardando a finalização do solicitante.");
                            });
                        });
                    }
                    
                     if (finalizadas.length === 0) {
                        listFinalizadas.innerHTML = '<p>Nenhuma coleta finalizada no histórico.</p>';
                    } else {
                         finalizadas.forEach(coleta => {
                             const cardHTML = `<article class="request-card ${coleta.cardClass}"><div class="request-main"><div class="request-title">id:${coleta._id}</div><div class="request-sub">Solicitante: ${coleta.destinatarioNome}</div><div class="request-status-details"><span class="status-text">${coleta.statusDetail}</span></div></div><div class="request-side"><div class="request-date">${coleta.dataCriacaoFormatada}</div>${coleta.actionButton}</div></article>`;
                            listFinalizadas.innerHTML += cardHTML;
                        });
                        
                        document.querySelectorAll('#listFinalizadas .btn-finalizada').forEach(button => {
                            button.addEventListener('click', (e) => {
                                e.preventDefault(); visualizarColetaFinalizada();
                            });
                        });
                    }
                    

                } catch (error) {
                    console.error('Erro ao buscar coletas:', error);
                    listARealizar.innerHTML = '<p>Erro ao carregar as coletas. Verifique a conexão com o servidor.</p>';
                    listRealizadas.innerHTML = ''; listFinalizadas.innerHTML = '';
                }
            }
            
            carregarColetasColaborador(); 

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
            }
            function hideModal(){
                overlay.style.display = 'none';
                overlay.setAttribute('aria-hidden','true');
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
