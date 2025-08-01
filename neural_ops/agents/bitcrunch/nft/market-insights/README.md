# NFT Market Analytics Agent

## Overview

The NFT Market Analytics Agent provides comprehensive market insights and trend data for NFT markets across different blockchains. It integrates with the UnleashNFTs bitsCrunch API to fetch aggregated metrics and performance indicators.

## Features

- **Multi-blockchain Support**: Fetch analytics for Ethereum, Polygon, and other supported chains
- **Flexible Time Ranges**: Support for various time periods (24h, 7d, 30d, etc.)
- **Comprehensive Metrics**: Volume, sales count, holders, price trends, and more
- **Trend Analysis**: Historical data points for market performance tracking
- **Error Handling**: Graceful error handling with structured responses

## API Response Structure

The agent returns structured data including:

- `block_dates`: Array of timestamps for data points
- `blockchain`: Target blockchain name
- `chain_id`: Numeric chain identifier
- `price_ceiling_trend`: Maximum price trends over time
- `price_floor_trend`: Minimum price trends over time
- `volume_trend`: Trading volume trends
- `sales_count_trend`: Number of sales over time
- `holders_trend`: Holder count changes
- `unique_buyers_trend`: Unique buyer metrics
- `unique_sellers_trend`: Unique seller metrics
- `avg_price_trend`: Average price movements
- `market_cap_trend`: Market capitalization changes

## Usage Examples

### Basic Usage

```typescript
import { nftMarketAnalyticsAgent } from '@/neural_ops/agents';

// Fetch analytics with default parameters (Ethereum, 24h)
const analytics = await nftMarketAnalyticsAgent.execute();

console.log('Market Analytics:', analytics.data);
```

### Custom Parameters

```typescript
// Fetch analytics for specific blockchain and time range
const polygonAnalytics = await nftMarketAnalyticsAgent.execute({
  blockchain: 'polygon',
  time_range: '7d'
});

// Fetch 30-day Ethereum analytics
const monthlyAnalytics = await nftMarketAnalyticsAgent.execute({
  blockchain: 'ethereum',
  time_range: '30d'
});
```

### Error Handling

```typescript
const result = await nftMarketAnalyticsAgent.execute({
  blockchain: 'ethereum',
  time_range: '24h'
});

if (result.success) {
  console.log('Analytics data:', result.data);
} else {
  console.error('Error:', result.message);
}
```

## Supported Parameters

### blockchain (optional)
- **Type**: string
- **Default**: 'ethereum'
- **Description**: Target blockchain for analytics
- **Examples**: 'ethereum', 'polygon', 'bsc'

### time_range (optional)
- **Type**: string
- **Default**: '24h'
- **Description**: Time period for analytics data
- **Examples**: '24h', '7d', '30d', '90d'

## Response Format

```typescript
interface NFTMarketAnalytics {
  data: Array<{
    block_dates: string[];
    blockchain: string;
    chain_id: number;
    price_ceiling_trend: number[];
    price_floor_trend: number[];
    volume_trend: number[];
    sales_count_trend: number[];
    holders_trend: number[];
    unique_buyers_trend: number[];
    unique_sellers_trend: number[];
    avg_price_trend: number[];
    market_cap_trend: number[];
  }>;
  success: boolean;
  message?: string;
}
```

## Integration with Agent Registry

The agent is automatically registered in the NeuralOps™ Agent Framework:

```typescript
import { AgentRegistry } from '@/neural_ops/agents';

// Execute via registry
const analytics = await AgentRegistry.execute('nftMarketAnalyticsAgent', {
  blockchain: 'ethereum',
  time_range: '7d'
});
```

## Testing

Run the test suite:

```bash
npm test neural_ops/agents/bitcrunch/nft/market-insights/analyticsAgent.test.ts
```

## Environment Variables

- `UNLEASH_API_KEY`: Your UnleashNFTs API key (falls back to default if not set)

## Error Scenarios

The agent handles various error scenarios:

1. **API Unavailable**: Returns structured error response
2. **Invalid Parameters**: Validates input parameters
3. **Network Issues**: Graceful timeout and retry logic
4. **Invalid Response**: Validates API response structure

## Dependencies

- `zod`: Schema validation
- `@/neural_ops/agents/base/ApiClient`: Base agent framework
- UnleashNFTs bitsCrunch API

## Related Agents

- `supportedChainsAgent`: Get list of supported blockchains
- `walletScoreAgent`: Analyze wallet risk and scoring
