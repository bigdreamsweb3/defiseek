"use client";

import React, { useState } from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

interface NFTMarketAnalyticsProps {
    result: any; // consider refining this later
    toolCallId: string;
}

export const NFTMarketAnalyticsTool: React.FC<NFTMarketAnalyticsProps> = ({
    result,
    toolCallId,
}) => {
    const [activeChart, setActiveChart] = useState("sales");

    const insights = result.insights || {};
    const blockDates = insights.blockDates || [];

    const makeChartData = (trend: number[] | undefined, label: string) => {
        return trend?.map((val: number, i: number) => ({
            time: blockDates[i]?.slice(11, 16) || `T${i}`,
            [label]: val,
        })) || [];
    };

    const salesData = makeChartData(insights.salesTrend, "sales");
    const txData = makeChartData(insights.transactionsTrend, "txs");
    const transfersData = makeChartData(insights.transfersTrend, "transfers");
    const volumeData = makeChartData(insights.volumeTrend, "volume");

    const chartConfigs = [
        {
            id: "sales",
            label: "Sales",
            data: salesData,
            color: "#7c3aed",
            key: "sales",
            value: insights.sales ?? "N/A"
        },
        {
            id: "transactions",
            label: "Transactions",
            data: txData,
            color: "#0ea5e9",
            key: "txs",
            value: insights.transactions ?? "N/A"
        },
        {
            id: "transfers",
            label: "Transfers",
            data: transfersData,
            color: "#10b981",
            key: "transfers",
            value: insights.transfers ?? "N/A"
        },
        {
            id: "volume",
            label: "Volume",
            data: volumeData,
            color: "#f97316",
            key: "volume",
            value: insights.volume
                ? insights.volume.toLocaleString(undefined, {
                    maximumFractionDigits: 2,
                })
                : "N/A"
        },
    ];

    const activeConfig = chartConfigs.find(config => config.id === activeChart) || chartConfigs[0];

    return (
        <div key={toolCallId} className="bg-card border rounded-lg p-3 shadow-sm">
            <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                    <div>
                        <h4 className="font-semibold text-foreground text-sm">
                            NFT Market Analytics
                        </h4>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            Market insights and trends
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
                    {/* 🔢 Stat Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs mb-3">
                        {chartConfigs.map((config) => (
                            <div key={config.id} className="bg-muted rounded-md p-2">
                                <div className="text-muted-foreground mb-1">{config.label}</div>
                                <div className="font-medium">{config.value}</div>
                            </div>
                        ))}
                    </div>

                    

                    {/* 🎛️ Chart Control Buttons */}
                    <div className="flex flex-wrap gap-1 mb-3 p-1 bg-muted rounded-lg w-fit">
                        {chartConfigs.map((config) => (
                            <button
                                key={config.id}
                                onClick={() => setActiveChart(config.id)}
                                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all duration-200 ${activeChart === config.id
                                        ? "bg-background text-foreground shadow-sm"
                                        : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                                    }`}
                            >
                                {config.label}
                            </button>
                        ))}
                    </div>

                    {/* 📈 Single Chart Display */}
                    <div className="mb-2">
                        <div className="flex items-center gap-2 mb-2">
                            <div
                                className="w-2.5 h-2.5 rounded-full"
                                style={{ backgroundColor: activeConfig.color }}
                            ></div>
                            <h5 className="text-xs font-medium text-foreground">
                                {activeConfig.label} Trend
                            </h5>
                            <span className="text-sm font-semibold text-foreground ml-auto">
                                {activeConfig.value}
                            </span>
                        </div>

                        <div className="w-full bg-muted/30 rounded-lg p-2 min-h-0">
                            <div className="h-48 sm:h-52 md:h-56 lg:h-60">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart
                                        data={activeConfig.data}
                                        margin={{ top: 10, right: 20, left: 0, bottom: 10 }}
                                    >
                                        <XAxis
                                            dataKey="time"
                                            tick={{ fontSize: 10 }}
                                            axisLine={false}
                                            tickLine={false}
                                            className="text-muted-foreground"
                                        />
                                        <YAxis
                                            tick={{ fontSize: 10 }}
                                            axisLine={false}
                                            tickLine={false}
                                            className="text-muted-foreground"
                                        />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: 'hsl(var(--background))',
                                                border: '1px solid hsl(var(--border))',
                                                borderRadius: '6px',
                                                fontSize: '11px'
                                            }}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey={activeConfig.key}
                                            stroke={activeConfig.color}
                                            strokeWidth={2.5}
                                            dot={false}
                                            activeDot={{
                                                r: 4,
                                                fill: activeConfig.color,
                                                stroke: 'hsl(var(--background))',
                                                strokeWidth: 2
                                            }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </>
            ) : (
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <p className="text-sm text-muted-foreground">
                        {result.message || "Failed to load insights"}
                    </p>
                </div>
            )}
        </div>
    );
};