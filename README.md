#  🛡 Wallet Guardian (Beta)

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

###  Frontend
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


### 2️⃣ Backend Setup

```bash
cd wallet-guard
npm install
npm run dev

```

### 3️⃣ Frontend Setup

```bash
cd wallet-guard-ui
npm install
npm run dev

```
---

## 🤝 Features

### ✅ Wallet Connection
- MetaMask integration

- Chain validation (BSC Testnet only)

- Read-only by default (no signatures unless testing approval)


### ✅ Whitelist Management

- Per-wallet spender whitelist

- Dynamic backend storage

- Add / remove trusted spender addresses

- Whitelist synced with:

   - Scanner
   - Approval listener
   - Test approval panel


### ✅Approval Scanner

- Scan existing ERC20 approvals

- Human-readable allowance formatting

- Token metadata resolution (symbol / decimals)

- Risk evaluation per spender:

   - SAFE
   - WARNING
   - HIGH RISK

### ✅ Real-time Approval Monitoring

- WebSocket-based backend → frontend push

- Live detection of:
   
   - New approvals
   - Unlimited approvals
   - Unknown spender approvals

- Red alert UI with visual emphasis

- Historical event list (session-based)

### ✅ Approval Test Panel (BSC Testnet)

- USDC (Testnet) only

- Select spender from:

   - Whitelist
   - Manual input

- Grant approval amounts:

   - 1 USDC (Low Risk)
   - 10 USDC (Medium Risk)
   - 10,000 USDC (High Risk)
   - Unlimited (Critical Risk)

- Designed for testing monitoring + alert pipeline

---

### ⚠️ Risk Engine (Current Logic)

Risk evaluation is based on:

   - Approval amount (finite vs unlimited)
   - Spender contract status
   - Whitelist membership
   - Heuristic thresholds

The engine is modular and extensible, allowing future rule injection.

---


### 📘 Usage Guide

## Step 1: Connect Wallet

- Open the frontend application

- Connect via **MetaMask/okx** ...

- Ensure the network is set to BSC Testnet

- The system automatically initializes:

  - Approval scanner
  - Whitelist state
  - Real-time listener

## Step 2: Manage Whitelist

- Whitelist defines **trusted spender contracts**.

- Navigate to the **Whitelist Panel**

- Add spender addresses you trust (DEXs, routers, protocols)

- Remove addresses at any time

- Whitelisted spenders:

   - Are marked as **SAFE**
   - Do not trigger high-risk alerts

## Step 3: Scan Existing Approvals (You must add the trusted address to the whitelist before scanning.)

- Open **Approval Scanner**

- The system fetches:

   - Current ERC20 allowances
   - Spender addresses
   - Allowance amounts

- Allowances are displayed in human-readable format

- Risk levels are assigned automatically:

   - 🟢 Low Risk (small allowance)

   - 🟠 Medium Risk

   - 🔴 High Risk / Unlimited

## Step 4: Real-time Approval Monitoring

Once connected, Wallet Guardian listens for:

- New approval events

- Allowance increases

- Unlimited approvals

- Unknown spender approvals

When a risky approval is detected:

- UI highlights the event immediately

- Risk level and spender are displayed

- User is alerted before funds are moved


## Step 5: Approval Test Panel (BSC Testnet Only)

Designed for testing and validation.

- Select a spender:

   - From whitelist

   - Or manual input

- Choose approval amount:

   - 1 USDC → Low Risk

   - 10 USDC → Medium Risk

   - 10,000 USDC → High Risk

   - Unlimited → Critical Risk

- Submit approval via MetaMask

- Observe:

   - Real-time detection

   - Risk classification

   - UI response

 ---

## 🛣 Roadmap

- 🔜 Phase 1

   - 🔄 One-click Revoke Approval
   - Historical approval snapshot per wallet
   - Risk-based approval sorting

- 🔜 Phase 2

   - 🌐 Multi-chain support
   - 🪙 Multi-token scanning

- 🔜 Phase 3

   📩 External notifications:

   - Email
   - Discord
   - Telegram

- Custom alert thresholds

- 🔜 Phase 4

- 🚨 Emergency response

  - Fast asset transfer
  - Batch revoke
  - Safe destination presets

---

## ⚠️ Disclaimer

Wallet Guardian does not:

   - Custody assets
   - Execute transactions without user consent
   - Guarantee protection from all exploits

- It is a risk awareness and response tool, not a silver bullet.


---

## 🤝 Contributing

This project is in active development.
Feedback, issues, and PRs are welcome.
