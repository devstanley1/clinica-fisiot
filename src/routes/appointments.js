const express = require('express');
const router = express.Router();
const { authMiddleware, roleMiddleware } = require('../middleware/auth');
const { getMyAppointments, getAllAppointments, createAppointment, deleteAppointment } = require('../controllers/appointmentsController');

// Todas as rotas abaixo requerem estar Logado (JWT Header Obrigatório)
router.use(authMiddleware);

// Permissões Exclusivas "Cliente" e "Admin" (Apenas ver/criar os próprios agendamentos)
router.get('/my', getMyAppointments);
router.post('/', createAppointment);

// Permissões Exclusivas Administrativas (Mesa ou Especialistas que precisam ver/gerenciar a agenda completa do dia)
router.get('/all', roleMiddleware(['admin', 'fisioterapeuta']), getAllAppointments);
router.delete('/:id', roleMiddleware(['admin', 'fisioterapeuta', 'cliente']), deleteAppointment);

module.exports = router;
