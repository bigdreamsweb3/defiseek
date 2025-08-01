// file: components/custom/message.tsx
'use client';

import { Message } from 'ai';
import cx from 'classnames';
import { motion } from 'framer-motion';
import { Dispatch, SetStateAction } from 'react';

import { Vote } from '@/db/schema';

import { UIBlock } from './block';
import { SparklesIcon } from './icons';
import { Markdown } from './markdown';
import { MessageActions } from './message-actions';
import { Skeleton } from '../ui/skeleton';

export const PreviewMessage = ({
  chatId,
  message,
  block,
  setBlock,
  vote,
  isLoading,
}: {
  chatId: string;
  message: Message;
  block: UIBlock;
  setBlock: Dispatch<SetStateAction<UIBlock>>;
  vote: Vote | undefined;
  isLoading: boolean;
}) => {
  return (
    <motion.div
     <motion.div
      className="w-full mx-auto max-w-3xl px-4 group/message"
      initial={{ y: 5, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      data-role={message.role}
    >
      <div
        className={cx(
          'group-data-[role=user]/message:bg-primary group-data-[role=user]/message:text-primary-foreground flex gap-4 group-data-[role=user]/message:px-3 w-full group-data-[role=user]/message:w-fit group-data-[role=user]/message:ml-auto group-data-[role=user]/message:max-w-2xl group-data-[role=user]/message:py-2 rounded-xl'
        )}
      >
        {message.role === 'assistant' && (
          <div className="size-8 flex items-center rounded-full justify-center ring-1 shrink-0 ring-border">
            <SparklesIcon size={14} />
          </div>
        )}

        <div className="flex flex-col gap-2 w-full">
          {message.content && (
            <div className="flex flex-col gap-4">
              <Markdown>{message.content as string}</Markdown>
            </div>
          )}

          {message.toolInvocations && message.toolInvocations.length > 0 && (
            <div className="flex flex-col gap-4">
              {message.toolInvocations.map((toolInvocation) => {
                const { toolName, toolCallId, state, args } = toolInvocation;

                if (state === 'result') {
                  const { result } = toolInvocation;

                  return (
                    <div key={toolCallId}>
                      {toolName === 'checkSupportedChains' ? (
                        <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                          <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                            Supported Blockchain Networks
                          </h4>
                          {result.success ? (
                            <div>
                              <p className="text-sm text-blue-700 dark:text-blue-300 mb-2">
                                {result.message}
                              </p>
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                {result.supportedChains?.map((chain: any, index: number) => (
                                  <div key={index} className="text-xs bg-white dark:bg-gray-800 rounded px-2 py-1 border">
                                    {chain.name || chain}
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <p className="text-sm text-red-600 dark:text-red-400">{result.error}</p>
                          )}
                        </div>
                      ) : toolName === 'validateChain' ? (
                        <div className={`border rounded-lg p-4 ${result.isSupported
                          ? 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800'
                          : 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800'
                          }`}>
                          <h4 className={`font-semibold mb-2 ${result.isSupported
                            ? 'text-green-900 dark:text-green-100'
                            : 'text-red-900 dark:text-red-100'
                            }`}>
                            Chain Validation: {args.chainIdentifier}
                          </h4>
                          <p className={`text-sm ${result.isSupported
                            ? 'text-green-700 dark:text-green-300'
                            : 'text-red-700 dark:text-red-300'
                            }`}>
                            {result.message}
                          </p>
                          {result.chainInfo && (
                            <div className="mt-2 text-xs">
                              <strong>Chain Info:</strong> {JSON.stringify(result.chainInfo, null, 2)}
                            </div>
                          )}
                        </div>
                      ) : toolName === 'checkWalletScore' ? (
                        <dtoolName === 'checkWalletScore' ? (
                        <div className={`border rounded-lg p-4 ${
                          result.success
                            ? 'bg-cyan-50 dark:bg-cyan-950 border-cyan-200 dark:border-cyan-800'
                            : 'bg-orange-50 dark:bg-orange-950 border-orange-200 dark:border-orange-800'
                        }`}>
                          <h4 className={`font-semibold mb-2 flex items-center gap-2 ${
                            result.success
                              ? 'text-cyan-900 dark:text-cyan-100'
                              : 'text-orange-900 dark:text-orange-100'
                          }`}>
                            🛡️ Wallet Safety Analysis
                            <span className="text-xs font-mono bg-white dark:bg-gray-800 px-2 py-1 rounded">
                              {args.address?.slice(0, 6)}...{args.address?.slice(-4)}
                            </span>
                          </h4>

                          {result.success ? (
                            <div className="space-y-3">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Classification</p>
                                  <p className="text-sm font-medium">{result.data?.classification}</p>
                                </div>
                                <div>
                                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Wallet Score</p>
                                  <p className="text-sm font-medium">{result.data?.walletScore}/100</p>
                                </div>
                              </div>

                              <div>
                                <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Risk Scores</p>
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                  <div>Suspicious Activity: {result.data?.riskScores?.anomalousPatternScore}</div>
                                  <div>Token Interaction: {result.data?.riskScores?.associatedTokenScore}</div>
                                  <div>Risk Exposure: {result.data?.riskScores?.riskInteractionScore}</div>
                                  <div>Account Age Score: {result.data?.riskScores?.walletAgeScore}</div>
                                </div>
                              </div>

                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-xs bg-cyan-100 dark:bg-cyan-900 text-cyan-800 dark:text-cyan-200 px-2 py-1 rounded">
                                  {result.data?.blockchainWithoutIllicit || result.data?.blockchain}
                                </span>
                                {result.data?.illicitFlags && (
                                  <span className="text-xs bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 px-2 py-1 rounded">
                                    🚩 Flagged Activity Detected
                                  </span>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <p className="text-sm text-orange-700 dark:text-orange-300">
                                ⚠️ Analysis Unavailable
                              </p>
                              <p className="text-xs text-gray-600 dark:text-gray-400">
                                {result.message || 'Could not retrieve wallet safety data'}
                              </p>
                              <div className="text-xs bg-cyan-50 dark:bg-cyan-900 text-cyan-700 dark:text-cyan-300 p-2 rounded">
                                💡 Try checking this wallet manually on Etherscan, BaseScan, or DeBank
                              </div>
                            </div>
                          )}
                        </div>
                      ) : toolName === 'analyzeNFTMarketInsights' ? (
                        <div className="bg-purple-50 dark:bg-purple-950 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                          <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-2 flex items-center gap-2">
                            🖼️ NFT Collection Analysis
                          </h4>
                          {result.success ? (
                            <div className="space-y-2">
                              <p className="text-sm text-purple-700 dark:text-purple-300">
                                Collection: {result.data?.collectionName}
                              </p>
                              <div className="flex items-center gap-2">
                                {result.data?.verified && (
                                  <span className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded">
                                    ✅ Verified
                                  </span>
                                )}
                                {result.data?.riskFlags?.length > 0 && (
                                  <span className="text-xs bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 px-2 py-1 rounded">
                                    ⚠️ Risk Flags
                                  </span>
                                )}
                              </div>
                            </div>
                          ) : (
                            <p className="text-sm text-red-600 dark:text-red-400">
                              {result.message || 'NFT analysis failed'}
                            </p>
                          )}
                        </div>
                      ) : (
                        // 🔥 HIDE UNKNOWN TOOLS - Don't show raw JSON
                        <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-3">
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            🔧 Tool executed: {toolName}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                } else {
                  return (
                    <div key={toolCallId} className="animate-pulse">
                      {toolName === 'checkSupportedChains' ? (
                        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
                          <Skeleton className="h-4 w-48 mb-2" />
                          <Skeleton className="h-3 w-32" />
                        </div>
                      ) : toolName === 'validateChain' ? (
                        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
                          <Skeleton className="h-4 w-40 mb-2" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                      ) : toolName === 'checkWalletScore' ? (
                        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
                          <Skeleton className="h-4 w-48 mb-2" />
                          <Skeleton className="h-3 w-32 mb-2" />
                          <div className="grid grid-cols-2 gap-2">
                            <Skeleton className="h-3 w-20" />
                            <Skeleton className="h-3 w-20" />
                          </div>
                        </div>
                      ) : toolName === 'analyzeNFTMarketInsights' ? (
                        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
                          <Skeleton className="h-4 w-40 mb-2" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                      ) : (
                        <div className="bg-gray-100 dark:bg-gray-800 rounded p-2">
                          <Skeleton className="h-3 w-32" />
                        </div>
                      )}
                    </div>
                  );
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
  );
};

export const ThinkingMessage = () => {
  const role = 'assistant';

  return (
    <motion.div
      className="w-full mx-auto max-w-3xl px-4 group/message "
      initial={{ y: 5, opacity: 0 }}
      animate={{ y: 0, opacity: 1, transition: { delay: 1 } }}
      data-role={role}
    >
      <div
        className={cx(
          'flex gap-4 group-data-[role=user]/message:px-3 w-full group-data-[role=user]/message:w-fit group-data-[role=user]/message:ml-auto group-data-[role=user]/message:max-w-2xl group-data-[role=user]/message:py-2 rounded-xl',
          {
            'group-data-[role=user]/message:bg-muted': true,
          }
        )}
      >
        <div className="size-8 flex items-center rounded-full justify-center ring-1 shrink-0 ring-border">
          <SparklesIcon size={14} />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" />
          </div>
        </div>
      </div>
    </motion.div>
  );
};
