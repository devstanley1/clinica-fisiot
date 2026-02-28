const { getDB } = require('../db/database');

// Cliente vê seu próprio histórico
async function getMyAppointments(req, res) {
    try {
        const db = await getDB();
        const appointments = await db.all("SELECT * FROM Appointments WHERE clientId = ?", [req.user.id]);
        res.json(appointments);
    } catch (error) {
        res.status(500).json({ error: "Erro ao buscar histórico." });
    }
}

// Admin / Recepção veem todos
async function getAllAppointments(req, res) {
    try {
        const db = await getDB();
        const appointments = await db.all(
            "SELECT A.*, U.name as clientName FROM Appointments A JOIN Users U ON A.clientId = U.id"
        );
        res.json(appointments);
    } catch (error) {
        res.status(500).json({ error: "Erro ao buscar histórico da clínica." });
    }
}

// Criar Agendamento Validado
async function createAppointment(req, res) {
    const { service, date, time } = req.body;

    // Regras de Validação Backend (Evitar lixo no banco)
    if (!service || !date || !time) {
        return res.status(400).json({ error: "Serviço, data e hora são obrigatórios." });
    }

    try {
        const db = await getDB();
        const result = await db.run(
            "INSERT INTO Appointments (clientId, service, date, time) VALUES (?, ?, ?, ?)",
            [req.user.id, service, date, time]
        );

        res.status(201).json({ message: "Agendado com sucesso!", id: result.lastID });
    } catch (error) {
        res.status(500).json({ error: "Falha ao gravar agendamento." });
    }
}

// Desmarcar/Cancelar (Apenas o dono ou Admin)
async function deleteAppointment(req, res) {
    const { id } = req.params;
    try {
        const db = await getDB();

        const apt = await db.get("SELECT * FROM Appointments WHERE id = ?", [id]);
        if (!apt) return res.status(404).json({ error: "Não localizado." });

        if (req.user.role !== 'admin' && apt.clientId !== req.user.id) {
            return res.status(403).json({ error: "Acesso Negado." });
        }

        await db.run("DELETE FROM Appointments WHERE id = ?", [id]);
        res.json({ message: "Consulta cancelada com sucesso." });
    } catch (error) {
        res.status(500).json({ error: "Falha ao excluir." });
    }
}

module.exports = { getMyAppointments, getAllAppointments, createAppointment, deleteAppointment };
