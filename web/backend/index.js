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

const users = mongoose.model('Users', UserEmpresaModel);

app.get('/', (req, res) => {
  res.send('Servidor e MongoDB estão funcionando!');
});

// Criar usuário
app.post('/api/userEmpresa', async (req, res) => {
  try {
    const novoUser = new users(req.body);
    await novoUser.save();
    res.status(201).json(novoUser);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Listar usuários
app.get('/api/users', async (req, res) => {
  const users = await users.find();
  res.json(user);
});


const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Servidor rodando em http://localhost:${PORT}`));
