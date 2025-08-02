"use client"

import React from "react"
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
} from "recharts"

interface NFTMarketAnalyticsProps {
    result: any // You can refine this type later
    toolCallId: string
}

export const NFTMarketAnalyticsTool: React.FC<NFTMarketAnalyticsProps> = ({
    result,
    toolCallId,
}) => {
    const chartData =
        result.insights?.sales_trend?.map((val: number, i: number) => ({
            time: result.insights.block_dates?.[i]?.slice(11, 16) || `T${i}`,
            sales: val,
        })) || []

    return (
        <div key={toolCallId} className="bg-card border rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <h4 className="font-medium text-foreground">NFT Market Insights</h4>
            </div>

            {result.success ? (
                <>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs mb-4">
                        <div className="bg-muted rounded-md p-2">
                            <div className="text-muted-foreground mb-1">Sales</div>
                            <div className="font-medium">{result.insights?.sales ?? "N/A"}</div>
                        </div>
                        <div className="bg-muted rounded-md p-2">
                            <div className="text-muted-foreground mb-1">Transactions</div>
                            <div className="font-medium">{result.insights?.transactions ?? "N/A"}</div>
                        </div>
                        <div className="bg-muted rounded-md p-2">
                            <div className="text-muted-foreground mb-1">Transfers</div>
                            <div className="font-medium">{result.insights?.transfers ?? "N/A"}</div>
                        </div>
                        <div className="bg-muted rounded-md p-2">
                            <div className="text-muted-foreground mb-1">Volume</div>
                            <div className="font-medium">
                                {result.insights?.volume
                                    ? result.insights.volume.toLocaleString(undefined, { maximumFractionDigits: 2 })
                                    : "N/A"}
                            </div>
                        </div>
                    </div>

                    <div style={{ width: "100%", height: 200 }}>
                        <ResponsiveContainer>
                            <LineChart
                                data={chartData}
                                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                            >
                                <XAxis dataKey="time" tick={{ fontSize: 10 }} />
                                <YAxis tick={{ fontSize: 10 }} />
                                <Tooltip />
                                <Line
                                    type="monotone"
                                    dataKey="sales"
                                    stroke="#7c3aed"
                                    strokeWidth={2}
                                    dot={{ r: 1 }}
                                    activeDot={{ r: 4 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
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
    )
}
