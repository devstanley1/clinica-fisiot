const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/register', authController.register);
router.post('/login', authController.login);

// Mock Simples apenas visual par API de resgate por conta que não configuraremos STMP Real hoje
router.post('/recover', (req, res) => {
    res.json({ message: "Se este email existir na base, enviamos um link para redefinir senha (Simulação)." });
});

module.exports = router;
