'use client';

import React, { useState } from 'react';
import { ExternalLink, Copy, Check } from 'lucide-react';

interface NFTMetadataProps {
  result: any;
  toolCallId: string;
}

export const NFTMetadataTool: React.FC<NFTMetadataProps> = ({
  result,
  toolCallId,
}) => {
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
  const [expandedCollection, setExpandedCollection] = useState<string | null>(
    null
  );

  const collections = result.collections || [];
  const pagination = result.pagination || {};

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedAddress(`${type}-${text}`);
      setTimeout(() => setCopiedAddress(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      arts: 'bg-purple-100 text-purple-800',
      avatar: 'bg-blue-100 text-blue-800',
      collectibles: 'bg-green-100 text-green-800',
      games: 'bg-orange-100 text-orange-800',
      metaverse: 'bg-pink-100 text-pink-800',
      utility: 'bg-gray-100 text-gray-800',
      music: 'bg-red-100 text-red-800',
      others: 'bg-yellow-100 text-yellow-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div key={toolCallId} className="bg-card border rounded-lg p-4 shadow-sm">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-2">
          <div>
            <h4 className="font-semibold text-foreground text-sm">
              NFT Collection Metadata
            </h4>
            <p className="text-xs text-muted-foreground mt-0.5">
              Collection details and marketplace information
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
              <div className="text-muted-foreground mb-1">Collections</div>
              <div className="font-medium">{collections.length}</div>
            </div>
            <div className="bg-muted rounded-md p-2">
              <div className="text-muted-foreground mb-1">Total Items</div>
              <div className="font-medium">
                {pagination.totalItems || 'N/A'}
              </div>
            </div>
            <div className="bg-muted rounded-md p-2">
              <div className="text-muted-foreground mb-1">Time Range</div>
              <div className="font-medium capitalize">
                {result.metadata?.timeRange || 'All'}
              </div>
            </div>
            <div className="bg-muted rounded-md p-2">
              <div className="text-muted-foreground mb-1">Sort Order</div>
              <div className="font-medium capitalize">
                {result.metadata?.sortOrder || 'Desc'}
              </div>
            </div>
          </div>

          {/* Collections List */}
          <div className="space-y-3">
            {collections.map((collection: any, index: number) => (
              <div
                key={collection.collectionId || index}
                className="border rounded-lg p-3 bg-muted/30"
              >
                <div className="flex items-start gap-3">
                  {/* Collection Image */}
                  {collection.imageUrl && (
                    <div className="flex-shrink-0">
                      <img
                        src={collection.imageUrl}
                        alt={collection.collection}
                        className="w-12 h-12 rounded-lg object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  )}

                  {/* Collection Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <h5 className="font-medium text-sm text-foreground truncate">
                          {collection.collection}
                        </h5>
                        <div className="flex items-center gap-2 mt-1">
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(collection.category)}`}
                          >
                            {collection.category}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {collection.contractType}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() =>
                          setExpandedCollection(
                            expandedCollection === collection.collectionId
                              ? null
                              : collection.collectionId
                          )
                        }
                        className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {expandedCollection === collection.collectionId
                          ? 'Less'
                          : 'More'}
                      </button>
                    </div>

                    {/* Contract Address */}
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs text-muted-foreground">
                        Contract:
                      </span>
                      <code className="text-xs bg-background px-2 py-0.5 rounded font-mono">
                        {truncateAddress(collection.contractAddress)}
                      </code>
                      <button
                        onClick={() =>
                          copyToClipboard(
                            collection.contractAddress,
                            'contract'
                          )
                        }
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {copiedAddress ===
                        `contract-${collection.contractAddress}` ? (
                          <Check size={12} />
                        ) : (
                          <Copy size={12} />
                        )}
                      </button>
                    </div>

                    {/* Basic Stats */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-muted-foreground">NFTs: </span>
                        <span className="font-medium">
                          {formatNumber(collection.distinctNftCount)}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">
                          Token Range:{' '}
                        </span>
                        <span className="font-medium">
                          {collection.startTokenId}-{collection.endTokenId}
                        </span>
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {expandedCollection === collection.collectionId && (
                      <div className="mt-3 pt-3 border-t space-y-2">
                        {collection.description && (
                          <div>
                            <span className="text-xs text-muted-foreground block mb-1">
                              Description:
                            </span>
                            <p className="text-xs text-foreground leading-relaxed">
                              {collection.description.length > 200
                                ? `${collection.description.substring(0, 200)}...`
                                : collection.description}
                            </p>
                          </div>
                        )}

                        {/* External Links */}
                        <div className="flex flex-wrap gap-2">
                          {collection.externalUrl && (
                            <a
                              href={collection.externalUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 transition-colors"
                            >
                              <ExternalLink size={10} />
                              Website
                            </a>
                          )}
                          {collection.discordUrl && (
                            <a
                              href={collection.discordUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs text-purple-600 hover:text-purple-800 transition-colors"
                            >
                              <ExternalLink size={10} />
                              Discord
                            </a>
                          )}
                          {collection.instagramUrl && (
                            <a
                              href={collection.instagramUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs text-pink-600 hover:text-pink-800 transition-colors"
                            >
                              <ExternalLink size={10} />
                              Instagram
                            </a>
                          )}
                        </div>

                        {/* Marketplace Info */}
                        {collection.marketplaceInfo &&
                          typeof collection.marketplaceInfo === 'object' && (
                            <div>
                              <span className="text-xs text-muted-foreground block mb-1">
                                Marketplace:
                              </span>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-medium capitalize">
                                  {collection.marketplaceInfo.marketplace}
                                </span>
                                {collection.marketplaceInfo.marketplace_url && (
                                  <a
                                    href={
                                      collection.marketplaceInfo.marketplace_url
                                    }
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 transition-colors"
                                  >
                                    <ExternalLink size={10} />
                                    View
                                  </a>
                                )}
                              </div>
                            </div>
                          )}

                        {/* Creation Date */}
                        <div>
                          <span className="text-xs text-muted-foreground">
                            Created:{' '}
                          </span>
                          <span className="text-xs font-medium">
                            {new Date(
                              collection.contractCreatedDate
                            ).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Info */}
          {pagination.totalItems > pagination.limit && (
            <div className="mt-4 text-xs text-muted-foreground text-center">
              Showing {pagination.offset + 1}-
              {Math.min(
                pagination.offset + pagination.limit,
                pagination.totalItems
              )}{' '}
              of {pagination.totalItems} collections
              {pagination.hasNext && ' • More results available'}
            </div>
          )}
        </>
      ) : (
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
          <p className="text-sm text-muted-foreground">
            {result.message || 'Failed to load collection metadata'}
          </p>
        </div>
      )}
    </div>
  );
};
