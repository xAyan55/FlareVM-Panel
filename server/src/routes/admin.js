const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const authenticate = require('../middleware/auth');

// Middleware to ensure admin
const isAdmin = (req, res, next) => {
    if (req.user.role !== 'ADMIN') {
        return res.status(403).json({ error: "Access denied. Admin only." });
    }
    next();
};

router.use(authenticate);
router.use(isAdmin);

// Get all users
router.get('/users', async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
                _count: {
                    select: { vps: true }
                }
            }
        });
        res.json(users);
    } catch (e) {
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Update user role or delete
router.patch('/users/:id', async (req, res) => {
    try {
        const { role } = req.body;
        const updated = await prisma.user.update({
            where: { id: req.params.id },
            data: { role }
        });
        res.json(updated);
    } catch (e) {
        res.status(400).json({ error: "Could not update user" });
    }
});

router.delete('/users/:id', async (req, res) => {
    try {
        // Prevent self-deletion
        if (req.params.id === req.user.userId) {
            return res.status(400).json({ error: "Cannot delete yourself" });
        }
        await prisma.user.delete({ where: { id: req.params.id } });
        res.json({ message: "User deleted" });
    } catch (e) {
        res.status(400).json({ error: "Could not delete user" });
    }
});

module.exports = router;
