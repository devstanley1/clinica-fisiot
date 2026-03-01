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

// Criação de Tabelas base (Modelagem de Dados Inicial) e Seed de 3 Credenciais Iniciais
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

    // Inserção do Triplo Seed de Homologação (Admin, Fisio e Cliente de Teste)
    const checkUser = await db.get("SELECT id FROM Users WHERE email = ?", ['admin@fisiovida.com']);

    if (!checkUser) {
        const hashAdmin = await bcrypt.hash('admin123', 10);
        const hashFisio = await bcrypt.hash('fisio123', 10);
        const hashCliente = await bcrypt.hash('cliente123', 10);

        await db.run("INSERT INTO Users (name, email, password, role) VALUES (?, ?, ?, ?)",
            ['Super Administrador', 'admin@fisiovida.com', hashAdmin, 'admin']);

        await db.run("INSERT INTO Users (name, email, password, role) VALUES (?, ?, ?, ?)",
            ['Dr. Fisioterapeuta', 'fisio@fisiovida.com', hashFisio, 'fisioterapeuta']);

        await db.run("INSERT INTO Users (name, email, password, cpf, role) VALUES (?, ?, ?, ?, ?)",
            ['Cliente de Testes', 'cliente@fisiovida.com', hashCliente, '111.111.111-11', 'cliente']);

        console.log("3 Usuários de Homologação (Admin, Fisio e Cliente) criados com sucesso!");
    }
}

module.exports = { getDB, initDB };
