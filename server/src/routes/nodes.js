const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// List Nodes (Admin?)
// Maybe users need to see nodes? (Node: "New York", "London").
// Let's assume public/client readable too, but create/edit is admin.
router.get('/', authMiddleware, async (req, res) => {
    try {
        const nodes = await prisma.node.findMany();
        res.json(nodes);
    } catch (e) {
        res.status(500).json({ error: "Failed to fetch nodes" });
    }
});

// Add Node (Admin)
router.post('/', [authMiddleware, adminMiddleware], async (req, res) => {
    const { name, ip, ram, disk, cpu } = req.body;
    try {
        const node = await prisma.node.create({
            data: {
                name,
                ip,
                ram: parseInt(ram),
                disk: parseInt(disk),
                cpu: parseInt(cpu),
                status: 'active'
            }
        });
        res.status(201).json(node);
    } catch (e) {
        res.status(500).json({ error: "Failed to create node" });
    }
});

// Delete Node (Admin)
router.delete('/:id', [authMiddleware, adminMiddleware], async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.node.delete({ where: { id } });
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: "Failed to delete node" });
    }
});

module.exports = router;
