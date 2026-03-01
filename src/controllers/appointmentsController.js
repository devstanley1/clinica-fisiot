const { getDB } = require('../db/database');

async function getMyAppointments(req, res) {
    try {
        const db = await getDB();
        const appointments = await db.all("SELECT * FROM Appointments WHERE clientId = ?", [req.user.id]);
        res.json(appointments);
    } catch (error) {
        res.status(500).json({ error: "Erro ao buscar histórico." });
    }
}

async function getAllAppointments(req, res) {
    try {
        const db = await getDB();
        const appointments = await db.all(
            "SELECT A.*, U.name as clientName FROM Appointments A JOIN Users U ON A.clientId = U.id"
        );
        res.json(appointments);
    } catch (error) {
        res.status(500).json({ error: "Erro ao varrer o Banco Agenda Master." });
    }
}

async function createAppointment(req, res) {
    const { service, date, time } = req.body;

    if (!service || !date || !time) return res.status(400).json({ error: "Preenchimento de Servico, Data e Hora obrigatorios." });

    try {
        const db = await getDB();
        const result = await db.run(
            "INSERT INTO Appointments (clientId, service, date, time) VALUES (?, ?, ?, ?)",
            [req.user.id, service, date, time]
        );
        res.status(201).json({ message: "Agendado via Banco!", id: result.lastID });
    } catch (error) {
        res.status(500).json({ error: "Falha na Gravação da Agenda." });
    }
}

async function deleteAppointment(req, res) {
    const { id } = req.params;
    try {
        const db = await getDB();

        const apt = await db.get("SELECT * FROM Appointments WHERE id = ?", [id]);
        if (!apt) return res.status(404).json({ error: "Não Encontrado." });

        if (req.user.role !== 'admin' && req.user.role !== 'fisioterapeuta' && apt.clientId !== req.user.id) {
            return res.status(403).json({ error: "Negado. Isso não é o seu agendamento." });
        }

        await db.run("DELETE FROM Appointments WHERE id = ?", [id]);
        res.json({ message: "Cancelamento Confirmado." });
    } catch (error) {
        res.status(500).json({ error: "Falha Severa de Exclusão." });
    }
}

module.exports = { getMyAppointments, getAllAppointments, createAppointment, deleteAppointment };
