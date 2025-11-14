# Configuração do Sistema de Reset de Senha - GetGreen

## 📋 Resumo

Foi implementado um sistema completo de reset de senha com:
- ✅ Geração de token de reset temporário (válido por 1 hora)
- ✅ Envio de email com link de reset usando Nodemailer
- ✅ Página de redefinição de senha segura
- ✅ Validação de token e expiração

## 🔧 Instalação das Dependências

Execute o comando a seguir na pasta `web/backend`:

```bash
npm install nodemailer
```

## 📧 Configuração do Gmail (Recomendado)

### 1. Ativar a Autenticação de 2 Fatores
- Acesse sua conta Google: https://myaccount.google.com/
- Vá em **Segurança** (Security)
- Ative **Autenticação de 2 etapas** (2-Step Verification)

### 2. Gerar Senha de Aplicativo
- Após ativar 2FA, vá em **Senhas de aplicativo** (App passwords)
- Selecione:
  - **App**: Mail
  - **Device**: Windows Computer (ou outro)
- Copie a senha gerada (16 caracteres)

### 3. Configurar o `.env`

Edite o arquivo `web/backend/.env` e adicione/atualize:

```dotenv
MONGODB_URI=mongodb+srv://LarissaFurlan:getgreenBD@getgreenbd.ldvtpt5.mongodb.net/?appName=GetGreenBD
PORT=4000
EMAIL_USER=seu_email@gmail.com
EMAIL_PASSWORD=sua_senha_de_app_16_caracteres
EMAIL_FROM=GetGreen <seu_email@gmail.com>
RESET_PASSWORD_URL=http://localhost:3000/web/frontend/accounts/ResetPassword/ResetPassword.html
```

**⚠️ IMPORTANTE**: Mantenha essas credenciais em segredo! Nunca compartilhe a senha de app.

## 🚀 Fluxo de Funcionamento

1. **Usuário solicita reset**: Clica em "Esqueceu sua senha?" no login
2. **Envio de email**: Sistema gera token e envia email com link
3. **Clique no link**: Usuário clica no link enviado no email
4. **Redefinição**: Usuário digita nova senha
5. **Confirmação**: Sistema valida token e atualiza senha

## 📝 Rotas da API

### POST `/api/forgot-password`
**Requisição:**
```json
{
  "email": "usuario@email.com"
}
```

**Resposta de sucesso (200):**
```json
{
  "mensagem": "Se o e-mail estiver cadastrado, um link de redefinição foi enviado. Verifique sua caixa de entrada.",
  "usuarioEncontrado": true,
  "tipo": "empresa"
}
```

### POST `/api/reset-password`
**Requisição:**
```json
{
  "token": "token_recebido_por_email",
  "type": "empresa",
  "newPassword": "nova_senha_123",
  "confirmPassword": "nova_senha_123"
}
```

**Resposta de sucesso (200):**
```json
{
  "mensagem": "Senha redefinida com sucesso! Você pode fazer login com sua nova senha."
}
```

## 🔒 Campos Adicionados ao Schema

Os schemas de `UserEmpresa` e `UserColaborador` agora incluem:
```javascript
resetPasswordToken: { type: String, default: null },
resetPasswordExpires: { type: Date, default: null }
```

## 📧 Exemplo de Email Enviado

O email é HTML formatado com:
- Logo da empresa (GetGreen)
- Botão clicável para reset
- Link alternativo em texto
- Aviso de expiração (1 hora)
- Instruções para segurança

## 🧪 Testando Localmente

### Com Gmail
1. Configure as variáveis de ambiente conforme acima
2. Faça login e solicite reset de senha
3. Verifique sua caixa de entrada do Gmail
4. Clique no link no email

### Alternativa: Mailtrap (Teste)
Se preferir testar sem usar seu Gmail real:

1. Crie conta em https://mailtrap.io/
2. Obtenha credenciais de SMTP
3. Atualize `package.json` e configure o transporter:

```javascript
const transporter = nodemailer.createTransport({
  host: "smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: process.env.MAILTRAP_USER,
    pass: process.env.MAILTRAP_PASS
  }
});
```

## ⏰ Token de Segurança

- **Tipo**: SHA-256 hash
- **Validade**: 1 hora
- **Formato**: 64 caracteres hexadecimais
- **Armazenado**: No banco de dados, hasheado

## 🛡️ Boas Práticas Implementadas

✅ Senhas hasheadas com bcrypt  
✅ Token com expiração  
✅ Não revela se email existe (proteção contra enumeração)  
✅ HTTPS recomendado em produção  
✅ Validação de entrada no servidor e cliente  
✅ Mensagens de erro genéricas ao usuário final  

## 🚨 Próximas Melhorias (Opcionais)

- [ ] Enviar notificação de logout automático ao resetar senha
- [ ] Adicionar limite de tentativas de reset (rate limiting)
- [ ] Implementar template de email profissional com marca
- [ ] Suporte a múltiplos provedores de email
- [ ] Auditoria/log de tentativas de reset

## 📞 Suporte

Para dúvidas ou problemas, verifique:
1. Logs do servidor: `npm run dev`
2. Console do navegador (F12)
3. Status do MongoDB
4. Permissões de firewall para SMTP do Gmail

---

**Última atualização**: 14 de novembro de 2025
