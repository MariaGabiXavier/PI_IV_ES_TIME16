const modalEdicao = document.getElementById('modal-edicao');
const formEdicao = document.getElementById('form-edicao-perfil');
const btnEdit = document.getElementById('btn-edit'); 
const btnCancelarModal = document.getElementById('btn-cancelar-modal');
const loadingMessage = document.getElementById('loading-message');
const perfilDetalhes = document.getElementById('perfil-detalhes');
const perfilDetalhesPessoais = document.getElementById('perfil-detalhes-pessoais');
const campoSegmentoDiv = document.getElementById('campo-segmento');
const labelDocumento = document.getElementById('label-documento'); 

let dadosAtuais = {}; 
const usuarioTipo = sessionStorage.getItem('usuarioTipo'); 

const cepInput = document.getElementById('edit-cep');
const logradouroInput = document.getElementById('edit-logradouro');
const bairroInput = document.getElementById('edit-bairro'); 
const cidadeInput = document.getElementById('edit-cidade');
const ufInput = document.getElementById('edit-uf');


const handleLogout = () => {
    sessionStorage.removeItem('usuarioNome');
    sessionStorage.removeItem('usuarioTipo');
    sessionStorage.removeItem('usuarioId'); 
    
    window.location.href = "/web/frontend/accounts/IndexGetGreen/index.html"; 
};

const mostrarModalSucesso = (mensagem) => {
    const modal = document.getElementById('modal-sucesso');
    const modalMensagem = document.getElementById('modal-mensagem');
    
    if (modal && modalMensagem) {
        modalMensagem.textContent = mensagem;
        modal.style.display = 'flex';
        setTimeout(() => {
            modal.style.display = 'none';
        }, 3000);
    }
};

const exibirDadosNaTela = (dados) => {
    document.getElementById('email-usuario').textContent = dados.email || 'N/A';
    const enderecoParts = [
        dados.logradouro || '',
        dados.numero || '',
        dados.bairro || '',
        dados.cidade || '',
        dados.uf || '',
    ];
    
    const enderecoCompleto = enderecoParts.filter(Boolean).join(', ');
    const cepString = dados.cep ? ` (CEP: ${dados.cep})` : '';

    document.getElementById('endereco-completo').textContent = enderecoCompleto + cepString || 'Endereço não cadastrado.';
    
    if (dados.tipo === 'empresa') {
        document.getElementById('saudacao-menu').textContent = `Olá, ${dados.razaoSocial.split(' ')[0]}!`;
        document.getElementById('label-nome').textContent = 'Razão Social';
        document.getElementById('nome-usuario').textContent = dados.razaoSocial || 'N/A';
        document.getElementById('documento-usuario').textContent = dados.cnpj || 'N/A';
        if(labelDocumento) labelDocumento.textContent = 'CNPJ'; 
        
        if(campoSegmentoDiv) campoSegmentoDiv.style.display = 'block';
        document.getElementById('segmento-empresa').textContent = dados.segmento || 'N/A';
        
    } else {
        document.getElementById('saudacao-menu').textContent = `Olá, ${dados.nome.split(' ')[0]}!`;
        document.getElementById('label-nome').textContent = 'Nome Completo';
        document.getElementById('nome-usuario').textContent = dados.nome || 'N/A';
        document.getElementById('documento-usuario').textContent = dados.cpf || 'N/A';
        if(labelDocumento) labelDocumento.textContent = 'CPF'; 

        if (campoSegmentoDiv) {
            campoSegmentoDiv.style.display = 'none';
        }
    }
    
    const nomeCompleto = dados.tipo === 'empresa' ? dados.razaoSocial : dados.nome;
    sessionStorage.setItem('usuarioNome', nomeCompleto);
};

