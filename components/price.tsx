'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ReactNode } from 'react';
import { formatPrice } from "@/lib/format";

interface PriceData {
  symbol?: string;
  name?: string;
  price?: number;
  change24h?: number;
  marketCap?: number | null;
  volume24h?: number | null;
  lastUpdated?: string;
  error?: string;
  suggestions?: string[];
  isTemporaryError?: boolean;
}

export default function CryptoPriceDisplay({
  asset,
  price,
}: {
  asset: string;
  price: number | PriceData;
}) {
  // Handle both old format (just number) and new format (object)
  const priceData: PriceData = typeof price === 'number'
    ? { price, symbol: asset.toUpperCase() }
    : price;

  // If there's an error, show error message
  if (priceData.error) {
    const isTemporary = priceData.isTemporaryError;
    const borderColor = isTemporary ? "border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950" : "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950";
    const textColor = isTemporary ? "text-yellow-700 dark:text-yellow-300" : "text-red-700 dark:text-red-300";
    const contentColor = isTemporary ? "text-yellow-600 dark:text-yellow-400" : "text-red-600 dark:text-red-400";

    return (
      <Card className={borderColor}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className={`text-lg font-bold ${textColor}`}>
            {priceData.symbol || asset} - {isTemporary ? 'Data Temporarily Unavailable' : 'Price Not Found'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className={`text-sm ${contentColor} whitespace-pre-line`}>
            {priceData.error}
          </p>
          {priceData.suggestions && priceData.suggestions.length > 0 && (
            <div className={`text-sm ${contentColor}`}>
              <p className="font-semibold mb-1">Suggestions:</p>
              <ul className="list-disc list-inside space-y-1">
                {priceData.suggestions.map((suggestion, index) => (
                  <li key={index}>{suggestion}</li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  const changeColor = priceData.change24h && priceData.change24h >= 0
    ? 'text-green-600 dark:text-green-400'
    : 'text-red-600 dark:text-red-400';

  const formatLargeNumber = (num: number | null | undefined) => {
    if (!num) return 'N/A';
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
    return `$${num.toFixed(2)}`;
  };

  return (
    <Card className="">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-bold">
          {priceData.name ? `${priceData.name} (${priceData.symbol})` : (priceData.symbol || asset)} Price
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-baseline gap-2">
          <div className="text-3xl font-bold">
            {priceData.price ? formatPrice(priceData.price) : 'N/A'}
          </div>
          {priceData.change24h !== undefined && (
            <div className={`text-lg font-semibold ${changeColor}`}>
              {priceData.change24h >= 0 ? '+' : ''}{priceData.change24h.toFixed(2)}%
            </div>
          )}
        </div>

        {(priceData.marketCap || priceData.volume24h) && (
          <div className="grid grid-cols-2 gap-4 text-sm">
            {priceData.marketCap && (
              <div>
                <p className="text-muted-foreground">Market Cap</p>
                <p className="font-semibold">{formatLargeNumber(priceData.marketCap)}</p>
              </div>
            )}
            {priceData.volume24h && (
              <div>
                <p className="text-muted-foreground">24h Volume</p>
                <p className="font-semibold">{formatLargeNumber(priceData.volume24h)}</p>
              </div>
            )}
          </div>
        )}

        <p className="text-xs text-muted-foreground">
          Last updated: {priceData.lastUpdated
            ? new Date(priceData.lastUpdated).toLocaleTimeString()
            : new Date().toLocaleTimeString()
          }
        </p>
      </CardContent>
    </Card>
  );
}
