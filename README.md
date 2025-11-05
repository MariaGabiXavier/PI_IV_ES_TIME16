# PI_IV_ES_TIME16
# 🌱 GetGreen

**GetGreen** é uma plataforma digital que conecta **empresas geradoras de resíduos recicláveis** a **coletores parceiros**, promovendo uma gestão mais eficiente, rastreável e sustentável do descarte de materiais.  
O projeto foi desenvolvido como parte do componente curricular **Ideação e Validação em Engenharia de Software** da **PUC-Campinas**.

---

## 📘 Índice
- [Introdução](#-introdução)
- [Problema](#️-problema)
- [Objetivo](#-objetivo)
- [Funcionalidades Principais](#️-funcionalidades-principais)
- [Tecnologias Utilizadas](#-tecnologias-utilizadas)
- [Servidor Java](#️-servidor-java)
- [Banco de Dados MongoDB](#-banco-de-dados-mongodb)
- [Como Executar](#-como-executar)
- [Equipe de Desenvolvimento](#-equipe-de-desenvolvimento)
- [Instituição](#-instituição)

---

## 💡 Introdução

O descarte incorreto de resíduos recicláveis é um problema crescente no Brasil.  
Empresas de setores como **alimentação e varejo** produzem diariamente grandes volumes de materiais recicláveis, mas enfrentam dificuldades em gerenciar a coleta de forma eficiente e rastreável.

A **GetGreen** nasce para resolver esse problema, oferecendo uma **solução digital integrada** que conecta geradores e coletores, simplificando o agendamento, a rastreabilidade e a comprovação de práticas sustentáveis.

> 🎨 Veja o protótipo visual do projeto no Figma:  
> [Acessar Protótipo no Figma]([https://www.figma.com/...](https://www.figma.com/design/gXrNrKIqBOYofP25wlPVWa/Untitled?node-id=0-1&p=f&t=5XDmwd6F4YTJ4E5G-0))

---

## ♻️ Problema

- 41,5% do lixo gerado no Brasil em 2023 foi descartado de forma inadequada.  
- 31,9% dos municípios ainda utilizam lixões como destino final.  
- Empresas têm dificuldades para comprovar ações ESG e manter a imagem sustentável.

**Causa raiz:** falta de plataformas tecnológicas que integrem empresas e coletores de forma segura, rastreável e eficiente.

---

## 🎯 Objetivo

Facilitar o **descarte adequado de resíduos recicláveis** por meio de uma plataforma web,  
reduzindo a burocracia e **conectando empresas a coletores parceiros**, garantindo segurança, praticidade e rastreabilidade.

### Objetivos específicos:
1. Promover o descarte correto de resíduos recicláveis.
2. Reduzir a informalidade no setor de reciclagem.
3. Conectar empresas e coletores de maneira confiável.
4. Ampliar as oportunidades de renda para catadores.

---

## ⚙️ Funcionalidades Principais

✅ **Cadastro de empresas parceiras** – com aprovação administrativa.  
✅ **Cadastro de coletores parceiros** – registro de dados e disponibilidade.  
✅ **Solicitação de coletas** – empresas descrevem tipo e quantidade de resíduos.  
✅ **Pesquisa de solicitações** – coletores encontram coletas próximas.  
✅ **Agendamento de coletas** – negociação colaborativa entre coletor e empresa.  

---

## 💻 Tecnologias Utilizadas

| Camada | Tecnologia |
|---------|-------------|
| Frontend | HTML, CSS, JavaScript, TypeScript |
| Backend | Java |
| Banco de Dados | Mongo DB |
| Design | Figma |
| Gestão | GIT Project |

---
##  🖥️ Servidor Java

O Servidor Java foi implementado conforme orientações do professor André Carvalho.
Optamos por implementar o modelo de servidor java demonstrado nas aulas de Paradigmas e Programação Orientada a Objetos.
O processo de negócio do MVP escolhido para ser implementado no servidor é o chatbot de Suporte e Dúvidas dos usuários.

**Rotas do servidor**

1. Aceitar conexões - o servidor deve constantemente aceitar conexões de clientes. Conferir se os parâmetros fornecidos pelos clientes estão de acordo com o requisitos necessários para estabelecer uma conexão entre ambos.
2. Supervisionar conexões - o servidor deve instanciar uma supervisora de conexão para cada cliente conectado, garantindo o monitoramento dos eventos que ocorrem em cada conexão.
  
3. Receber pedidos -  o servidor deve receber pedidos dos clientes e identificar o que deve ser feito.

4. Retornar resposta - o servidor deve retornar uma resposta ao cliente de acordo com a sua solicitação.
  
5. Encerrar conexão - o servidor em caso de desativamento deve avisar todos os clientes conectados sobre o seu desligamento.
---
##  🍃 Banco de Dados MongoDB

O MongoDB será o único banco de dados utilizado no projeto.
O banco de dados MongoDB será o único banco de dados utilizado no projeto
integrados. Ele será organizado em três coleções:

● Coletores: armazenará os dados dos coletores parceiros. Cada documento
terá os seguintes campos: nome, cpf, email, senha e endereço (Uf, cidade,
cep, bairro, logradouro e número).

● Empresas: armazenará os dados das empresas parceiras. Cada documento
terá os seguintes campos: cnpj, razão social,segmento, email, senha,
endereço (Uf, cidade, cep, bairro, logradouro e numero) e status (se a
empresa está aguardando aprovação da parceria ou se já é parceira).

● Coletas: armazenará os dados das coletas. Cada documento terá os
seguintes campos: nome do funcionários responsável pela coleta, os
materiais a serem coletados, a quantidade de material, e a unidade de
medida da quantidade (g, Kg), data da solicitação, data preferencial para
realizar a coleta, descrição da coleta, e observações se houver necessidade.

---

## 🚀 Como Executar

### 🖥️ Rodando o Servidor

#### 🧩 1° Terminal
1. **Entre na pasta do backend:**
   ```bash
   cd PI_IV_ES_TIME16\web\backend\adapter
2. **Instale as dependências e inicie o servidor Node.js:**
   ```bash
   npm install
   npm start
#### 🧩 2° Terminal  
1. **Entre na pasta do ChatBot:**
   ```bash
   cd PI_IV_ES_TIME16\chatBot
2. **Compile e execute o servidor Java::**
   ```bash
   javac servidor\*.java 
   java servidor.Servidor

### 🍃 Rodando o MongoDB

1. **Entre na pasta principal do backend:**
   ```bash
   cd PI_IV_ES_TIME16\web\backend
2. **Instale as dependências e inicie o servidor Node.js:**
   ```bash
   npm install
   npm run dev

---

## 👥 Equipe de Desenvolvimento

- **Anna Clara Olbi** 
- **Christian Lindoso Froz** 
- **Ester Teresa Amaral** 
- **Larissa Furlan Ferreira** 
- **Leonardo Vicente**
- **Maria Gabriella Xavier Puccinelli** 

---

## 🏫 Instituição

**Pontifícia Universidade Católica de Campinas (PUC-Campinas)**  
**Curso:** Engenharia de Software  
**Disciplina:** Projeto Integrador IV  
**Professora:** Dra. Renata Arantes  
**Ano:** 2025

