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

// Criar modelo de usuário da Empresa
const UserEmpresaModel = new mongoose.Schema({
  cnpj: String,
  razaoSocial: String,
  segmento: String,
  email: String,
  senha: String,
  conirmarSenha: String, 
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
  conirmarSenha: String, 
  uf: String,
  cidade: String,
  cep: String,
  bairro: String,
  logradouro: String,
  numero: Number  
});

const userEmpresa = mongoose.model('User Empresa', UserEmpresaModel);
const userColaborador = mongoose.model('User Colaborador', UserColaboradorModel);

app.get('/', (req, res) => {
  res.send('Servidor e MongoDB estão funcionando!');
});

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
  const userEmpresa = await userEmpresa.find();
  res.json(userEmpresa);
});

// Listar usuários Colaborador
app.get('/api/usersColaborador', async (req, res) => {
  const userColaborador = await userColaborador.find();
  res.json(userColaborador);
});


const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Servidor rodando em http://localhost:${PORT}`));
