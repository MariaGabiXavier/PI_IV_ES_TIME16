require('dotenv').config(); 
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt'); //

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB conectado!'))
.catch((err) => console.error('Erro ao conectar MongoDB:', err));

const UserEmpresaModel = new mongoose.Schema({
  cnpj: String,
  razaoSocial: String,
  segmento: String,
  email: { type: String, required: true, unique: true }, 
  senha: { type: String, required: true }, 
  uf: String,
  cidade: String,
  cep: String,
  bairro: String,
  logradouro: String,
  numero: Number 
});

const UserColaboradorModel = new mongoose.Schema({
  nome: String,
  cpf: String,
  data: Date,
  email: { type: String, required: true, unique: true },
  senha: { type: String, required: true }, 
  uf: String,
  cidade: String,
  cep: String,
  bairro: String,
  logradouro: String,
  numero: Number 
});

const ColetaSchema = new mongoose.Schema({
  responsavel: { type: String, required: true },
  material: { type: String, required: true },
  quantidade: { type: Number, required: true, min: 0 },
  unidadeMedida: { type: String, required: true },
  dataPreferencial: { type: Date, required: true },
  descricao: String,
  observacoes: String,
  dataCriacao: { type: Date, default: Date.now },
  status: { type: String, default: 'pendente' },
  usuarioId: { type: String, required: true }, 
  usuarioNome: { type: String, required: true },
  coletorId: { type: String, default: null }, 
  coletorNome: { type: String, default: null },
  enderecoColeta: String, 
  itensDisponiveis: Number, 
});

const userEmpresa = mongoose.model('User Empresa', UserEmpresaModel);
const userColaborador = mongoose.model('User Colaborador', UserColaboradorModel);
const Coleta = mongoose.model('Coleta', ColetaSchema); 

