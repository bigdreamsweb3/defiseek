import cx from "classnames";


interface CheckWalletScoreToolProps {
    result: any; // consider refining this later
    toolCallId: string;
    args: any;
}
export const CheckWalletScoreTool: React.FC<CheckWalletScoreToolProps> = ({
    result,
    toolCallId,
    args,
}) => {
    return (
        <div key={toolCallId} className="bg-card border rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
                <div
                    className={`w-2 h-2 rounded-full ${result.success ? "bg-blue-500" : "bg-orange-500"}`}
                ></div>
                <h4 className="font-medium text-foreground">Wallet Analysis</h4>
                <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded font-mono">
                    {args.address?.slice(0, 6)}...{args.address?.slice(-4)}
                </span>
            </div>
            {result.success ? (
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Score:</span>
                        <span className="font-semibold text-foreground">
                            {result.data?.walletScore?.toFixed(1)}/100
                        </span>
                        <span className="text-sm text-muted-foreground">—</span>
                        <span
                            className={cx(
                                "text-sm font-medium",
                                result.data?.walletScore < 30
                                    ? "text-red-600"
                                    : result.data?.walletScore < 50
                                        ? "text-orange-500"
                                        : "text-green-600"
                            )}
                        >
                            {result.data?.classification}
                        </span>
                        <span className="text-xs text-muted-foreground">
                            ({result.data?.classificationLevel})
                        </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                        <div className="bg-muted rounded-md p-2">
                            <div className="text-muted-foreground mb-1">Wallet Age</div>
                            <div className="font-medium">
                                {result.data?.riskScores?.walletAgeScore?.toFixed(1)}/10
                            </div>
                        </div>

                        <div className="bg-muted rounded-md p-2">
                            <div className="text-muted-foreground mb-1">Risk Interaction</div>
                            <div className="font-medium">
                                {result.data?.riskScores?.riskInteractionScore}
                            </div>
                        </div>

                        <div className="bg-muted rounded-md p-2">
                            <div className="text-muted-foreground mb-1">Frequency</div>
                            <div className="font-medium">
                                {result.data?.riskScores?.frequencyScore}
                            </div>
                        </div>

                        <div className="bg-muted rounded-md p-2">
                            <div className="text-muted-foreground mb-1">
                                CEX Interactions
                                {/* <Tooltip>Interaction score with centralized exchanges</Tooltip> */}
                            </div>

                            <div className="font-medium">
                                {result.data?.riskScores?.centralizedInteraction}
                            </div>
                        </div>

                        <div className="bg-muted rounded-md p-2">
                            <div className="text-muted-foreground mb-1">Smart Contract Score</div>
                            <div className="font-medium">
                                {result.data?.riskScores?.smartContractInteractionScore}
                            </div>
                        </div>

                        <div className="bg-muted rounded-md p-2">
                            <div className="text-muted-foreground mb-1">Volume Score</div>
                            <div className="font-medium">
                                {Number(result.data?.riskScores?.volumeScore ?? 0).toFixed(5)}
                            </div>
                        </div>
                    </div>

                    {result.data?.blockchainWithoutIllicit && (
                        <div className="text-xs text-muted-foreground mt-2">
                            <span className="font-medium text-foreground">Clean Chains:</span>{" "}
                            {result.data.blockchainWithoutIllicit}
                        </div>
                    )}

                    {result.data?.illicitFlags && (
                        <div className="flex items-center gap-2 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-md p-2">
                            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                            <span className="text-xs text-red-700 dark:text-red-300">
                                Illicit activity detected
                            </span>
                        </div>
                    )}
                </div>


            ) : (
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        <p className="text-sm text-muted-foreground">
                            {result.data?.error || result.message || "Could not retrieve score"}
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

    )
};