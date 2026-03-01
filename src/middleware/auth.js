const jwt = require('jsonwebtoken');

const SECRET = process.env.SECRET || 'SUPREMA_CHAVE_SECRET_123';

function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ error: "Token não fornecido." });
    }

    const [, token] = authHeader.split(' ');

    try {
        const decoded = jwt.verify(token, SECRET);
        req.user = decoded; // Injexão de dados do Payload (id, email, role)
        return next();
    } catch (err) {
        return res.status(401).json({ error: "Token inválido ou expirado." });
    }
}

function roleMiddleware(rolesAllowList) {
    return (req, res, next) => {
        if (!req.user || !rolesAllowList.includes(req.user.role)) {
            return res.status(403).json({ error: "Acesso Restrito ao seu Perfil." });
        }
        return next();
    };
}

module.exports = { authMiddleware, roleMiddleware, SECRET };
