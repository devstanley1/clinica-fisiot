const express = require('express');
const router = express.Router();
const appointmentsController = require('../controllers/appointmentsController');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

// Todas as rotas daqui pra frente exigem Token Valido!
router.use(authMiddleware);

// Rota restrita (Apenas visualização privilegiada)
router.get('/all', roleMiddleware(['admin', 'recepcao', 'profissional']), appointmentsController.getAllAppointments);

// Rotas comuns (Clientes base)
router.get('/my', appointmentsController.getMyAppointments);
router.post('/', appointmentsController.createAppointment);
router.delete('/:id', appointmentsController.deleteAppointment);

module.exports = router;
