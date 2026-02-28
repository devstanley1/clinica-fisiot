const jwt = require('jsonwebtoken');
const SECRET = 'FISIOVIDA_SECRET_KEY_PROD';

function authMiddleware(req, res, next) {
    const token = req.headers['authorization'];
    if (!token) return res.status(401).json({ error: 'Acesso negado. Token não fornecido.' });

    try {
        const decoded = jwt.verify(token.replace('Bearer ', ''), SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(403).json({ error: 'Token inválido ou expirado.' });
    }
}

// Verifica se o usuário tem a permissão (Role) exigida
function roleMiddleware(requiredRoles) {
    return (req, res, next) => {
        if (!req.user || !requiredRoles.includes(req.user.role)) {
            return res.status(403).json({ error: 'Acesso Negado: Você não tem permissão para esta ação.' });
        }
        next();
    };
}

module.exports = { authMiddleware, roleMiddleware, SECRET };
