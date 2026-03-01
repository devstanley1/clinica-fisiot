const { Pool } = require('pg');
const bcrypt = require('bcrypt');
require('dotenv').config();

const isVercel = process.env.VERCEL === '1';

// Importante: No Vercel você precisa ter 'DATABASE_URL' definida nas configurações
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

// Criação de Tabelas base (Modelagem de Dados Inicial) e Seed de 3 Credenciais Iniciais
async function initDB() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS Users (
                id SERIAL PRIMARY KEY,
                name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                role TEXT NOT NULL DEFAULT 'cliente',
                cpf TEXT UNIQUE
            );

            CREATE TABLE IF NOT EXISTS Appointments (
                id SERIAL PRIMARY KEY,
                "clientId" INTEGER REFERENCES Users(id),
                "professionalId" INTEGER REFERENCES Users(id),
                service TEXT NOT NULL,
                date TEXT NOT NULL,
                time TEXT NOT NULL,
                status TEXT DEFAULT 'agendado'
            );
        `);

        // Inserção do Triplo Seed de Homologação (Admin, Fisio e Cliente de Teste)
        const checkAdmin = await pool.query("SELECT id FROM Users WHERE email = $1", ['admin@fisiovida.com']);
        if (checkAdmin.rows.length === 0) {
            const hashAdmin = await bcrypt.hash('admin123', 10);
            await pool.query("INSERT INTO Users (name, email, password, role) VALUES ($1, $2, $3, $4)",
                ['Super Administrador', 'admin@fisiovida.com', hashAdmin, 'admin']);
        }

        const checkFisio = await pool.query("SELECT id FROM Users WHERE email = $1", ['fisio@fisiovida.com']);
        if (checkFisio.rows.length === 0) {
            const hashFisio = await bcrypt.hash('fisio123', 10);
            await pool.query("INSERT INTO Users (name, email, password, role) VALUES ($1, $2, $3, $4)",
                ['Dr. Fisioterapeuta', 'fisio@fisiovida.com', hashFisio, 'fisioterapeuta']);
        }

        const checkCliente = await pool.query("SELECT id FROM Users WHERE email = $1", ['cliente@fisiovida.com']);
        if (checkCliente.rows.length === 0) {
            const hashCliente = await bcrypt.hash('cliente123', 10);
            await pool.query("INSERT INTO Users (name, email, password, cpf, role) VALUES ($1, $2, $3, $4, $5)",
                ['Cliente de Testes', 'cliente@fisiovida.com', hashCliente, '111.111.111-11', 'cliente']);
        }

        console.log("3 Usuários de Homologação (Admin, Fisio e Cliente) criados/verificados com sucesso no Postgres!");
    } catch (e) {
        console.error("Erro na Database do Postgres:", e);
    }
}

module.exports = { pool, initDB };
