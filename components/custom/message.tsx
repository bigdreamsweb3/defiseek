'use client';

import type { Message as AIMessage } from 'ai';
import type { Message as DBMessage } from '@/db/schema';

// Combined message type that includes both AI and database properties
type Message = AIMessage & {
  metadata?: {
    uiComponents?: any;
  };
};
import cx from 'classnames';
import { motion } from 'framer-motion';
import type { Dispatch, SetStateAction } from 'react';
import type { Vote } from '@/db/schema';
import type { UIBlock } from './block';
import { SparklesIcon } from './icons';
import { Markdown } from './markdown';
import { MessageActions } from './message-actions';
import { Skeleton } from '../ui/skeleton';
import { NFTMarketAnalyticsTool } from '../tools-ui/NFTMarketAnalyticsTool';
import { CheckWalletScoreTool } from '../tools-ui/CheckWalletScoreTool';
import { NFTMetadataTool } from '../tools-ui/NFTMetadataTool';
import { NFTCategoryTool } from '../tools-ui/NFTCategoryTool';
import { WalletMetricsTool } from '../tools-ui/WalletMetricsTool';

// Helper function to render UI components
const renderUIComponent = (uiComponent: any, key: string) => {
  const { component, props } = uiComponent;
  
  switch (component) {
    case 'CheckWalletScoreTool':
      return (
        <CheckWalletScoreTool
          key={key}
          result={props.result}
          toolCallId={props.toolCallId}
          args={props.args}
        />
      );
      
    case 'WalletMetricsTool':
      return (
        <WalletMetricsTool
          key={key}
          result={props.result}
          toolCallId={props.toolCallId}
          args={props.args}
        />
      );
      
    case 'NFTMarketAnalyticsTool':
      return (
        <NFTMarketAnalyticsTool
          key={key}
          result={props.result}
          toolCallId={props.toolCallId}
        />
      );
      
    case 'NFTMetadataTool':
      return (
        <NFTMetadataTool
          key={key}
          result={props.result}
          toolCallId={props.toolCallId}
        />
      );
      
    case 'NFTCategoryTool':
      return (
        <NFTCategoryTool
          key={key}
          result={props.result}
          toolCallId={props.toolCallId}
        />
      );
      
    default:
      return (
        <div key={key} className="bg-card border rounded-lg p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-muted-foreground rounded-full"></div>
            <p className="text-xs text-muted-foreground font-medium">
              UI Component: {component}
            </p>
          </div>
        </div>
      );
  }
};

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
      {message.role === 'user' ? (
        // User message bubble - ChatGPT style with max 75% width on mobile
        <div className="flex justify-end">
          <div className="bg-muted text-foreground px-4 py-3 rounded-lg w-fit ml-auto max-w-[75%] md:max-w-2xl">
            <div className="flex flex-col gap-3">
              {message.content && (
                <div className="flex flex-col gap-4">
                  <Markdown>{message.content as string}</Markdown>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        // AI response - icon at top for wider content on mobile
        <div className="flex gap-4 w-full">
          <div className="flex flex-col items-center">
            <div className="size-8 flex items-center rounded-full justify-center bg-muted border shrink-0">
              <SparklesIcon size={14} className="text-muted-foreground" />
            </div>
          </div>

          <div className="flex flex-col gap-3 w-full min-w-0">
            {message.content && (
              <div className="flex flex-col gap-4">
                <Markdown>{message.content as string}</Markdown>
              </div>
            )}

            {/* Render UI Components from message metadata */}
            {message.metadata?.uiComponents && (
              <div className="flex flex-col gap-3">
                {Object.entries(message.metadata.uiComponents).map(([key, uiComponent]: [string, any]) => {
                  // Handle nested UI components (like walletMetrics per blockchain)
                  if (typeof uiComponent === 'object' && uiComponent.component) {
                    return renderUIComponent(uiComponent, key);
                  }
                  
                  // Handle grouped UI components (like multiple blockchain metrics)
                  if (typeof uiComponent === 'object' && !uiComponent.component) {
                    return (
                      <div key={key} className="flex flex-col gap-3">
                        <h4 className="font-medium text-foreground capitalize">{key}</h4>
                        {Object.entries(uiComponent).map(([subKey, subComponent]: [string, any]) => (
                          <div key={subKey}>
                            {renderUIComponent(subComponent, `${key}-${subKey}`)}
                          </div>
                        ))}
                      </div>
                    );
                  }
                  
                  return null;
                })}
              </div>
            )}

            {Array.isArray(message.toolInvocations) &&
              message.toolInvocations.length > 0 && (
                <div className="flex flex-col gap-3">
                  {message.toolInvocations.map((tool) => {
                    const { toolName, toolCallId, state, args, result } =
                      tool as any;

                    if (state !== 'result') {
                      return (
                        <div
                          key={toolCallId}
                          className="bg-muted/50 border rounded-lg p-4"
                        >
                          <Skeleton className="h-4 w-48 mb-2" />
                          <Skeleton className="h-3 w-32" />
                        </div>
                      );
                    }

                    switch (toolName) {
                      case 'checkSupportedChains':
                        return (
                          <div
                            key={toolCallId}
                            className="bg-card border rounded-lg p-4 shadow-sm"
                          >
                            <div className="flex items-center gap-2 mb-3">
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              <h4 className="font-medium text-foreground">
                                Supported Blockchain Networks
                              </h4>
                            </div>
                            {result.success ? (
                              <>
                                <p className="text-sm text-muted-foreground mb-3">
                                  {result.message}
                                </p>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                  {result.supportedChains?.map(
                                    (chain: any, idx: number) => (
                                      <span
                                        key={idx}
                                        className="text-xs bg-muted text-muted-foreground px-3 py-1.5 rounded-md font-medium"
                                      >
                                        {chain.name || chain}
                                      </span>
                                    )
                                  )}
                                </div>
                              </>
                            ) : (
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                <p className="text-sm text-muted-foreground">
                                  {result.error}
                                </p>
                              </div>
                            )}
                          </div>
                        );

                      case 'validateChain':
                        return (
                          <div
                            key={toolCallId}
                            className="bg-card border rounded-lg p-4 shadow-sm"
                          >
                            <div className="flex items-center gap-2 mb-3">
                              <div
                                className={`w-2 h-2 rounded-full ${result.isSupported ? 'bg-green-500' : 'bg-red-500'}`}
                              ></div>
                              <h4 className="font-medium text-foreground">
                                Chain Validation
                              </h4>
                              <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded font-mono">
                                {args.chainIdentifier}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {result.message}
                            </p>
                            {result.chainInfo && (
                              <div className="bg-muted rounded-md p-3 mt-3">
                                <pre className="text-xs text-muted-foreground whitespace-pre-wrap break-words font-mono">
                                  {JSON.stringify(result.chainInfo, null, 2)}
                                </pre>
                              </div>
                            )}
                          </div>
                        );

                      case 'checkWalletScore':
                        return (
                          <CheckWalletScoreTool
                            key={toolCallId}
                            result={result}
                            toolCallId={toolCallId}
                            args={args}
                          />
                        );

                      case 'nftMarketAnalyticsTool':
                        return (
                          <NFTMarketAnalyticsTool
                            key={toolCallId}
                            result={result}
                            toolCallId={toolCallId}
                          />
                        );

                      case 'nftMetadataTool':
                        return (
                          <NFTMetadataTool
                            key={toolCallId}
                            result={result}
                            toolCallId={toolCallId}
                          />
                        );

                      case 'nftCategoryTool':
                        return (
                          <NFTCategoryTool
                            key={toolCallId}
                            result={result}
                            toolCallId={toolCallId}
                          />
                        );
                      default:
                        return (
                          <div
                            key={toolCallId}
                            className="bg-card border rounded-lg p-3 shadow-sm"
                          >
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-muted-foreground rounded-full"></div>
                              <p className="text-xs text-muted-foreground font-medium">
                                Tool: {toolName}
                              </p>
                            </div>
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
      )}
    </motion.div>
  );
};

export const ThinkingMessage = () => {
  const role = 'assistant';

  return (
    <motion.div
      className="w-full mx-auto max-w-3xl px-4 group/message"
      initial={{ y: 5, opacity: 0 }}
      animate={{ y: 0, opacity: 1, transition: { delay: 1 } }}
      data-role={role}
    >
      <div className="flex gap-4 w-full">
        <div className="flex flex-col items-center">
          <div className="size-8 flex items-center rounded-full justify-center bg-muted border shrink-0">
            <SparklesIcon size={14} className="text-muted-foreground" />
          </div>
        </div>
        <div className="flex items-center gap-2 w-full min-w-0">
          <div className="flex gap-1">
            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.3s]" />
            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.15s]" />
            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
          </div>
          <span className="text-sm text-muted-foreground">Thinking...</span>
        </div>
      </div>
    </motion.div>
  );
};
