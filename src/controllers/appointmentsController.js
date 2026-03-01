const { pool } = require('../db/database');

async function getMyAppointments(req, res) {
    try {
        const result = await pool.query('SELECT * FROM Appointments WHERE "clientId" = $1 ORDER BY id DESC', [req.user.id]);
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao buscar histórico." });
    }
}

async function getAllAppointments(req, res) {
    try {
        const result = await pool.query(
            'SELECT A.*, U.name as "clientName" FROM Appointments A JOIN Users U ON A."clientId" = U.id ORDER BY A.id DESC'
        );

        const formattedList = result.rows.map(apt => ({
            ...apt,
            clientName: apt.clientName || 'Deletado'
        }));

        res.json(formattedList);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao varrer o Banco Agenda Master." });
    }
}

async function createAppointment(req, res) {
    const { service, date, time } = req.body;

    if (!service || !date || !time) return res.status(400).json({ error: "Preenchimento de Servico, Data e Hora obrigatorios." });

    try {
        const result = await pool.query(
            'INSERT INTO Appointments ("clientId", service, date, time) VALUES ($1, $2, $3, $4) RETURNING id',
            [req.user.id, service, date, time]
        );
        res.status(201).json({ message: "Agendado via Banco!", id: result.rows[0].id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Falha na Gravação da Agenda." });
    }
}

async function deleteAppointment(req, res) {
    const { id } = req.params;
    try {
        const aptResult = await pool.query("SELECT * FROM Appointments WHERE id = $1", [id]);
        const apt = aptResult.rows[0];

        if (!apt) return res.status(404).json({ error: "Não Encontrado." });

        if (req.user.role !== 'admin' && req.user.role !== 'fisioterapeuta' && apt.clientId !== req.user.id) {
            return res.status(403).json({ error: "Negado. Isso não é o seu agendamento." });
        }

        await pool.query("DELETE FROM Appointments WHERE id = $1", [id]);
        res.json({ message: "Cancelamento Confirmado." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Falha Severa de Exclusão." });
    }
}

module.exports = { getMyAppointments, getAllAppointments, createAppointment, deleteAppointment };