const carregarDadosParaEdicao = (dados) => {
    document.getElementById('edit-email').value = dados.email || '';
    
    const docInput = document.getElementById('edit-documento');
    const nomeInput = document.getElementById('edit-nome');
    const segContainer = document.getElementById('campo-segmento-modal');
    const docLabel = document.getElementById('label-documento-modal');
    const nomeLabel = document.getElementById('label-nome-modal');

    const tipo = dados.tipo || usuarioTipo;

    if (tipo === 'colaborador') {
        docLabel.textContent = 'CPF';
        nomeLabel.textContent = 'Nome Completo';
        nomeInput.value = dados.nome || '';
        docInput.value = dados.cpf || '';
        segContainer.style.display = 'none';
    } else if (tipo === 'empresa') {
        docLabel.textContent = 'CNPJ';
        nomeLabel.textContent = 'Razão Social';
        nomeInput.value = dados.razaoSocial || '';
        docInput.value = dados.cnpj || ''; 
        segContainer.style.display = 'block';
        document.getElementById('edit-segmento').value = dados.segmento || '';
    }
    
    document.getElementById('edit-cep').value = dados.cep || '';
    document.getElementById('edit-logradouro').value = dados.logradouro || '';
    document.getElementById('edit-numero').value = dados.numero || '';

    if (bairroInput) bairroInput.value = dados.bairro || '';
    if (cidadeInput) cidadeInput.value = dados.cidade || '';
    if (ufInput) ufInput.value = dados.uf || '';
    
    document.getElementById('edit-senha').value = '';
    document.getElementById('edit-confirmar-senha').value = '';
};

const abrirModalEdicao = () => {
    carregarDadosParaEdicao(dadosAtuais); 
    modalEdicao.style.display = 'flex';
};

const fecharModalEdicao = () => {
    modalEdicao.style.display = 'none';
    document.getElementById('erro-edicao-senha').textContent = '';
    document.getElementById('erro-edicao-geral').textContent = '';
};

const buscarCep = async (cep) => {
    const cepLimpo = cep.replace(/\D/g, ''); 
    if (cepLimpo.length !== 8) return; 

    logradouroInput.value = 'Buscando...'; 
    if (bairroInput) bairroInput.value = 'Buscando...';
    if (cidadeInput) cidadeInput.value = 'Buscando...';
    if (ufInput) ufInput.value = 'Buscando...';
    
    try {
        const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
        const data = await response.json();
        
        if (!data.erro) {
            logradouroInput.value = data.logradouro || ''; 

            if (bairroInput) bairroInput.value = data.bairro || '';
            if (cidadeInput) cidadeInput.value = data.localidade || '';
            if (ufInput) ufInput.value = data.uf || '';
        } else {
            console.log('CEP não encontrado.');
            logradouroInput.value = ''; 
            if (bairroInput) bairroInput.value = '';
            if (cidadeInput) cidadeInput.value = '';
            if (ufInput) ufInput.value = '';
        }
    } catch (e) {
        console.error('Erro ao buscar CEP:', e);
    }
};

