const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-12345';

router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Basic Check
        if (!name || !email || !password) return res.status(400).json({ error: "Missing fields" });

        // Check user
        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) return res.status(400).json({ error: "Email already in use" });

        // Hash
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create
        // First user auto-admin? Maybe later. Default CLIENT.
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: 'CLIENT'
            }
        });

        // Token
        const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

        res.status(201).json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return res.status(401).json({ error: "Invalid credentials" });

        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(401).json({ error: "Invalid credentials" });

        const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
        res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

const authenticate = require('../middleware/auth');

router.get('/me', authenticate, async (req, res) => {
    try {
        const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
        if (!user) return res.status(404).json({ error: "User not found" });

        res.json({ id: user.id, name: user.name, email: user.email, role: user.role, avatar: user.avatar });
    } catch (e) {
        res.status(500).json({ error: "Internal Server Error" });
    }
});

router.patch('/profile', authenticate, async (req, res) => {
    try {
        const { name, email } = req.body;
        const updated = await prisma.user.update({
            where: { id: req.user.userId },
            data: { name, email }
        });
        res.json({ id: updated.id, name: updated.name, email: updated.email, role: updated.role });
    } catch (e) {
        res.status(400).json({ error: "Could not update profile" });
    }
});

router.patch('/password', authenticate, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await prisma.user.findUnique({ where: { id: req.user.userId } });

        const match = await bcrypt.compare(currentPassword, user.password);
        if (!match) return res.status(400).json({ error: "Incorrect current password" });

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await prisma.user.update({
            where: { id: req.user.userId },
            data: { password: hashedPassword }
        });
        res.json({ message: "Password updated successfully" });
    } catch (e) {
        res.status(500).json({ error: "Internal Server Error" });
    }
});

module.exports = router;
