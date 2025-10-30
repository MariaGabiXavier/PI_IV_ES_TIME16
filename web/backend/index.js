require('dotenv').config(); 
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

// Conectar MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB conectado!'))
.catch((err) => console.error('Erro ao conectar MongoDB:', err));

// ===================================
// DEFINIÇÃO DOS SCHEMAS
// ===================================

// Criar modelo de usuário da Empresa
const UserEmpresaModel = new mongoose.Schema({
  cnpj: String,
  razaoSocial: String,
  segmento: String,
  email: String,
  senha: String,
  confirmarSenha: String, 
  uf: String,
  cidade: String,
  cep: String,
  bairro: String,
  logradouro: String,
  numero: Number  
});

// Criar modelo de usuário do Colaborador
const UserColaboradorModel = new mongoose.Schema({
  nome: String,
  cpf: String,
  data: Date,
  email: String,
  senha: String,
  confirmarSenha: String, 
  uf: String,
  cidade: String,
  cep: String,
  bairro: String,
  logradouro: String,
  numero: Number  
});

// Criar modelo de Coleta
const ColetaSchema = new mongoose.Schema({
  responsavel: { type: String, required: true },
  material: { type: String, required: true },
  quantidade: { type: Number, required: true, min: 0 },
  unidadeMedida: { type: String, required: true },
  dataPreferencial: { type: Date, required: true },
  descricao: String,
  observacoes: String,
  dataCriacao: { type: Date, default: Date.now },
  status: { type: String, default: 'pendente' } // Ex: pendente, agendada, concluida
});


// ===================================
// DEFINIÇÃO DOS MODELOS
// ===================================

const userEmpresa = mongoose.model('User Empresa', UserEmpresaModel);
const userColaborador = mongoose.model('User Colaborador', UserColaboradorModel);
const Coleta = mongoose.model('Coleta', ColetaSchema); // Modelo Coleta

// ===================================
// ROTAS GERAIS
// ===================================

app.get('/', (req, res) => {
  res.send('Servidor e MongoDB estão funcionando!');
});

// ===================================
// ROTAS DE CADASTRO E LOGIN
// ===================================

// Criar usuário Empresa
app.post('/api/userEmpresa', async (req, res) => {
  try {
    const novoUserEmpresa = new userEmpresa(req.body);
    await novoUserEmpresa.save();
    res.status(201).json(novoUserEmpresa);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Criar usuário Colaborador
app.post('/api/userColaborador', async (req, res) => {
  try {
    const novoUserColaborador = new userColaborador(req.body);
    await novoUserColaborador.save();
    res.status(201).json(novoUserColaborador);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Listar usuários Empresa
app.get('/api/usersEmpresa', async (req, res) => {
  const users = await userEmpresa.find();
  res.json(users);
});

// Listar usuários Colaborador
app.get('/api/usersColaborador', async (req, res) => {
  const users = await userColaborador.find();
  res.json(users);
});

// Login
app.post('/api/login', async (req, res) => {
  const { email, senha } = req.body;

  try {
    // Tenta encontrar a Empresa
    const empresa = await userEmpresa.findOne({ email });

    if (empresa) {
      if (empresa.senha === senha) {
        return res.json({ tipo: 'empresa', mensagem: 'Login bem-sucedido', usuario: empresa });
      } 
    }

    // Se não for, tenta encontrar na coleção Colaborador
    const colaborador = await userColaborador.findOne({ email });

    if (colaborador) {
      if (colaborador.senha === senha) {
        // Incluindo o console.log (que estava no código anterior, mas deve ser removido em produção)
        console.log({ tipo: 'colaborador', mensagem: 'Login bem-sucedido', usuario: colaborador }); 
        return res.json({ tipo: 'colaborador', mensagem: 'Login bem-sucedido', usuario: colaborador });
      }
    }
    // Se não encontrar em nenhuma coleção
    res.status(404).json({ error: 'Usuário não encontrado' });

  } catch (err) {
    res.status(500).json({ error: 'Erro no servidor' });
  }
});

// ===================================
// ROTAS DE COLETAS
// ===================================

// Criar nova Coleta
app.post('/api/coletas', async (req, res) => {
  try {
    const novaColeta = new Coleta(req.body);
    await novaColeta.save();
    res.status(201).json(novaColeta);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Listar Coletas
app.get('/api/coletas', async (req, res) => {
  try {
    // Busca todas as coletas, ordenando pela mais recente
    const coletas = await Coleta.find().sort({ dataCriacao: -1 }); 
    res.json(coletas);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar coletas' });
  }
});

// EXCLUIR Coleta por ID
app.delete('/api/coletas/:id', async (req, res) => {
  try {
    const coletaId = req.params.id;
    // Usa findByIdAndDelete para encontrar e remover a coleta
    const resultado = await Coleta.findByIdAndDelete(coletaId); 

    if (!resultado) {
      return res.status(404).json({ error: 'Coleta não encontrada' });
    }

    // Retorna a coleta excluída ou uma mensagem de sucesso
    res.json({ mensagem: 'Coleta excluída com sucesso', coletaExcluida: resultado });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao excluir coleta' });
  }
});

// ===================================
// INICIALIZAÇÃO DO SERVIDOR
// ===================================

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Servidor rodando em http://localhost:${PORT}`));