# 🚀 FlareVM Panel

**FlareVM Panel** is a modern, premium VPS Management Panel built for speed, aesthetics, and ease of use. It leverages the power of **LXC/LXD** to provide lightweight, high-performance virtualization with a stunning user experience.

![FlareVM Banner](https://img.shields.io/badge/FlareVM-Panel-blue?style=for-the-badge&logo=react)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

---

## ✨ Key Features

- 💎 **Premium Dark UI**: Glassmorphism, smooth animations (Framer Motion), and a custom HSL design system.
- ⚡ **Lightweight Power**: Powered by LXC/LXD for near-native performance and sub-second boot times.
- 📊 **Real-time Monitoring**: Live CPU, RAM, and Network stats via WebSockets (Socket.io).
- 🛡️ **Advanced Security**: JWT-based authentication, admin-only routes, and secure role-based access.
- 🛠️ **Full Management Area**:
    - **Client Dashboard**: Start, stop, and restart VPS instances.
    - **Admin Suite**: Create VPS, manage nodes, and control user roles.
    - **Web Console**: Interactive terminal for container management.
- 📜 **Auto-Installer**: A dedicated script to set up the entire environment on Ubuntu/Debian in one click.

---

## 🛠️ Technology Stack

| Frontend | Backend | Virtualization |
| :--- | :--- | :--- |
| React 18 (TS) | Node.js (Express) | LXC |
| Vite | Prisma (ORM) | LXD |
| Tailwind CSS | Socket.io | tmate (Console) |
| Framer Motion | SQLite / PostgreSQL | — |

---

## 🚀 Quick Start (Linux)

To install the panel on a fresh Ubuntu server, simply run:

```bash
chmod +x installer.sh
sudo ./installer.sh
```

### Manual Installation

#### 1. Requirements
- Node.js 20+
- LXD (`sudo snap install lxd`)
- Git

#### 2. Backend Setup
```bash
cd server
npm install
cp .env.example .env
npx prisma db push
npm start
```

#### 3. Frontend Setup
```bash
cd client
npm install
npm run build
npm run dev
```

---

## 🔑 Default Credentials
- **Email**: `admin@flarevm.com`
- **Password**: `admin123`

---

## 🤝 Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License
This project is licensed under the MIT License.

---

Created with ❤️ by the FlareVM Team.
