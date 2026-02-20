const express = require('express');
const router = express.Router();
const lxd = require('../lxdService');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// Get all VPS for user (or all for admin if filtered)
router.get('/', authMiddleware, async (req, res) => {
    try {
        const vpsList = await prisma.vPS.findMany({
            where: req.user.role === 'ADMIN' ? {} : { userId: req.user.userId },
            include: { node: true }
        });

        // Enrich with live status if possible (mock or real)
        const enriched = await Promise.all(vpsList.map(async (v) => {
            const info = await lxd.getInfo(v.name).catch(() => ({ state: { status: 'Unknown' } }));
            return { ...v, liveStatus: info.state?.status || 'Unknown', liveInfo: info };
        }));

        res.json(enriched);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Failed to fetch VPS list" });
    }
});

// User Actions: Start, Stop, Restart
router.post('/:id/action', authMiddleware, async (req, res) => {
    const { action } = req.body; // start, stop, restart
    const { id } = req.params;

    try {
        const vps = await prisma.vPS.findUnique({ where: { id } });
        if (!vps) return res.status(404).json({ error: "VPS not found" });

        if (req.user.role !== 'ADMIN' && vps.userId !== req.user.userId) {
            return res.status(403).json({ error: "Access denied" });
        }

        let result;
        switch (action) {
            case 'start':
                result = await lxd.startInstance(vps.name);
                break;
            case 'stop':
                result = await lxd.stopInstance(vps.name);
                break;
            case 'restart':
                result = await lxd.restartInstance(vps.name);
                break;
            default:
                return res.status(400).json({ error: "Invalid action" });
        }

        // Update status in DB
        // But status is fleeting. Let's just return success.
        // Or update DB to reflect last known state.

        res.json({ success: true, message: `VPS ${action}ed successfully`, details: result });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: `Failed to ${action} VPS` });
    }
});

// Create VPS (Admin Only for now, or user if implementing billing)
// Requirement: Admin Area -> VPS Management -> Create VPS
router.post('/', [authMiddleware, adminMiddleware], async (req, res) => {
    const { name, os, cpu, ram, disk, userId, nodeId } = req.body;

    try {
        // validate input
        if (!name || !os || !userId || !nodeId) return res.status(400).json({ error: "Missing required fields" });

        // Check if node exists
        const node = await prisma.node.findUnique({ where: { id: nodeId } });
        if (!node) return res.status(404).json({ error: "Node not found" });

        // 1. Create DB Entry
        const vps = await prisma.vPS.create({
            data: {
                name,
                os,
                cpu: parseInt(cpu) || 1,
                ram: parseInt(ram) || 512,
                disk: parseInt(disk) || 10,
                nodeId,
                userId,
                status: 'creating'
            }
        });

        // 2. Trigger LXD Creation (Simulated or Real)
        lxd.createInstance(name, os)
            .then(() => {
                // Update specific status or valid
                prisma.vPS.update({ where: { id: vps.id }, data: { status: 'stopped' } });
            })
            .catch(err => {
                console.error("LXD Creation Failed:", err);
                prisma.vPS.update({ where: { id: vps.id }, data: { status: 'error' } });
            });

        res.status(201).json(vps);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Failed to create VPS" });
    }
});

// Delete VPS
router.delete('/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;
    try {
        const vps = await prisma.vPS.findUnique({ where: { id } });
        if (!vps) return res.status(404).json({ error: "VPS not found" });

        // Permission check
        if (req.user.role !== 'ADMIN' && vps.userId !== req.user.userId) {
            return res.status(403).json({ error: "Access denied" });
        }

        // LXD Delete
        await lxd.deleteInstance(vps.name).catch(console.error);

        // DB Delete
        await prisma.vPS.delete({ where: { id } });

        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: "Failed to delete VPS" });
    }
});

module.exports = router;
