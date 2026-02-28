const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const path = require('path');
const bcrypt = require('bcrypt');

// Se estiver rodando no Vercel (serveless), gravar em /tmp, caso contrário, pasta local
const isVercel = process.env.VERCEL === '1';
const dbPath = isVercel ? '/tmp/fisio.db' : path.resolve(__dirname, 'fisio.db');

async function getDB() {
    return open({
        filename: dbPath,
        driver: sqlite3.Database
    });
}

// Criação de Tabelas base (Modelagem de Dados Inicial) e Seed do Admin Supremo
async function initDB() {
    const db = await getDB();

    await db.exec(`
        CREATE TABLE IF NOT EXISTS Users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT NOT NULL DEFAULT 'cliente',
            cpf TEXT UNIQUE
        );

        CREATE TABLE IF NOT EXISTS Appointments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            clientId INTEGER,
            professionalId INTEGER,
            service TEXT NOT NULL,
            date TEXT NOT NULL,
            time TEXT NOT NULL,
            status TEXT DEFAULT 'agendado',
            FOREIGN KEY(clientId) REFERENCES Users(id),
            FOREIGN KEY(professionalId) REFERENCES Users(id)
        );
    `);

    // Inserir Administrador Supremo Padrão se não existir (Para o usuário conseguir Entrar)
    const adminExists = await db.get("SELECT id FROM Users WHERE email = ?", ['admin@fisiovida.com']);
    if (!adminExists) {
        const hash = await bcrypt.hash('admin123', 10);
        await db.run("INSERT INTO Users (name, email, password, role) VALUES (?, ?, ?, ?)",
            ['Administrador Supremo', 'admin@fisiovida.com', hash, 'admin']);
        console.log("Usuário Admin Padrão criado com sucesso!");
    }
}

module.exports = { getDB, initDB };
