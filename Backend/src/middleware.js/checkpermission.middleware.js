// Example of how the middleware looks logically
const { User, Role, Permission } = require('../models');

function checkPermission(requiredPermission) {
    return async (req, res, next) => {
        try {
            // 1. Logged-in user ki detail nikalo DB se uski Role aur us Role ki Permissions ke sath
            const user = await User.findByPk(req.user.id, {
                include: {
                    model: Role,
                    include: [Permission] // Yeh RolePermission pivot table ke through kaam karega
                }
            });

            // 2. Agar user nahi mila
            if (!user || !user.Role) {
                return res.status(403).json({ message: "Access Denied: Role not found" });
            }

            // 3. ADMIN OVERRIDE (Aapka point)
            // Kyunki Admin ko saari permissions by default (seeder se) hain, hum seedha check laga sakte hain:
            if (user.Role.name.toLowerCase() === 'admin') {
                return next(); // Seedha aage jaane do
            }

            // 4. NORMAL EMPLOYEE CHECK
            // Agar Admin nahi hai, toh dekho kya iski assigned permissions ki list mein
            // requiredPermission (jaise 'mark_attendance') aati hai ya nahi
            const hasPermission = user.Role.Permissions.some(
                (perm) => perm.name === requiredPermission
            );

            if (hasPermission) {
                return next(); // Permission mil gayi, aage badho
            } else {
                return res.status(403).json({ message: "Aapko yeh action perform karne ki permission nahi hai" });
            }

        } catch (error) {
            console.log(error);
            res.status(500).json({ message: "Server Error in Permission Check" });
        }
    };
}

module.exports = { checkPermission };
