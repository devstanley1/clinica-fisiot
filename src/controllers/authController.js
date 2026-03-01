const { getDB } = require('../db/database');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { SECRET } = require('../middleware/auth');

async function register(req, res) {
    const { name, email, password, cpf } = req.body;

    if (!name || !email || !password || !cpf) {
        return res.status(400).json({ error: "Nome, Email, Senha e CPF são obrigatórios!" });
    }

    try {
        const db = await getDB();
        const userExists = await db.get("SELECT id FROM Users WHERE email = ? OR cpf = ?", [email, cpf]);
        if (userExists) {
            return res.status(400).json({ error: "E-mail ou CPF já cadastrados." });
        }

        const hash = await bcrypt.hash(password, 10);
        const result = await db.run(
            "INSERT INTO Users (name, email, password, cpf, role) VALUES (?, ?, ?, ?, ?)",
            [name, email, hash, cpf, 'cliente']
        );

        res.status(201).json({ message: "Cadastro finalizado!!", userId: result.lastID });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Falha Interna ao Registrar." });
    }
}

async function login(req, res) {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "Preencha suas Informações completas" });
    }

    try {
        const db = await getDB();
        const user = await db.get("SELECT * FROM Users WHERE email = ?", [email]);

        if (!user) return res.status(401).json({ error: "E-mail não Cadasrado." });

        const passMatch = await bcrypt.compare(password, user.password);
        if (!passMatch) return res.status(401).json({ error: "Senha Incompatível." });

        const token = jwt.sign(
            { id: user.id, name: user.name, role: user.role, email: user.email },
            SECRET,
            { expiresIn: '8h' }
        );

        res.json({ token, role: user.role, name: user.name });
    } catch (error) {
        res.status(500).json({ error: "Sistema temporariamente fora." });
    }
}

module.exports = { register, login };
