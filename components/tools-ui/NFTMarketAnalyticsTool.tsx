"use client";

import React from "react";
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

    return (
        <div key={toolCallId} className="bg-card border rounded-lg p-4 shadow-sm">
            <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2 mb-3">
                    <div>
                        <h4 className="font-semibold text-foreground text-[15px]">
                            NFT Market Analytics
                        </h4>
                        <p className="text-sm text-muted-foreground mt-1">
                            Market insights and trends
                        </p>
                    </div>
                </div>

                {result.blockchain && (
                    <span className="bg-muted text-muted-foreground px-3 py-1.5 rounded-full text-sm font-medium capitalize">
                        {result.blockchain}
                    </span>
                )}
            </div>

            {result.success ? (
                <>
                    {/* 🔢 Stat Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs mb-4">
                        <div className="bg-muted rounded-md p-2">
                            <div className="text-muted-foreground mb-1">Sales</div>
                            <div className="font-medium">{insights.sales ?? "N/A"}</div>
                        </div>
                        <div className="bg-muted rounded-md p-2">
                            <div className="text-muted-foreground mb-1">Transactions</div>
                            <div className="font-medium">{insights.transactions ?? "N/A"}</div>
                        </div>
                        <div className="bg-muted rounded-md p-2">
                            <div className="text-muted-foreground mb-1">Transfers</div>
                            <div className="font-medium">{insights.transfers ?? "N/A"}</div>
                        </div>
                        <div className="bg-muted rounded-md p-2">
                            <div className="text-muted-foreground mb-1">Volume</div>
                            <div className="font-medium">
                                {insights.volume
                                    ? insights.volume.toLocaleString(undefined, {
                                        maximumFractionDigits: 2,
                                    })
                                    : "N/A"}
                            </div>
                        </div>
                    </div>

                    {/* 📈 Charts Section */}
                    {[
                        { label: "Sales", data: salesData, color: "#7c3aed", key: "sales" },
                        { label: "Transactions", data: txData, color: "#0ea5e9", key: "txs" },
                        { label: "Transfers", data: transfersData, color: "#10b981", key: "transfers" },
                        { label: "Volume", data: volumeData, color: "#f97316", key: "volume" },
                    ].map(({ label, data, color, key }) => (
                        <div key={label} className="mb-6">
                            <h5 className="text-sm font-medium text-muted-foreground mb-2">
                                {label} Trend
                            </h5>
                            <div className="w-full min-h-[220px]">
                                <ResponsiveContainer width="100%" height={200}>
                                    <LineChart
                                        data={data}
                                        margin={{ top: 10, right: 20, left: -10, bottom: 0 }}
                                    >
                                        <XAxis dataKey="time" tick={{ fontSize: 10 }} />
                                        <YAxis tick={{ fontSize: 10 }} />
                                        <Tooltip />
                                        <Line
                                            type="monotone"
                                            dataKey={key}
                                            stroke={color}
                                            strokeWidth={2}
                                            dot={{ r: 1 }}
                                            activeDot={{ r: 4 }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>

                        </div>
                    ))}
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
