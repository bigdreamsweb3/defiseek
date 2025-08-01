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

          {Array.isArray(message.toolInvocations) && message.toolInvocations.length > 0 && (
            <div className="flex flex-col gap-4">
              {message.toolInvocations.map((tool) => {
                const { toolName, toolCallId, state, args, result } = tool as any;
                if (state !== 'result') {
                  return (
                    <div key={toolCallId} className="animate-pulse bg-gray-900/10 dark:bg-gray-50/10 p-4 rounded">
                      <Skeleton className="h-4 w-48 mb-2" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  );
                }

                switch (toolName) {
                  case 'checkSupportedChains':
                    return (
                      <div key={toolCallId} className="bg-[#0a0f1c] border border-cyan-800 rounded-xl p-4">
                        <h4 className="text-cyan-400 font-semibold mb-2">🌐 Supported Blockchain Networks</h4>
                        {result.success ? (
                          <>
                            <p className="text-sm text-cyan-200 mb-2">{result.message}</p>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                              {result.supportedChains?.map((chain: any, idx: number) => (
                                <span key={idx} className="text-xs bg-cyan-900 text-cyan-100 px-2 py-1 rounded">
                                  {chain.name || chain}
                                </span>
                              ))}
                            </div>
                          </>
                        ) : (
                          <p className="text-sm text-red-300">❌ {result.error}</p>
                        )}
                      </div>
                    );

                  case 'validateChain':
                    return (
                      <div key={toolCallId} className={`rounded-xl p-4 border ${result.isSupported ? 'bg-green-900/20 border-green-800 text-green-300' : 'bg-red-900/20 border-red-700 text-red-300'}`}>
                        <h4 className="font-semibold mb-2">🔗 Chain Validation: {args.chainIdentifier}</h4>
                        <p className="text-sm">{result.message}</p>
                        {result.chainInfo && (
                          <pre className="mt-2 text-xs whitespace-pre-wrap break-words">{JSON.stringify(result.chainInfo, null, 2)}</pre>
                        )}
                      </div>
                    );

                  case 'checkWalletScore':
                    return (
                      <div key={toolCallId} className={`rounded-xl p-4 border ${result.success ? 'bg-cyan-900/20 border-cyan-700 text-cyan-300' : 'bg-orange-900/20 border-orange-700 text-orange-300'}`}>
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                          🛡️ Wallet Analysis
                          <span className="text-xs font-mono bg-black/30 px-2 py-1 rounded">
                            {args.address?.slice(0, 6)}...{args.address?.slice(-4)}
                          </span>
                        </h4>
                        {result.success ? (
                          <div className="space-y-2 text-sm">
                            <p>📊 Score: <strong>{result.data?.walletScore}</strong> — {result.data?.classification}</p>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div>Anomalous Pattern Score: {result.data?.riskScores?.anomalousPatternScore}</div>
                              <div>Associated Token Score: {result.data?.riskScores?.associatedTokenScore}</div>
                              <div>Risk Interaction Score: {result.data?.riskScores?.riskInteractionScore}</div>
                              <div>Wallet Age Score: {result.data?.riskScores?.walletAgeScore}</div>
                            </div>
                            {result.data?.illicitFlags && (
                              <p className="text-xs bg-red-900 text-red-300 px-2 py-1 rounded inline-block">
                                🚩 Illicit flags detected
                              </p>
                            )}
                          </div>
                        ) : (
                          <p className="text-sm">⚠ {result.message || 'Could not retrieve score'}</p>
                        )}
                      </div>
                    );

                  case 'analyzeNFTMarketInsights':
                    return (
                      <div key={toolCallId} className="bg-purple-950/30 border border-purple-800 text-purple-200 rounded-xl p-4">
                        <h4 className="font-semibold mb-2">🖼️ NFT Market Insights</h4>
                        {result.success ? (
                          <div className="space-y-2 text-sm">
                            <p>Collection: {result.data?.collectionName}</p>
                            <div className="flex gap-2">
                              {result.data?.verified && <span className="text-xs bg-green-900 text-green-200 px-2 py-1 rounded">✅ Verified</span>}
                              {result.data?.riskFlags?.length > 0 && <span className="text-xs bg-red-900 text-red-200 px-2 py-1 rounded">⚠ Risk Flags</span>}
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm">❌ {result.message}</p>
                        )}
                      </div>
                    );

                  default:
                    return (
                      <div key={toolCallId} className="bg-gray-900/30 border border-gray-700 rounded-xl p-3">
                        <p className="text-xs text-gray-400">🧩 Tool: {toolName}</p>
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
