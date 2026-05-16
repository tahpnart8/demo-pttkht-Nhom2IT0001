const jwt = require('jsonwebtoken');

function authMiddleware(requiredRoles = []) {
    return (req, res, next) => {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Token không hợp lệ' });
        }
        const token = authHeader.split(' ')[1];
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded;
            if (requiredRoles.length > 0 && !requiredRoles.includes(decoded.role)) {
                return res.status(403).json({ error: 'Không đủ quyền truy cập' });
            }
            next();
        } catch (err) {
            return res.status(401).json({ error: 'Token hết hạn hoặc không hợp lệ' });
        }
    };
}

module.exports = authMiddleware;
