# 🛡️ DeFiSeek

**Your AI Copilot for Safer Web3.**

DeFiSeek is an AI-powered dApp that transforms real-time blockchain data into actionable safety insights for everyday users. Designed for the decentralized world of DeFi and NFTs, DeFiSeek helps traders, collectors, and researchers verify **wallet risks**, **NFT authenticity**, and **token legitimacy** through a chat-first interface.

---

## 🚀 Key Features

- ✅ **Wallet Risk Scanner** — instantly assess if a wallet is linked to scams, hacks, or rug pulls.  
- ✅ **NFT Authenticity Check** — validate if NFTs are genuine, flagged, or part of copy-mint schemes.  
- ✅ **Token Intelligence** — detect suspicious contracts, honeypots, and poorly verified tokens.  
- ✅ **Smart AI Chat** — ask questions and get intelligent answers from on-chain + off-chain sources.  
- ✅ **Modular AI Agent Architecture** — agents specialized in scraping, verifying, and ranking safety data.

> 🔐 Powered by [**bitsCrunch APIs**](https://bitscrunch.com) and a multi-model AI engine.

---

## 🧠 How It Works

1. **Input Wallet / Token / NFT**  
2. **DeFiSeek Agents Fetch and Verify**  
3. **AI Chat Summarizes and Explains Findings**  
4. **You Take Informed Action**

---

## 📡 bitsCrunch API Integration

DeFiSeek integrates bitsCrunch APIs to power real-time safety and market insights.

🧠 Agents like `walletScoreAgent`, `nftSafetyAgent`, and `nftMarketAnalyticsAgent` rely on various bitsCrunch endpoints to provide accurate data.

📄 **View full list of integrated endpoints and usage:** [docs/BITSCRUNCH_ENDPOINTS.md →](./docs/BITSCRUNCH_ENDPOINTS.md)

---

## 🧩 Ongoing Development

We are actively building and adding more AI agents (“ag-gens”) to deepen DeFiSeek’s market analysis capabilities, including:

- Enhanced trend detection for NFT and token markets  
- Advanced wallet behavioral analytics  
- Cross-chain risk aggregation  
- Real-time scam pattern recognition  

Our modular agent architecture ensures fast iteration and integration of new data sources for richer insights.

---

## 🏗️ Tech Stack

- **Frontend**: Next.js + TailwindCSS + Shadcn UI  
- **Backend**: TypeScript, Neon Postgres (via Drizzle ORM)  
- **AI Layer**: Custom LLM Routing + JuliaOS-style Agent Swarms  
- **APIs**: bitsCrunch API for wallet + NFT safety insights

---

## 📦 Getting Started

```bash
git clone https://github.com/yourusername/defiseek.git
cd defiseek
pnpm install
cp .env.example .env.local   # Add your bitsCrunch and DB keys
pnpm dev
