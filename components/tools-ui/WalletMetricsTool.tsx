import cx from "classnames";

interface WalletMetricsToolProps {
    result: any;
    toolCallId: string;
    args: any;
}

export const WalletMetricsTool: React.FC<WalletMetricsToolProps> = ({
    result,
    toolCallId,
    args,
}) => {
    return (
        <div key={toolCallId} className="bg-card border rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
                <div
                    className={`w-2 h-2 rounded-full ${result.success ? "bg-green-500" : "bg-orange-500"}`}
                ></div>
                <h4 className="font-medium text-foreground">Wallet Metrics</h4>
                <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded font-mono">
                    {args.blockchain}
                </span>
            </div>
            {result.success ? (
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Balance:</span>
                        <span className="font-semibold text-foreground">
                            {result.data?.balance || 'Unknown'}
                        </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                        <div className="bg-muted rounded-md p-2">
                            <div className="text-muted-foreground mb-1">Transactions</div>
                            <div className="font-medium">
                                {result.data?.transactionCount || 0}
                            </div>
                        </div>

                        <div className="bg-muted rounded-md p-2">
                            <div className="text-muted-foreground mb-1">Total Volume</div>
                            <div className="font-medium">
                                {result.data?.totalVolume || 'Unknown'}
                            </div>
                        </div>

                        <div className="bg-muted rounded-md p-2">
                            <div className="text-muted-foreground mb-1">Wallet Age</div>
                            <div className="font-medium">
                                {result.data?.walletAge || 0} days
                            </div>
                        </div>

                        <div className="bg-muted rounded-md p-2">
                            <div className="text-muted-foreground mb-1">Token Count</div>
                            <div className="font-medium">
                                {result.data?.tokenCount || 0}
                            </div>
                        </div>

                        <div className="bg-muted rounded-md p-2">
                            <div className="text-muted-foreground mb-1">Incoming</div>
                            <div className="font-medium">
                                {result.data?.incomingTransactions || 0}
                            </div>
                        </div>

                        <div className="bg-muted rounded-md p-2">
                            <div className="text-muted-foreground mb-1">Outgoing</div>
                            <div className="font-medium">
                                {result.data?.outgoingTransactions || 0}
                            </div>
                        </div>
                    </div>

                    {result.data?.inflowAmount && result.data?.outflowAmount && (
                        <div className="text-xs text-muted-foreground mt-2">
                            <span className="font-medium text-foreground">Flow:</span>{" "}
                            In: {result.data.inflowAmount} | Out: {result.data.outflowAmount}
                        </div>
                    )}
                </div>
            ) : (
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        <p className="text-sm text-muted-foreground">
                            {result.data?.error || result.message || "Could not retrieve metrics"}
                        </p>
                    </div>
                    
                    {result.data?.details && (
                        <div className="text-xs text-muted-foreground bg-muted rounded-md p-2">
                            {result.data.details}
                        </div>
                    )}
                    
                    {result.data?.retry && (
                        <div className="text-xs text-blue-600 dark:text-blue-400">
                            💡 Try again in a few minutes
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
