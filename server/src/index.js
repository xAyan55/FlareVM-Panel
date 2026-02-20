require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require('./routes/auth');
const vpsRoutes = require('./routes/vps');
const nodeRoutes = require('./routes/nodes');
const adminRoutes = require('./routes/admin');

app.use('/api/auth', authRoutes);
app.use('/api/vps', vpsRoutes);
app.use('/api/nodes', nodeRoutes);
app.use('/api/admin', adminRoutes);

// Health Check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
});

// Seed Admin
const seedAdmin = async () => {
    try {
        const count = await prisma.user.count();
        if (count === 0) {
            console.log("Seeding default admin...");
            const hashedPassword = await bcrypt.hash('admin123', 10);
            await prisma.user.create({
                data: {
                    name: 'Admin User',
                    email: 'admin@flarevm.com',
                    password: hashedPassword,
                    role: 'ADMIN'
                }
            });
            console.log("Default Admin Created: admin@flarevm.com / admin123");
        }
    } catch (e) {
        console.error("Seeding failed:", e);
    }
};

const http = require('http');
const { Server } = require('socket.io');

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Mock real-time stats
io.on('connection', (socket) => {
    console.log('Client connected for monitoring');

    const interval = setInterval(() => {
        // Emit random stats for demonstration
        socket.emit('stats', {
            cpu: (Math.random() * 30 + 5).toFixed(1),
            ram: (Math.random() * 40 + 20).toFixed(1),
            network: (Math.random() * 100 + 10).toFixed(0),
            disk: 15.4
        });
    }, 3000);

    socket.on('disconnect', () => {
        clearInterval(interval);
    });
});

// Background Task: Auto-suspend expired VPS
setInterval(async () => {
    try {
        const now = new Date();
        const expired = await prisma.vPS.findMany({
            where: {
                expiryDate: { lt: now },
                status: { not: 'suspended' }
            }
        });

        for (const vps of expired) {
            console.log(`Auto-suspending expired VPS: ${vps.id}`);
            await prisma.vPS.update({
                where: { id: vps.id },
                data: { status: 'suspended' }
            });
        }
    } catch (e) {
        console.error("Expired VPS check failed:", e);
    }
}, 300000); // Every 5 minutes

server.listen(PORT, async () => {
    await seedAdmin();
    console.log(`Server running on port ${PORT}`);
    console.log(`API URL: http://localhost:${PORT}`);
});
