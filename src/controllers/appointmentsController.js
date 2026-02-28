const { getDB } = require('../db/database');

// Cliente vê seu próprio histórico
async function getMyAppointments(req, res) {
    try {
        const db = await getDB();
        const { rows } = await db.query('SELECT * FROM Appointments WHERE "clientId" = $1', [req.user.id]);
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao buscar histórico." });
    }
}

// Admin / Recepção veem todos
async function getAllAppointments(req, res) {
    try {
        const db = await getDB();
        const { rows } = await db.query(
            'SELECT A.*, U.name as "clientName" FROM Appointments A JOIN Users U ON A."clientId" = U.id'
        );
        res.json(rows);
    } catch (error) {
        console.error(error);
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
        const { rows } = await db.query(
            'INSERT INTO Appointments ("clientId", service, date, time) VALUES ($1, $2, $3, $4) RETURNING id',
            [req.user.id, service, date, time]
        );

        res.status(201).json({ message: "Agendado com sucesso!", id: rows[0].id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Falha ao gravar agendamento." });
    }
}

// Desmarcar/Cancelar (Apenas o dono ou Admin)
async function deleteAppointment(req, res) {
    const { id } = req.params;
    try {
        const db = await getDB();

        const { rows } = await db.query("SELECT * FROM Appointments WHERE id = $1", [id]);
        const apt = rows[0];
        if (!apt) return res.status(404).json({ error: "Não localizado." });

        if (req.user.role !== 'admin' && apt.clientId !== req.user.id) {
            return res.status(403).json({ error: "Acesso Negado." });
        }

        await db.query("DELETE FROM Appointments WHERE id = $1", [id]);
        res.json({ message: "Consulta cancelada com sucesso." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Falha ao excluir." });
    }
}

module.exports = { getMyAppointments, getAllAppointments, createAppointment, deleteAppointment };
