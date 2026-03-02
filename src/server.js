const express = require('express');
const path = require('path');
const helmet = require('helmet');
const cors = require('cors');

const { initDB } = require('./db/database');

// Importação das Rotas que criamos
const authRoutes = require('./routes/auth');
const appointmentsRoutes = require('./routes/appointments');

const app = express();
const PORT = process.env.PORT || 3000;

// Segurança Básica
app.use(helmet({
  contentSecurityPolicy: false // Desabilitado no ambiente estático para não bloquear scripts locais sem CDN
}));
app.use(cors());
app.use(express.json());

// Servindo Frontend da pasta dedicada public
const publicDir = path.join(__dirname, '../public');
app.use(express.static(publicDir));

// Forçar Arquivo de Login ser a Homepage (Raiz)
app.get('/', (req, res) => {
  res.redirect('/login.html');
});

// Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/appointments', appointmentsRoutes);

// Inicialização do Banco de Dados e em seguida Subir o Servidor
initDB().then(() => {
  // Em ambientes Serverless (Vercel), nós apenas exportamos o App.
  if (process.env.VERCEL !== '1') {
    app.listen(PORT, () => {
      console.log(`[+] Servidor da FisioVida operando em http://localhost:${PORT}`);
      console.log(`[+] Banco de Dados SQLite (FISIO.DB) Conectado`);
    });
  }
}).catch(err => {
  console.error("Erro fatal ao iniciar Banco SQLite: ", err);
});

// Essencial para o Vercel identificar isso como uma Função Serverless HTTP
module.exports = app;
