# 🛡 Wallet Guardian (Beta)

Wallet Guardian is a Web3 security monitoring tool focused on **ERC20 approval risk detection**.  
It helps users **visualize, whitelist, monitor, and react to token approvals** in real time, reducing the risk of malicious or accidental unlimited authorizations.

This project is currently in **Beta** and targets **BSC Testnet** for early testing and validation.

---

## ✨ Core Philosophy

> Most wallet exploits start with a single approval.

Wallet Guardian is designed to:
- Make approvals **visible**
- Make risks **understandable**
- Make responses **actionable**

---

## 🧱 Tech Stack

### Frontend
- **React + TypeScript**
- **Vite**
- **TailwindCSS**
- **ethers.js (BrowserProvider)**
- Wallet integration via **MetaMask**
- Real-time event consumption via **WebSocket**

### Backend
- **Node.js + TypeScript**
- **Express**
- **ethers.js (JsonRpcProvider / WebSocketProvider)**
- **WebSocket (ws)** for real-time push
- In-memory state management (`Map`) for per-owner whitelist
- Modular risk engine for approval evaluation

### Blockchain
- **BSC Testnet**
- ERC20 standard
- Approval event monitoring (`Approval(owner, spender, value)`)

---

## 🚀 Getting Started

### 1️⃣ Prerequisites
- Node.js >= 18
- MetaMask installed
- BSC Testnet RPC & test USDC

---

### 2️⃣ Backend Setup

```bash
cd backend
npm install
npm run dev
