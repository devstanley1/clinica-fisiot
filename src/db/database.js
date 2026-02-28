const { Pool } = require('pg');
const bcrypt = require('bcrypt');
require('dotenv').config();

// Conexão Segura com a Instância Nuvem do Postgres
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

async function getDB() {
    return pool;
}

// Criação de Tabelas base (Modelagem de Dados Inicial) e Seed do Admin Supremo em PGSQL Nativo
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

        // Inserir Administrador Supremo Padrão se não existir (Para o usuário conseguir Entrar)
        const { rows } = await pool.query("SELECT id FROM Users WHERE email = $1", ['admin@fisiovida.com']);
        if (rows.length === 0) {
            const hash = await bcrypt.hash('admin123', 10);
            await pool.query("INSERT INTO Users (name, email, password, role) VALUES ($1, $2, $3, $4)",
                ['Administrador Supremo', 'admin@fisiovida.com', hash, 'admin']);
            console.log("Usuário Admin Padrão criado com sucesso!");
        }
    } catch (error) {
        console.error("Falha ao inicializar o banco de dados Nuvem (Postgres): ", error);
    }
}

module.exports = { getDB, initDB, pool };
