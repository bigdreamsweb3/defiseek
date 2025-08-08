"use client";

import React, { useState } from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from "recharts";

interface NFTCategoryProps {
    result: any;
    toolCallId: string;
}

export const NFTCategoryTool: React.FC<NFTCategoryProps> = ({
    result,
    toolCallId,
}) => {
    const [activeChart, setActiveChart] = useState("volume");
    const [showChart, setShowChart] = useState(true);

    const categories = result.categories || [];
    const summary = result.summary || {};
    const pagination = result.pagination || {};

    const chartConfigs = [
        {
            id: "volume",
            label: "Volume",
            color: "#7c3aed",
            key: "volume",
            formatter: (value: number) => `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
        },
        {
            id: "sales",
            label: "Sales",
            color: "#0ea5e9",
            key: "sales",
            formatter: (value: number) => value.toLocaleString()
        },
        {
            id: "transactions",
            label: "Transactions",
            color: "#10b981",
            key: "transactions",
            formatter: (value: number) => value.toLocaleString()
        },
        {
            id: "holders",
            label: "Holders",
            color: "#f97316",
            key: "holders",
            formatter: (value: number) => value.toLocaleString()
        },
    ];

    const activeConfig = chartConfigs.find(config => config.id === activeChart) || chartConfigs[0];

    // Prepare chart data (top 10 categories for better visualization)
    const chartData = categories
        .slice(0, 10)
        .map((cat: any) => ({
            category: cat.category.length > 12 ? `${cat.category.substring(0, 12)}...` : cat.category,
            fullCategory: cat.category,
            volume: cat.volume,
            sales: cat.sales,
            transactions: cat.transactions,
            holders: cat.holders,
        }));

    // Pie chart data for top 5 categories by volume
    const pieData = categories
        .slice(0, 5)
        .map((cat: any, index: number) => ({
            name: cat.category,
            value: cat.volume,
            color: ['#7c3aed', '#0ea5e9', '#10b981', '#f97316', '#ef4444'][index],
        }));

    const getCategoryIcon = (category: string) => {
        const icons: { [key: string]: string } = {
            'arts': '🎨',
            'avatar': '👤',
            'collectibles': '🏆',
            'games': '🎮',
            'metaverse': '🌐',
            'utility': '🔧',
            'music': '🎵',
            'others': '📦',
            'domain names': '🌍',
            'fashion': '👗',
            'sports': '⚽',
            'photography': '📸',
            'defi': '💰',
            'memberships': '🎫',
        };
        return icons[category] || '📁';
    };

    const formatLargeNumber = (num: number) => {
        if (num >= 1e9) return `${(num / 1e9).toFixed(1)}B`;
        if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`;
        if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`;
        return num.toLocaleString();
    };

    return (
        <div key={toolCallId} className="bg-card border rounded-lg p-4 shadow-sm">
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                    <div>
                        <h4 className="font-semibold text-foreground text-sm">
                            NFT Collection Categories
                        </h4>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            Category performance and market metrics
                        </p>
                    </div>
                </div>

                {result.blockchain && (
                    <span className="bg-muted text-muted-foreground px-2 py-1 rounded-full text-xs font-medium capitalize">
                        {result.blockchain}
                    </span>
                )}
            </div>

            {result.success ? (
                <>
                    {/* Summary Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs mb-4">
                        <div className="bg-muted rounded-md p-2">
                            <div className="text-muted-foreground mb-1">Total Volume</div>
                            <div className="font-medium">{summary.formattedTotalVolume || 'N/A'}</div>
                        </div>
                        <div className="bg-muted rounded-md p-2">
                            <div className="text-muted-foreground mb-1">Total Sales</div>
                            <div className="font-medium">{summary.formattedTotalSales || 'N/A'}</div>
                        </div>
                        <div className="bg-muted rounded-md p-2">
                            <div className="text-muted-foreground mb-1">Total Holders</div>
                            <div className="font-medium">{summary.formattedTotalHolders || 'N/A'}</div>
                        </div>
                        <div className="bg-muted rounded-md p-2">
                            <div className="text-muted-foreground mb-1">Categories</div>
                            <div className="font-medium">{categories.length}</div>
                        </div>
                    </div>

                    {/* Top Category Highlight */}
                    {summary.topCategory && (
                        <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-3 mb-4">
                            <div className="flex items-center gap-2">
                                <span className="text-lg">{getCategoryIcon(summary.topCategory)}</span>
                                <div>
                                    <h5 className="text-sm font-medium text-foreground">
                                        Top Category: {summary.topCategory}
                                    </h5>
                                    <p className="text-xs text-muted-foreground">
                                        Volume: ${formatLargeNumber(summary.topCategoryVolume)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Chart Toggle */}
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex flex-wrap gap-1 p-1 bg-muted rounded-lg w-fit">
                            {chartConfigs.map((config) => (
                                <button
                                    key={config.id}
                                    onClick={() => setActiveChart(config.id)}
                                    className={`px-2 py-1 text-xs rounded transition-colors ${
                                        activeChart === config.id
                                            ? 'bg-background text-foreground shadow-sm'
                                            : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                >
                                    {config.label}
                                </button>
                            ))}
                        </div>
                        
                        <button
                            onClick={() => setShowChart(!showChart)}
                            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                        >
                            {showChart ? 'Hide Chart' : 'Show Chart'}
                        </button>
                    </div>

                    {/* Charts */}
                    {showChart && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
                            {/* Bar Chart */}
                            <div className="lg:col-span-2">
                                <div className="flex items-center gap-2 mb-2">
                                    <div
                                        className="w-2.5 h-2.5 rounded-full"
                                        style={{ backgroundColor: activeConfig.color }}
                                    ></div>
                                    <h5 className="text-xs font-medium text-foreground">
                                        {activeConfig.label} by Category (Top 10)
                                    </h5>
                                </div>
                                
                                <div className="w-full bg-muted/30 rounded-lg p-2">
                                    <div className="h-48">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart
                                                data={chartData}
                                                margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
                                            >
                                                <XAxis
                                                    dataKey="category"
                                                    tick={{ fontSize: 10 }}
                                                    axisLine={false}
                                                    tickLine={false}
                                                    angle={-45}
                                                    textAnchor="end"
                                                    height={60}
                                                    className="text-muted-foreground"
                                                />
                                                <YAxis
                                                    tick={{ fontSize: 10 }}
                                                    axisLine={false}
                                                    tickLine={false}
                                                    className="text-muted-foreground"
                                                    tickFormatter={formatLargeNumber}
                                                />
                                                <Tooltip
                                                    contentStyle={{
                                                        backgroundColor: 'hsl(var(--background))',
                                                        border: '1px solid hsl(var(--border))',
                                                        borderRadius: '6px',
                                                        fontSize: '11px'
                                                    }}
                                                    labelFormatter={(label, payload) => {
                                                        const item = payload?.[0]?.payload;
                                                        return item?.fullCategory || label;
                                                    }}
                                                    formatter={(value: number) => [
                                                        activeConfig.formatter(value),
                                                        activeConfig.label
                                                    ]}
                                                />
                                                <Bar
                                                    dataKey={activeConfig.key}
                                                    fill={activeConfig.color}
                                                    radius={[2, 2, 0, 0]}
                                                />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>

                            {/* Pie Chart */}
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-2.5 h-2.5 rounded-full bg-purple-500"></div>
                                    <h5 className="text-xs font-medium text-foreground">
                                        Volume Distribution (Top 5)
                                    </h5>
                                </div>
                                
                                <div className="w-full bg-muted/30 rounded-lg p-2">
                                    <div className="h-48">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={pieData}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={30}
                                                    outerRadius={70}
                                                    paddingAngle={2}
                                                    dataKey="value"
                                                >
                                                    {pieData.map((entry: { name: string; value: number; color: string }, index: number) => (
                                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                                    ))}
                                                </Pie>
                                                <Tooltip
                                                    contentStyle={{
                                                        backgroundColor: 'hsl(var(--background))',
                                                        border: '1px solid hsl(var(--border))',
                                                        borderRadius: '6px',
                                                        fontSize: '11px'
                                                    }}
                                                    formatter={(value: number) => [
                                                        `$${formatLargeNumber(value)}`,
                                                        'Volume'
                                                    ]}
                                                />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Categories List */}
                    <div className="space-y-2">
                        <h5 className="text-sm font-medium text-foreground mb-2">All Categories</h5>
                        {categories.map((category: any, index: number) => (
                            <div key={category.category} className="border rounded-lg p-3 bg-muted/30">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <span className="text-lg">{getCategoryIcon(category.category)}</span>
                                        <div>
                                            <h6 className="font-medium text-sm text-foreground capitalize">
                                                {category.category}
                                            </h6>
                                            {category.description && (
                                                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                                    {category.description.length > 100 
                                                        ? `${category.description.substring(0, 100)}...`
                                                        : category.description
                                                    }
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs text-muted-foreground">#{index + 1}</div>
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3 text-xs">
                                    <div>
                                        <span className="text-muted-foreground">Volume: </span>
                                        <span className="font-medium">${formatLargeNumber(category.volume)}</span>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">Sales: </span>
                                        <span className="font-medium">{formatLargeNumber(category.sales)}</span>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">Holders: </span>
                                        <span className="font-medium">{formatLargeNumber(category.holders)}</span>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">Transactions: </span>
                                        <span className="font-medium">{formatLargeNumber(category.transactions)}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pagination Info */}
                    {pagination.totalItems > pagination.limit && (
                        <div className="mt-4 text-xs text-muted-foreground text-center">
                            Showing {pagination.offset + 1}-{Math.min(pagination.offset + pagination.limit, pagination.totalItems)} of {pagination.totalItems} categories
                            {pagination.hasNext && " • More results available"}
                        </div>
                    )}
                </>
            ) : (
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <p className="text-sm text-muted-foreground">
                        {result.message || "Failed to load category data"}
                    </p>
                </div>
            )}
        </div>
    );
};