const lidarEnvioEdicao = async (e) => {
    e.preventDefault();

    const idUsuario = sessionStorage.getItem('usuarioId');
    const tipo = sessionStorage.getItem('usuarioTipo');
    const endpoint = `http://localhost:4000/api/perfil/${tipo}/${idUsuario}`; 

    const novaSenha = formEdicao.senha.value;
    const confirmarNovaSenha = formEdicao.confirmarSenha.value;
    const erroSenhaSpan = document.getElementById('erro-edicao-senha');
    const erroGeralSpan = document.getElementById('erro-edicao-geral');

    erroSenhaSpan.textContent = '';
    erroGeralSpan.textContent = '';

    if (novaSenha && novaSenha !== confirmarNovaSenha) {
        erroSenhaSpan.textContent = 'As novas senhas não coincidem.';
        return;
    }
    
    const dadosParaEnvio = {
        email: formEdicao.email.value,
        cep: formEdicao.cep.value,
        logradouro: formEdicao.logradouro.value,
        numero: formEdicao.numero.value,
        // ENVIANDO TODOS OS CAMPOS DE ENDEREÇO
        bairro: bairroInput ? bairroInput.value : undefined,
        cidade: cidadeInput ? cidadeInput.value : undefined,
        uf: ufInput ? ufInput.value : undefined,
    };
    
    const tipoBackend = dadosAtuais.tipo || usuarioTipo.toLowerCase();

    if (tipoBackend === 'colaborador') {
        dadosParaEnvio.nome = formEdicao.nome.value;
        dadosParaEnvio.cpf = formEdicao.documento.value;
    } else {
        dadosParaEnvio.razaoSocial = formEdicao.nome.value;
        dadosParaEnvio.segmento = formEdicao.segmento.value;
        dadosParaEnvio.cnpj = formEdicao.documento.value;
    }

    if (novaSenha) {
        dadosParaEnvio.senha = novaSenha;
    }
    
    try {
        const resposta = await fetch(endpoint, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dadosParaEnvio)
        });

        const resultado = await resposta.json();

        if (resposta.ok) {
            fecharModalEdicao();
            mostrarModalSucesso('Perfil atualizado com sucesso!'); 
            
            setTimeout(() => {
                location.reload(); 
            }, 3000); 
            
        } else {
            const errorMessage = resultado.error || 'Erro ao atualizar o perfil.';
            erroGeralSpan.textContent = errorMessage;
        }

    } catch (erro) {
        erroGeralSpan.textContent = 'Erro de conexão com o servidor.';
        console.error('Erro de requisição PUT:', erro);
    }
};

const carregarPerfilInicial = async () => {
    const usuarioId = sessionStorage.getItem('usuarioId');
    const tipo = sessionStorage.getItem('usuarioTipo');
    const nomeArmazenado = sessionStorage.getItem('usuarioNome') || 'Parceiro';

    document.getElementById('saudacao-menu').textContent = `Olá, ${nomeArmazenado.split(' ')[0]}!`;

    if (!usuarioId || !tipo) {
        loadingMessage.textContent = 'Sessão expirada. Redirecionando para o login...';
        setTimeout(() => window.location.href = "../Login/Login.html", 1500);
        return;
    }

    loadingMessage.textContent = 'Carregando dados...';
    
    const apiUrl = `http://localhost:4000/api/perfil/${tipo}/${usuarioId}`;

    try {
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const dadosUsuario = await response.json();
        
        if (dadosUsuario.error) {
            console.error("Erro da API:", dadosUsuario.error);
            loadingMessage.textContent = 'Erro ao carregar dados: ' + dadosUsuario.error;
            loadingMessage.style.display = 'block';
            perfilDetalhes.style.display = 'none';
            if(perfilDetalhesPessoais) perfilDetalhesPessoais.style.display = 'none';
            return;
        }
        
        dadosAtuais = dadosUsuario; 
        
        exibirDadosNaTela(dadosUsuario);
        
        loadingMessage.style.display = 'none'; 
        perfilDetalhes.style.display = 'grid'; 
        if(perfilDetalhesPessoais) perfilDetalhesPessoais.style.display = 'grid'; 

    } catch (error) {
        console.error('Erro de rede/API:', error);
        loadingMessage.textContent = 'Erro de conexão ou dados inválidos ao carregar os dados. Verifique o console.';
        loadingMessage.style.display = 'block';
        perfilDetalhes.style.display = 'none';
        if(perfilDetalhesPessoais) perfilDetalhesPessoais.style.display = 'none';
    }
};

btnEdit.addEventListener('click', abrirModalEdicao);
btnCancelarModal.addEventListener('click', fecharModalEdicao);
formEdicao.addEventListener('submit', lidarEnvioEdicao);

cepInput.addEventListener('blur', (e) => {
    buscarCep(e.target.value);
});

modalEdicao.addEventListener('click', (e) => {
    if (e.target === modalEdicao) {
        fecharModalEdicao();
    }
});

document.addEventListener('DOMContentLoaded', () => {
    carregarPerfilInicial();
});