const FeedbackSchema = new mongoose.Schema({
  clienteId: { type: String, required: true },
  clienteNome: { type: String, required: true },
  destinatario: { type: String, enum: ['coletor', 'empresa'], required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  titulo: { type: String, required: true },
  comentario: { type: String, required: true },
  coletaId: { type: String, default: null },
  dataCriacao: { type: Date, default: Date.now }
});
const Feedback = mongoose.model('Feedback', FeedbackSchema);

app.get('/', (req, res) => {
  res.send('Servidor e MongoDB estão funcionando!');
});

const MIN_PASSWORD_LENGTH = 6; 
const SALT_ROUNDS = 10;

app.post('/api/userEmpresa', async (req, res) => {
  try {
    const { email, senha, confirmarSenha } = req.body;
    
    if (!senha || senha.length < MIN_PASSWORD_LENGTH) {
      return res.status(400).json({ error: `A senha deve ter no mínimo ${MIN_PASSWORD_LENGTH} caracteres.` });
    }
    if (senha !== confirmarSenha) {
      return res.status(400).json({ error: 'As senhas não coincidem (erro interno).' });
    }

    const empresaExistente = await userEmpresa.findOne({ email });
    const colaboradorExistente = await userColaborador.findOne({ email });

    if (empresaExistente || colaboradorExistente) {
      return res.status(409).json({ error: 'Este email já está cadastrado. Por favor, use outro.' });
    }
    
    const hashedPassword = await bcrypt.hash(senha, SALT_ROUNDS); 

    const novoUserEmpresa = new userEmpresa({ 
      ...req.body, 
      senha: hashedPassword 
    });

    delete novoUserEmpresa.confirmarSenha; 

    await novoUserEmpresa.save();

    res.status(201).json({
      tipo: 'empresa', 
      mensagem: 'Cadastro bem-sucedido',
      usuario: { 
        razaoSocial: novoUserEmpresa.razaoSocial,
        email: novoUserEmpresa.email 
      }, 
      usuarioId: novoUserEmpresa._id
    });
  } catch (err) {
    if (err.code === 11000) { 
        return res.status(409).json({ error: 'Este email já está cadastrado. Por favor, use outro.' });
    }
    res.status(500).json({ error: 'Erro ao cadastrar empresa: ' + err.message });
  }
});

app.post('/api/userColaborador', async (req, res) => {
  try {
    const { email, senha, confirmarSenha } = req.body; 
    
    const colaboradorExistente = await userColaborador.findOne({ email });
    const empresaExistente = await userEmpresa.findOne({ email });

    if (colaboradorExistente || empresaExistente) {
      return res.status(409).json({ error: 'Este email já está cadastrado. Por favor, use outro.' });
    }
    if (!senha || senha.length < MIN_PASSWORD_LENGTH) {
      return res.status(400).json({ error: `A senha deve ter no mínimo ${MIN_PASSWORD_LENGTH} caracteres.` });
    }
    if (senha !== confirmarSenha) { 
      return res.status(400).json({ error: 'As senhas não coincidem.' });
    }
    
    const hashedPassword = await bcrypt.hash(senha, SALT_ROUNDS); //

    const novoUserColaborador = new userColaborador({
      ...req.body,
      senha: hashedPassword 
    });

    delete novoUserColaborador.confirmarSenha; 

    await novoUserColaborador.save();
    
    res.status(201).json({
      tipo: 'colaborador', 
      mensagem: 'Cadastro bem-sucedido',
      usuario: novoUserColaborador, 
      usuarioId: novoUserColaborador._id
    });
  } catch (err) {
    if (err.code === 11000) {
        return res.status(409).json({ error: 'Este email já está cadastrado. Por favor, use outro.' });
    }
    res.status(500).json({ error: 'Erro ao cadastrar colaborador: ' + err.message });
  }
});

app.get('/api/usersEmpresa', async (req, res) => {
  const users = await userEmpresa.find();
  res.json(users);
});

app.get('/api/usersColaborador', async (req, res) => {
  const users = await userColaborador.find();
  res.json(users);
});

app.post('/api/login', async (req, res) => {
  const { email, senha } = req.body;

  try {
    const empresa = await userEmpresa.findOne({ email });

    if (empresa) {
      const isMatch = await bcrypt.compare(senha, empresa.senha); 
      if (isMatch) {
        return res.json({ 
          tipo: 'empresa', 
          mensagem: 'Login bem-sucedido', 
          usuario: empresa, 
          usuarioId: empresa._id 
        });
      } 
    }
    
    const colaborador = await userColaborador.findOne({ email });

    if (colaborador) {
      const isMatch = await bcrypt.compare(senha, colaborador.senha); //
      if (isMatch) {
        console.log({ tipo: 'colaborador', mensagem: 'Login bem-sucedido', usuario: colaborador }); 
        return res.json({ 
          tipo: 'colaborador', 
          mensagem: 'Login bem-sucedido', 
          usuario: colaborador,
          usuarioId: colaborador._id 
        });
      }
    }
    
    res.status(401).json({ error: 'Credenciais inválidas. Por favor, verifique seu email ou senha.' });

  } catch (err) {
    console.error('Erro no servidor durante o login:', err);
    res.status(500).json({ error: 'Erro no servidor' });
  }
});

app.get('/api/perfil/:tipo/:id', async (req, res) => {
    const { tipo, id } = req.params;
    let usuario = null;

    try {
        if (tipo === 'empresa') {
            usuario = await userEmpresa.findById(id);
        } else if (tipo === 'colaborador') {
            usuario = await userColaborador.findById(id);
        }

        if (!usuario) {
            return res.status(404).json({ error: 'Usuário não encontrado.' });
        }
        
        const dadosPerfil = { ...usuario.toObject(), tipo: tipo }; 

        delete dadosPerfil.senha; 
        delete dadosPerfil.resetPasswordToken;
        delete dadosPerfil.resetPasswordExpires;

        res.status(200).json(dadosPerfil);

    } catch (err) {
        console.error('Erro ao buscar perfil:', err);
        res.status(500).json({ error: 'Erro no servidor ao buscar dados do perfil.' });
    }
});

app.put('/api/perfil/:tipo/:id', async (req, res) => {
    const { tipo, id } = req.params;
    const dadosAtualizados = req.body;
    let Modelo;
    
    try {
        if (tipo === 'empresa') {
            Modelo = userEmpresa;
        } else if (tipo === 'colaborador') {
            Modelo = userColaborador;
        } else {
            return res.status(400).json({ error: 'Tipo de usuário inválido.' });
        }

        if (dadosAtualizados.senha) {
            if (dadosAtualizados.senha.length < MIN_PASSWORD_LENGTH) {
                return res.status(400).json({ error: `A nova senha deve ter no mínimo ${MIN_PASSWORD_LENGTH} caracteres.` });
            }
            
            const hashedPassword = await bcrypt.hash(dadosAtualizados.senha, SALT_ROUNDS); 
            dadosAtualizados.senha = hashedPassword; 
            
            delete dadosAtualizados.confirmarSenha; 
        } else {
            delete dadosAtualizados.senha;
            delete dadosAtualizados.confirmarSenha;
        }
        
        if (dadosAtualizados.email) {
            const usuarioAtual = await Modelo.findById(id);

            if (usuarioAtual && usuarioAtual.email !== dadosAtualizados.email) {
                
                const empresaExistente = await userEmpresa.findOne({ email: dadosAtualizados.email });
                const colaboradorExistente = await userColaborador.findOne({ email: dadosAtualizados.email });
                
                const isConflict = (empresaExistente && empresaExistente._id.toString() !== id) || 
                                   (colaboradorExistente && colaboradorExistente._id.toString() !== id);

                if (isConflict) {
                    return res.status(409).json({ error: 'Este email já está em uso por outro cadastro.' });
                }
            }
        }

        const options = { new: true, runValidators: true }; 
        
        const resultado = await Modelo.findByIdAndUpdate(id, dadosAtualizados, options); 

        if (!resultado) {
            return res.status(404).json({ error: 'Usuário não encontrado para atualização.' });
        }
        
        res.status(200).json({ message: 'Perfil atualizado com sucesso!', usuario: resultado });

    } catch (err) {
        console.error('Erro ao atualizar perfil:', err);
        res.status(500).json({ error: 'Erro no servidor ao atualizar perfil: ' + err.message });
    }
});

app.post('/api/coletas', async (req, res) => {
  const { usuarioId, usuarioNome } = req.body;
  
  if (!usuarioId || !usuarioNome) {
    return res.status(401).json({ error: 'Dados de autenticação (ID/Nome) ausentes. A coleta deve ser solicitada por um usuário logado.' });
  }

  try {
    const novaColeta = new Coleta(req.body);
    await novaColeta.save();
    res.status(201).json(novaColeta);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/coletas', async (req, res) => {
  try {
    let filtro = {};
    if (req.query.usuarioId) {
      filtro = { usuarioId: req.query.usuarioId };
    }
    
    if (req.query.coletorId) {
      filtro = { coletorId: req.query.coletorId };
    }


    const coletas = await Coleta.find(filtro).sort({ dataCriacao: -1 }); 
    res.json(coletas);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar coletas' });
  }
});

app.get('/api/feedbacks', async (req, res) => {
  try {
    const { clienteId, destinatario } = req.query;
    const filtro = {};
    if (clienteId) filtro.clienteId = clienteId;
    
    if (destinatario && ['coletor', 'empresa'].includes(destinatario.toLowerCase())) {
        filtro.destinatario = destinatario;
    }
    
    const feedbacks = await Feedback.find(filtro).sort({ dataCriacao: -1 });
    res.json(feedbacks);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar feedbacks: ' + err.message });
  }
});

app.post('/api/feedbacks', async (req, res) => {
  try {
    const { clienteId, clienteNome, destinatario, rating, titulo, comentario } = req.body;
    if (!clienteId || !clienteNome) return res.status(400).json({ error: 'clienteId e clienteNome são obrigatórios.' });
    if (!['coletor', 'empresa'].includes(destinatario)) return res.status(400).json({ error: 'destinatario inválido.' });
    if (!rating || rating < 1 || rating > 5) return res.status(400).json({ error: 'rating deve ser 1-5.' });
    if (!titulo || !comentario) return res.status(400).json({ error: 'titulo e comentario são obrigatórios.' });

    const novo = new Feedback(req.body);
    await novo.save();
    res.status(201).json(novo);
  } catch (err) {
    res.status(400).json({ error: 'Erro ao salvar feedback: ' + err.message });
  }
});

app.put('/api/coletas/:id', async (req, res) => {
  try {
    const coletaId = req.params.id;
    const updates = req.body; 
    
    const options = { new: true, runValidators: true }; 
    
    const resultado = await Coleta.findByIdAndUpdate(coletaId, updates, options); 

    if (!resultado) {
      return res.status(404).json({ error: 'Coleta não encontrada' });
    }
    
    res.json(resultado);
  } catch (err) {
    console.error('Erro ao atualizar coleta:', err);
    res.status(500).json({ error: 'Erro ao atualizar coleta: ' + err.message });
  }
});


app.delete('/api/coletas/:id', async (req, res) => {
  try {
    const coletaId = req.params.id;
    const resultado = await Coleta.findByIdAndDelete(coletaId); 

    if (!resultado) {
      return res.status(404).json({ error: 'Coleta não encontrada' });
    }
    res.json({ mensagem: 'Coleta excluída com sucesso', coletaExcluida: resultado });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao excluir coleta' });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Servidor rodando em http://localhost:${PORT}`));



app.get('/coletas/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const coleta = mongoose.isValidObjectId(id)
      ? await Coleta.findById(id)
      : await Coleta.findOne({ _id: id });

    if (!coleta) {
      return res.status(404).send('Coleta não encontrada');
    }

    res.json(coleta);
  } catch (err) {
    console.error('Erro ao buscar coleta:', err);
    res.status(500).send('Erro ao buscar coleta: ' + err.message);
  }
});


app.post('/coletas/:id/confirmar', async (req, res) => {
  try {
    const { id } = req.params;
    const { coletorId, coletorNome } = req.body; 

    const coleta = await Coleta.findById(id);
    if (!coleta) return res.status(404).json({ error: 'Coleta não encontrada.' });

    coleta.status = 'confirmada'; 
    coleta.coletorId = coletorId;
    coleta.coletorNome = coletorNome;
    
    await coleta.save();

    res.json({ message: 'Coleta confirmada com sucesso! Agora ela está na sua lista de Pendentes.', coleta });
  } catch (err) {
    console.error('Erro ao aceitar coleta:', err);
    res.status(500).json({ error: 'Erro ao aceitar coleta.' });
  }
});


const denunciaSchema = new mongoose.Schema({
  titulo: String,
  descricao: String,
  local: String,
  dataOcorrencia: Date,
  usuarioId: String,
  usuarioNome: String,
  dataCriacao: { type: Date, default: Date.now }
});
const Denuncia = mongoose.model('Denuncia', denunciaSchema);

app.post('/api/denuncias', async (req, res) => {
  try {
    const denuncia = new Denuncia(req.body);
    await denuncia.save();
    res.json({ mensagem: 'Denúncia registrada com sucesso!', denuncia });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao registrar denúncia: ' + err.message });
  }
});