"use client"

import type { Message } from "ai"
import cx from "classnames"
import { motion } from "framer-motion"
import type { Dispatch, SetStateAction } from "react"
import type { Vote } from "@/db/schema"
import type { UIBlock } from "./block"
import { SparklesIcon } from "./icons"
import { Markdown } from "./markdown"
import { MessageActions } from "./message-actions"
import { Skeleton } from "../ui/skeleton"

export const PreviewMessage = ({
  chatId,
  message,
  block,
  setBlock,
  vote,
  isLoading,
}: {
  chatId: string
  message: Message
  block: UIBlock
  setBlock: Dispatch<SetStateAction<UIBlock>>
  vote: Vote | undefined
  isLoading: boolean
}) => {
  return (
    <motion.div
      className="w-full mx-auto max-w-3xl px-4 group/message"
      initial={{ y: 5, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      data-role={message.role}
    >
      <div
        className={cx(
          "group-data-[role=user]/message:bg-muted group-data-[role=user]/message:text-foreground flex gap-4 group-data-[role=user]/message:px-4 w-full group-data-[role=user]/message:w-fit group-data-[role=user]/message:ml-auto group-data-[role=user]/message:max-w-2xl group-data-[role=user]/message:py-3 rounded-lg",
        )}
      >
        {message.role === "assistant" && (
          <div className="size-8 flex items-center rounded-full justify-center bg-muted border shrink-0">
            <SparklesIcon size={14} className="text-muted-foreground" />
          </div>
        )}

        <div className="flex flex-col gap-3 w-full">
          {message.content && (
            <div className="flex flex-col gap-4">
              <Markdown>{message.content as string}</Markdown>
            </div>
          )}

          {Array.isArray(message.toolInvocations) && message.toolInvocations.length > 0 && (
            <div className="flex flex-col gap-3">
              {message.toolInvocations.map((tool) => {
                const { toolName, toolCallId, state, args, result } = tool as any

                if (state !== "result") {
                  return (
                    <div key={toolCallId} className="bg-muted/50 border rounded-lg p-4">
                      <Skeleton className="h-4 w-48 mb-2" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  )
                }

                switch (toolName) {
                  case "checkSupportedChains":
                    return (
                      <div key={toolCallId} className="bg-card border rounded-lg p-4 shadow-sm">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <h4 className="font-medium text-foreground">Supported Blockchain Networks</h4>
                        </div>
                        {result.success ? (
                          <>
                            <p className="text-sm text-muted-foreground mb-3">{result.message}</p>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                              {result.supportedChains?.map((chain: any, idx: number) => (
                                <span
                                  key={idx}
                                  className="text-xs bg-muted text-muted-foreground px-3 py-1.5 rounded-md font-medium"
                                >
                                  {chain.name || chain}
                                </span>
                              ))}
                            </div>
                          </>
                        ) : (
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                            <p className="text-sm text-muted-foreground">{result.error}</p>
                          </div>
                        )}
                      </div>
                    )

                  case "validateChain":
                    return (
                      <div key={toolCallId} className="bg-card border rounded-lg p-4 shadow-sm">
                        <div className="flex items-center gap-2 mb-3">
                          <div
                            className={`w-2 h-2 rounded-full ${result.isSupported ? "bg-green-500" : "bg-red-500"}`}
                          ></div>
                          <h4 className="font-medium text-foreground">Chain Validation</h4>
                          <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded font-mono">
                            {args.chainIdentifier}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{result.message}</p>
                        {result.chainInfo && (
                          <div className="bg-muted rounded-md p-3 mt-3">
                            <pre className="text-xs text-muted-foreground whitespace-pre-wrap break-words font-mono">
                              {JSON.stringify(result.chainInfo, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    )

                  case "checkWalletScore":
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
        {result.data?.riskScores?.walletAgeScore}/10
      </div>
    </div>

    <div className="bg-muted rounded-md p-2">
      <div className="text-muted-foreground mb-1">Risk Interaction</div>
      <div className="font-medium">
        {result.data?.riskScores?.riskInteractionScore}
      </div>
    </div>

    <div className="bg-muted rounded-md p-2">
      <div className="text-muted-foreground mb-1">Frequency Score</div>
      <div className="font-medium">
        {result.data?.riskScores?.frequencyScore}
      </div>
    </div>

    <div className="bg-muted rounded-md p-2">
      <div className="text-muted-foreground mb-1">Centralized Interactions</div>
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
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                            <p className="text-sm text-muted-foreground">
                              {result.message || "Could not retrieve score"}
                            </p>
                          </div>
                        )}
                      </div>
                    )

                  case "analyzeNFTMarketInsights":
                    return (
                      <div key={toolCallId} className="bg-card border rounded-lg p-4 shadow-sm">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                          <h4 className="font-medium text-foreground">NFT Market Insights</h4>
                        </div>
                        {result.success ? (
                          <div className="space-y-3">
                            <p className="text-sm text-muted-foreground">
                              <span className="font-medium text-foreground">Collection:</span>{" "}
                              {result.data?.collectionName}
                            </p>
                            <div className="flex gap-2">
                              {result.data?.verified && (
                                <div className="flex items-center gap-1.5 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-md px-2 py-1">
                                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                                  <span className="text-xs text-green-700 dark:text-green-300">Verified</span>
                                </div>
                              )}
                              {result.data?.riskFlags?.length > 0 && (
                                <div className="flex items-center gap-1.5 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-md px-2 py-1">
                                  <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                                  <span className="text-xs text-orange-700 dark:text-orange-300">Risk Flags</span>
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                            <p className="text-sm text-muted-foreground">{result.message}</p>
                          </div>
                        )}
                      </div>
                    )

                  default:
                    return (
                      <div key={toolCallId} className="bg-card border rounded-lg p-3 shadow-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-muted-foreground rounded-full"></div>
                          <p className="text-xs text-muted-foreground font-medium">Tool: {toolName}</p>
                        </div>
                      </div>
                    )
                }
              })}
            </div>
          )}

          <MessageActions
            key={`action-${message.id}`}
            chatId={chatId}
            message={message}
            vote={vote}
            isLoading={isLoading}
          />
        </div>
      </div>
    </motion.div>
  )
}

export const ThinkingMessage = () => {
  const role = "assistant"

  return (
    <motion.div
      className="w-full mx-auto max-w-3xl px-4 group/message"
      initial={{ y: 5, opacity: 0 }}
      animate={{ y: 0, opacity: 1, transition: { delay: 1 } }}
      data-role={role}
    >
      <div className="flex gap-4 rounded-lg">
        <div className="size-8 flex items-center rounded-full justify-center bg-muted border shrink-0">
          <SparklesIcon size={14} className="text-muted-foreground" />
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.3s]" />
            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.15s]" />
            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
          </div>
          <span className="text-sm text-muted-foreground">Thinking...</span>
        </div>
      </div>
    </motion.div>
  )
                            }
