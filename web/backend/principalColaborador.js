 const nome = sessionStorage.getItem('usuarioNome');
            const tipo = sessionStorage.getItem('usuarioTipo');
            const idLogado = sessionStorage.getItem('usuarioId'); 

            if (nome && tipo) {
                document.getElementById('usuarioNome').textContent = nome;
            } else {
                document.getElementById('usuarioNome').textContent = 'Usuário';
            }

            let todasAsColetas = [];
            
            const feedColetas = document.getElementById('feedColetas');
            const searchInput = document.getElementById('searchInput'); 
            const statusFilter = document.getElementById('statusFilter'); 

            function renderizarColetas(coletasParaExibir) {
                feedColetas.innerHTML = ''; 

                if (coletasParaExibir.length === 0) {
                    feedColetas.innerHTML = '<p>Nenhuma coleta encontrada com este critério de pesquisa.</p>';
                    return;
                }

                coletasParaExibir.forEach(coleta => {
                    const dataCriacao = new Date(coleta.dataCriacao).toLocaleDateString('pt-BR', {
                        day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
                    });
                    
                    const dataPreferencial = new Date(coleta.dataPreferencial).toLocaleDateString('pt-BR', {
                        day: '2-digit', month: '2-digit', year: 'numeric'
                    });

                    const cardHTML = `
                        <article class="collection-card">
                            <div class="card-content">
                                <h3>Responsável: ${coleta.responsavel}</h3>
                                <p><strong>Material:</strong> ${coleta.material}</p>
                                <p><strong>Quantidade:</strong> ${coleta.quantidade} ${coleta.unidadeMedida}</p>
                                <p><strong>Data Preferencial:</strong> ${dataPreferencial}</p>
                                <p><strong>Status:</strong> ${coleta.status.toUpperCase()}</p>
                            </div>
                            <div class="card-actions">
                                <span>${dataCriacao}</span>
                                <a href="../ConfirmarColeta/ConfirmarColeta.html?id=${coleta._id}" class="button-vermais">ver mais</a>
                            </div>
                        </article>
                    `;
                    feedColetas.innerHTML += cardHTML;
                });
            }

            async function carregarColetas() {
                feedColetas.innerHTML = '<p>Carregando coletas...</p>'; 

                try {
                    const response = await fetch('http://localhost:4000/api/coletas');
                    const coletas = await response.json();

                    todasAsColetas = coletas; 
                    
                    if (coletas.length === 0) {
                        feedColetas.innerHTML = '<p>Nenhuma coleta solicitada ainda.</p>';
                    } else {
                        renderizarColetas(todasAsColetas);
                    }

                } catch (error) {
                    console.error('Erro ao buscar coletas:', error);
                    feedColetas.innerHTML = '<p>Erro ao carregar as coletas. Verifique a conexão com o servidor.</p>';
                }
            }

            function filtrarColetas() {
                const termoPesquisa = searchInput.value.toLowerCase().trim(); 
                const statusSelecionado = statusFilter.value.toLowerCase(); 

                const coletasFiltradas = todasAsColetas.filter(coleta => {
                    const matchPesquisa = coleta.responsavel.toLowerCase().includes(termoPesquisa);
                    
                    const matchStatus = statusSelecionado === 'todos' || coleta.status.toLowerCase() === statusSelecionado;

                    return matchPesquisa && matchStatus;
                });

                renderizarColetas(coletasFiltradas);
            }

            searchInput.addEventListener('keyup', filtrarColetas);
            statusFilter.addEventListener('change', filtrarColetas);

            document.querySelector('.search-bar').addEventListener('submit', (e) => {
                e.preventDefault(); 
                filtrarColetas(); 
            });


            carregarColetas();
            
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
            
            document.addEventListener('DOMContentLoaded', function () {
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
                      titulo: document.getElementById('titulo').value.trim(),
                      descricao: document.getElementById('descricao').value.trim(),
                      local: document.getElementById('local').value.trim(),
                      dataOcorrencia: document.getElementById('dataOcorrencia').value,
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
            });
