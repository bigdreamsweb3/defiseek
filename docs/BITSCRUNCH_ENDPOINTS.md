## 📡 bitsCrunch API Endpoints Integrated and Usage in DeFiSeek

DeFiSeek utilizes the following bitsCrunch API endpoints for real-time blockchain intelligence, grouped by domain.

---

### 🔐 Wallet Intelligence

| Endpoint Path                         | Purpose                                      | Used By Agent(s)     |
|--------------------------------------|----------------------------------------------|----------------------|
| `/api/v2/wallet/score`               | Wallet risk score and classification         | `walletScoreAgent`   |

---

### 🖼 NFT Intelligence

| Endpoint Path                                              | Purpose                                               | Used By Agent(s)       |
|-----------------------------------------------------------|-------------------------------------------------------|------------------------|
| `/api/v2/nft/market-insights/analytics`                   | NFT market analytics and trend data                   | `nftMarketAnalyticsAgent` |
| `/api/v2/nft/collection/metadata/:contract`               | Fetch metadata for a specific NFT collection          | `nftSafetyAgent`       |
| `/api/v2/nft/collection/metrics/:contract`                | Get safety metrics (e.g., wash trades, volume, holders) | `nftSafetyAgent`     |
| `/api/v2/nft/collection/trend/:contract`                  | Analyze trend changes (floor price, sales trend)      | `nftSafetyAgent`       |

---

### 🌐 Blockchain Info

| Endpoint Path                        | Purpose                                  | Used By Agent(s)       |
|-------------------------------------|------------------------------------------|------------------------|
| `/api/v2/blockchains`               | List supported blockchain networks       | `supportedChainsAgent` |

> ⚡ **Note:** This list evolves as new agents and tools are integrated into DeFiSeek’s AI copilot system.

---
