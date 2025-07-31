import type * as types from './types';
import type { ConfigOptions, FetchResponse } from 'api/dist/core'
import Oas from 'oas';
import APICore from 'api/dist/core';
import definition from './openapi.json';

class SDK {
  spec: Oas;
  core: APICore;

  constructor() {
    this.spec = Oas.init(definition);
    this.core = new APICore(this.spec, 'unleashnfts/1.0.0 (api/6.1.3)');
  }

  /**
   * Optionally configure various options that the SDK allows.
   *
   * @param config Object of supported SDK options and toggles.
   * @param config.timeout Override the default `fetch` request timeout of 30 seconds. This number
   * should be represented in milliseconds.
   */
  config(config: ConfigOptions) {
    this.core.setConfig(config);
  }

  /**
   * If the API you're using requires authentication you can supply the required credentials
   * through this method and the library will magically determine how they should be used
   * within your API request.
   *
   * With the exception of OpenID and MutualTLS, it supports all forms of authentication
   * supported by the OpenAPI specification.
   *
   * @example <caption>HTTP Basic auth</caption>
   * sdk.auth('username', 'password');
   *
   * @example <caption>Bearer tokens (HTTP or OAuth 2)</caption>
   * sdk.auth('myBearerToken');
   *
   * @example <caption>API Keys</caption>
   * sdk.auth('myApiKey');
   *
   * @see {@link https://spec.openapis.org/oas/v3.0.3#fixed-fields-22}
   * @see {@link https://spec.openapis.org/oas/v3.1.0#fixed-fields-22}
   * @param values Your auth credentials for the API; can specify up to two strings or numbers.
   */
  auth(...values: string[] | number[]) {
    this.core.setAuth(...values);
    return this;
  }

  /**
   * If the API you're using offers alternate server URLs, and server variables, you can tell
   * the SDK which one to use with this method. To use it you can supply either one of the
   * server URLs that are contained within the OpenAPI definition (along with any server
   * variables), or you can pass it a fully qualified URL to use (that may or may not exist
   * within the OpenAPI definition).
   *
   * @example <caption>Server URL with server variables</caption>
   * sdk.server('https://{region}.api.example.com/{basePath}', {
   *   name: 'eu',
   *   basePath: 'v14',
   * });
   *
   * @example <caption>Fully qualified server URL</caption>
   * sdk.server('https://eu.api.example.com/v14');
   *
   * @param url Server URL
   * @param variables An object of variables to replace into the server URL.
   */
  server(url: string, variables = {}) {
    this.core.setServer(url, variables);
  }

  /**
   * Gets information about the supported blockchains and their corresponding chain IDs.
   *
   *  The response includes:
   *
   *  - **data array**: A list of supported blockchains.
   *
   *  - **blockchain metadata**: Each item in the array contains details such as the
   * blockchain name and its associated chain ID.
   *
   *  This information provides an overview of the blockchains supported by the system, along
   * with their identifiers.
   *
   * @summary Retrieve Supported Blockchains
   */
  getBlockchains(metadata?: types.GetBlockchainsMetadataParam): Promise<FetchResponse<200, types.GetBlockchainsResponse200>> {
    return this.core.fetch('/blockchains', 'get', metadata);
  }

  /**
   * Get aggregated values and trend data for various NFT market metrics, offering insights
   * into the market's performance over time. 
   *
   * The response includes:
   *
   * - **metrics**: An array of metrics tracked, such as volume, number of sales, and
   * holders.
   *
   * - **blockdates**: An array of dates or time periods corresponding to each metric's data
   * points.
   *
   * - **metric values**: The aggregated values of each metric over the specified time
   * blocks.
   *
   * This information enables users to examine key trends and performance indicators in the
   * NFT market, helping them analyze market activity, growth, and fluctuations across
   * different metrics.
   *
   * @summary NFT Market Analytics Report
   */
  getNftMarketInsightsAnalytics(metadata?: types.GetNftMarketInsightsAnalyticsMetadataParam): Promise<FetchResponse<200, types.GetNftMarketInsightsAnalyticsResponse200>> {
    return this.core.fetch('/nft/market-insights/analytics', 'get', metadata);
  }

  /**
   * Gets the aggregated values and trends for holders' metrics in the NFT market. 
   *
   * The response includes:
   *
   * - **metrics**: An array of the different metrics being tracked for NFT holders.
   *
   * - **blockdates**: An array of dates or time blocks associated with each metric value.
   *
   * - **metric values**: The values of each metric, aggregated across the specified time
   * blocks or dates.
   *
   * This data enables tracking the performance and trends of NFT holders over time,
   * providing insights into market activity and trends.
   *
   * @summary NFT Holders Insights
   */
  getNftMarketInsightsHolders(metadata?: types.GetNftMarketInsightsHoldersMetadataParam): Promise<FetchResponse<200, types.GetNftMarketInsightsHoldersResponse200>> {
    return this.core.fetch('/nft/market-insights/holders', 'get', metadata);
  }

  /**
   * Gets aggregated values and trends for scores in the NFT market. 
   *
   * The response includes:
   *
   * - **metrics**: An array of scores or related metrics being tracked.
   *
   * - **blockdates**: An array of time periods or dates associated with each score.
   *
   * - **metric values**: The aggregated values of each score over the specified time blocks
   * or dates.
   *
   * This data allows users to track and analyze score trends in the NFT market over time.
   *
   * @summary NFT Scores Insights
   */
  getNftMarketInsightsScores(metadata?: types.GetNftMarketInsightsScoresMetadataParam): Promise<FetchResponse<200, types.GetNftMarketInsightsScoresResponse200>> {
    return this.core.fetch('/nft/market-insights/scores', 'get', metadata);
  }

  /**
   * Gets aggregated values and trends for trader metrics in the NFT market. 
   *
   * The response includes:
   *
   * - **metrics**: An array of trader-related metrics being tracked (e.g., number of trades,
   * volume, etc.).
   *
   * - **blockdates**: An array of time periods or dates linked to each metric.
   *
   * - **metric values**: The aggregated values for each trader metric over the corresponding
   * time blocks or dates.
   *
   * This data helps analyze the activity and trends of traders within the NFT market over
   * time.
   *
   * @summary NFT Traders Insights
   */
  getNftMarketInsightsTraders(metadata?: types.GetNftMarketInsightsTradersMetadataParam): Promise<FetchResponse<200, types.GetNftMarketInsightsTradersResponse200>> {
    return this.core.fetch('/nft/market-insights/traders', 'get', metadata);
  }

  /**
   * Gets aggregated values and trends for washtrade metrics in the NFT market. 
   *
   * The response includes:
   *
   * - **metrics**: An array of washtrade-related metrics being tracked.
   *
   * - **blockdates**: An array of time periods or dates linked to each metric.
   *
   * - **metric values**: The aggregated values for each washtrade metric over the
   * corresponding time blocks or dates.
   *
   * This data helps to analyze the trends and patterns of washtrading activities within the
   * NFT market.
   *
   * @summary NFT Washtrade Insights
   */
  getNftMarketInsightsWashtrade(metadata?: types.GetNftMarketInsightsWashtradeMetadataParam): Promise<FetchResponse<200, types.GetNftMarketInsightsWashtradeResponse200>> {
    return this.core.fetch('/nft/market-insights/washtrade', 'get', metadata);
  }

  /**
   * Retrieve metadata for all available marketplaces, providing comprehensive details about
   * each marketplace.
   *
   * The response includes:
   *
   * - **marketplace names**: The names of the available marketplaces.
   *
   * - **supported blockchains**: Blockchains supported by each marketplace.
   *
   * - **images**: Visual representations or logos of the marketplaces.
   *
   * - **external URLs**: Links to the marketplaces for additional information or direct
   * access.
   *
   * This data enables users to compare marketplaces, understand their offerings, and
   * identify the most suitable platforms for trading or exploring NFTs and digital assets.
   *
   * @summary NFT Marketplace Metadata
   */
  getNftMarketplaceMetadata(metadata?: types.GetNftMarketplaceMetadataMetadataParam): Promise<FetchResponse<200, types.GetNftMarketplaceMetadataResponse200>> {
    return this.core.fetch('/nft/marketplace/metadata', 'get', metadata);
  }

  /**
   * Retrieve detailed analytics and trend data for a specific marketplace, identified by its
   * chain ID and marketplace name.
   *
   * The response includes:
   *
   * - **trading volume**: Metrics on the total volume traded within the marketplace.
   *
   * - **transactions and transfers**: Data on the number of transactions and transfers over
   * time.
   *
   * - **sales trends**: Insights into sales patterns and trends within the marketplace.
   *
   * This information provides a comprehensive view of the marketplace's performance, user
   * engagement, and market dynamics. It helps users analyze growth patterns and overall
   * trends within the specified marketplace.
   *
   * @summary NFT Marketplace Analytics
   */
  getNftMarketplaceAnalytics(metadata: types.GetNftMarketplaceAnalyticsMetadataParam): Promise<FetchResponse<200, types.GetNftMarketplaceAnalyticsResponse200>> {
    return this.core.fetch('/nft/marketplace/analytics', 'get', metadata);
  }

  /**
   * Retrieve detailed metrics and trend data for all holders within a specific marketplace,
   * identified by its chain ID and marketplace name.
   *
   * The response includes:
   *
   * - **holder activity**: Insights into the activity of holders within the marketplace.
   *
   * - **unique holders**: Data on the number of unique holders.
   *
   * - **holder trends**: Changes in the number of holders over time.
   *
   * This information helps track ownership trends, understand asset concentration, and
   * analyze how the holder base within the marketplace evolves.
   *
   * @summary NFT Marketplace Holders
   */
  getNftMarketplaceHolders(metadata: types.GetNftMarketplaceHoldersMetadataParam): Promise<FetchResponse<200, types.GetNftMarketplaceHoldersResponse200>> {
    return this.core.fetch('/nft/marketplace/holders', 'get', metadata);
  }

  /**
   * Retrieve detailed metrics and trend data for all traders within a specific marketplace,
   * identified by its chain ID and marketplace name.
   *
   * The response includes:
   *
   * - **unique traders**: The number of distinct traders active within the marketplace.
   *
   * - **trader ratio**: The ratio of buyers to sellers within the marketplace.
   *
   * - **traders (buyers and sellers)**: Insights into the number of buyers and sellers.
   *
   * - **trader trends**: Changes in trader activity and metrics over time.
   *
   * This data helps analyze the marketplace's trading dynamics, track the performance of
   * active traders, and identify changes in trading patterns and engagement within the
   * marketplace.
   *
   * @summary NFT Marketplace Traders
   */
  getNftMarketplaceTraders(metadata: types.GetNftMarketplaceTradersMetadataParam): Promise<FetchResponse<200, types.GetNftMarketplaceTradersResponse200>> {
    return this.core.fetch('/nft/marketplace/traders', 'get', metadata);
  }

  /**
   * Retrieve detailed washtrade metrics and trend data for a specific marketplace,
   * identified by its chain ID and marketplace name.
   *
   * The response includes:
   *
   * - **washtrade volume**: The total volume suspected to involve wash trading.
   *
   * - **washtrade suspect sales**: The number of sales flagged as potential wash trades.
   *
   * - **washtrade suspect transactions**: The number of transactions identified as
   * suspicious.
   *
   * - **washtrade assets**: Assets involved in suspected wash trading activities.
   *
   * - **washtrade wallets**: Wallets flagged for potential involvement in wash trading.
   *
   * This information helps assess the integrity of the marketplace's trading environment,
   * providing transparency into wash trading trends and identifying any red flags in trading
   * behavior within the marketplace.
   *
   * @summary NFT Marketplace Washtrade
   */
  getNftMarketplaceWashtrade(metadata: types.GetNftMarketplaceWashtradeMetadataParam): Promise<FetchResponse<200, types.GetNftMarketplaceWashtradeResponse200>> {
    return this.core.fetch('/nft/marketplace/washtrade', 'get', metadata);
  }

  /**
   * Retrieve metadata for a specific NFT collection using the provided contract address or
   * slug name and chain ID, offering detailed insights into the collection's attributes.
   *
   * The response includes:
   *
   * - **collection name**: The name of the NFT collection.
   *
   * - **description**: A detailed description of the NFT collection.
   *
   * - **key properties**: Metadata information about the collection's key attributes.
   *
   * This information helps users understand the characteristics and details of specific NFT
   * collections based on contract or slug name and blockchain identifiers.
   *
   * @summary Collection Metadata
   */
  getNftCollectionMetadata(metadata: types.GetNftCollectionMetadataMetadataParam): Promise<FetchResponse<200, types.GetNftCollectionMetadataResponse200>> {
    return this.core.fetch('/nft/collection/metadata', 'get', metadata);
  }

  /**
   * Get list of NFT holders for the given contract_address or collection name
   *
   * @summary Collection Owner
   */
  getNftCollectionOwner(metadata: types.GetNftCollectionOwnerMetadataParam): Promise<FetchResponse<200, types.GetNftCollectionOwnerResponse200>> {
    return this.core.fetch('/nft/collection/owner', 'get', metadata);
  }

  /**
   * Retrieve detailed metrics and trend data for a specific NFT collection using its
   * contract address and chain ID, providing insights into performance over time.
   *
   * The response includes:
   *
   * - **time-based trends**: Insights into various metrics over time, such as:
   *   - **sales volume**: Total sales volume within the collection.
   *   - **transaction count**: The number of transactions over time.
   *   - **floor price usd**: The lowest listed sale price of an  NFT in USD on a marketplace
   * at a given time..
   *
   * This information helps users observe patterns like increases or decreases in sales,
   * trading volumes, and price changes, enabling analysis of market dynamics and performance
   * trends for the specified NFT collection.
   *
   * @summary Collection Analytics
   */
  getNftCollectionAnalytics(metadata: types.GetNftCollectionAnalyticsMetadataParam): Promise<FetchResponse<200, types.GetNftCollectionAnalyticsResponse200>> {
    return this.core.fetch('/nft/collection/analytics', 'get', metadata);
  }

  /**
   * Get detailed information about the holders of a specific collection, identified by its
   * contract address and chain ID. 
   *
   * The response includes:
   *
   * - **holder distribution metrics**: Data on the distribution of tokens across holders.
   *   
   * - **holder count changes**: Metrics that track changes in the number of holders.
   *
   * - **ownership trends**: Trends in ownership over time.
   *
   * This information allows users to analyze holder-related metrics, providing insights into
   * token distribution and ownership dynamics for the collection.
   *
   * @summary Collection Holders
   */
  getNftCollectionHolders(metadata: types.GetNftCollectionHoldersMetadataParam): Promise<FetchResponse<200, types.GetNftCollectionHoldersResponse200>> {
    return this.core.fetch('/nft/collection/holders', 'get', metadata);
  }

  /**
   * Get detailed metrics and trends for the scores associated with a specific collection. 
   *
   * The "score" typically refers to various performance indicators or rankings used to
   * assess the collection's performance in terms of:
   *
   * - **trading**: Metrics related to trading activity and volume.
   *   
   * - **popularity**: Indicators of the collection's popularity and engagement.
   *   
   * - **other factors**: Such as rarity, liquidity, and additional performance aspects.
   *
   * The response allows users to monitor the collection's market activity, user engagement,
   * and overall success within the ecosystem.
   *
   * @summary Collection Scores
   */
  getNftCollectionScores(metadata: types.GetNftCollectionScoresMetadataParam): Promise<FetchResponse<200, types.GetNftCollectionScoresResponse200>> {
    return this.core.fetch('/nft/collection/scores', 'get', metadata);
  }

  /**
   * Get detailed insights into the traders associated with a collection, identified by its
   * contract address and chain ID.
   *
   * The response includes:
   *
   * - **unique trader metrics**: Data on the number of unique traders involved with the
   * collection.
   *
   * - **sellers and buyers**: Metrics tracking the number of sellers and buyers over time.
   *
   * - **trading trends**: Trends that show how actively the collection is being traded and
   * how trader behavior evolves.
   *
   * This information provides valuable insights into trading activity and trader behavior
   * associated with the collection.
   *
   * @summary Collection Traders
   */
  getNftCollectionTraders(metadata: types.GetNftCollectionTradersMetadataParam): Promise<FetchResponse<200, types.GetNftCollectionTradersResponse200>> {
    return this.core.fetch('/nft/collection/traders', 'get', metadata);
  }

  /**
   * Get detailed information on washtrading metrics for a specific NFT collection,
   * identified by its contract address and chain ID.
   *
   * The response includes:
   *
   * - **washtrading trends**: Tracking of washtrading metrics over time.
   *
   * - **metric values**: View values of various washtrading metrics.
   *
   * - **data integrity insights**: Detect any potential manipulation in the trading data.
   *
   * This information helps in identifying and analyzing washtrading activities associated
   * with the collection.
   *
   * @summary Collection Washtrade
   */
  getNftCollectionWashtrade(metadata: types.GetNftCollectionWashtradeMetadataParam): Promise<FetchResponse<200, types.GetNftCollectionWashtradeResponse200>> {
    return this.core.fetch('/nft/collection/washtrade', 'get', metadata);
  }

  /**
   * Get detailed insights into the whale metrics for a specific NFT collection, identified
   * by its contract address and chain ID.
   *
   * The response includes:
   *
   * - **whale count**: The number of whales holding or trading the collection.
   *
   * - **whale activities**: Metrics tracking the activities of whales within the collection.
   *
   * - **activity trends**: Trends showing changes in whale involvement over time.
   *
   * This information provides valuable insights into the influence of large holders on the
   * collection.
   *
   * @summary Collection Whales
   */
  getNftCollectionWhales(metadata: types.GetNftCollectionWhalesMetadataParam): Promise<FetchResponse<200, types.GetNftCollectionWhalesResponse200>> {
    return this.core.fetch('/nft/collection/whales', 'get', metadata);
  }

  /**
   * Get detailed insights into the profile metrics for a specific NFT collection, identified
   * by its contract address and chain ID.
   *
   * The response includes:
   *
   * - **active profiles**: Metrics related to the number of active user profiles within the
   * collection.
   *
   * - **profile engagement**: Data on user engagement and interaction levels within the
   * collection.
   *
   * - **profile growth trends**: Trends in profile growth that impact trading and ownership
   * dynamics.
   *
   * This information provides a comprehensive view of user behavior and engagement within
   * the collection.
   *
   * @summary Collection Profile
   */
  getNftCollectionProfile(metadata: types.GetNftCollectionProfileMetadataParam): Promise<FetchResponse<200, types.GetNftCollectionProfileResponse200>> {
    return this.core.fetch('/nft/collection/profile', 'get', metadata);
  }

  /**
   * Get metadata information for the collection based on the selected category.
   *
   * The response includes:
   *
   * - **collection metadata**: Details of all metadata within the specified category.
   *
   * This information provides a comprehensive view of the collection's metadata categorized
   * by the selected criteria.
   *
   * @summary Collection Categories
   */
  getNftCollectionCategories(metadata: types.GetNftCollectionCategoriesMetadataParam): Promise<FetchResponse<200, types.GetNftCollectionCategoriesResponse200>> {
    return this.core.fetch('/nft/collection/categories', 'get', metadata);
  }

  /**
   * This endpoint is commonly used to retrieve the traits of assets in a collection.
   * Results are sorted alphabetically by trait type, and then by count of assets with each
   * distinct value for that trait type, in descending order
   *
   * @summary Collection Traits
   */
  getNftCollectionTraits(metadata: types.GetNftCollectionTraitsMetadataParam): Promise<FetchResponse<200, types.GetNftCollectionTraitsResponse200>> {
    return this.core.fetch('/nft/collection/traits', 'get', metadata);
  }

  /**
   * Retrieve detailed analytics on value and trends for a specific wallet, identified by its
   * address and chain ID.
   *
   * The response includes:
   *
   * - **sales**: Metrics related to sales activity associated with the wallet.
   *
   * - **transactions**: Data on the number of transactions over time.
   *
   * - **transfers**: Insights into asset transfers involving the wallet.
   *
   * - **trend analysis**: Analysis of activity trends and performance over time.
   *
   * This information provides a comprehensive view of the wallet’s activity, asset growth,
   * and performance trends, helping users understand its financial dynamics within the
   * blockchain network.
   *
   * @summary Wallet Analytics
   */
  getNftWalletAnalytics(metadata: types.GetNftWalletAnalyticsMetadataParam): Promise<FetchResponse<200, types.GetNftWalletAnalyticsResponse200>> {
    return this.core.fetch('/nft/wallet/analytics', 'get', metadata);
  }

  /**
   * Retrieve detailed analytics on score values and trends for a specific wallet, identified
   * by its address and chain ID.
   *
   * The response includes:
   *
   * - **score metrics**: Various performance scores associated with the wallet over time.
   *
   * - **trend analysis**: Insights into trends in the wallet’s score, showing changes and
   * patterns.
   *
   * - **relative standing**: An overview of the wallet’s position and interaction within the
   * blockchain ecosystem.
   *
   * This information provides a comprehensive view of the wallet’s performance, highlighting
   * score trends and its role in the blockchain network.
   *
   * @summary Wallet Scores
   */
  getNftWalletScores(metadata: types.GetNftWalletScoresMetadataParam): Promise<FetchResponse<200, types.GetNftWalletScoresResponse200>> {
    return this.core.fetch('/nft/wallet/scores', 'get', metadata);
  }

  /**
   * Retrieve detailed metrics on trader activity and trends for a specific wallet,
   * identified by its address and chain ID.
   *
   * The response includes:
   *
   * - **trading behavior**: Data on the wallet’s trading activities.
   *
   * - **number of traders**: The count of unique traders interacting with the wallet.
   *
   * - **trader ratio**: The ratio of buyers to sellers associated with the wallet.
   *
   * - **traders (buyers and sellers)**: Insights into the number of buyers and sellers
   * linked to the wallet.
   *
   * - **trader trends**: Changes in trading metrics over time.
   *
   * This information helps users analyze the wallet’s role and activity within the trading
   * ecosystem, offering insights into its performance as a trader and trends in its market
   * engagement.
   *
   * @summary Wallet Traders
   */
  getNftWalletTraders(metadata: types.GetNftWalletTradersMetadataParam): Promise<FetchResponse<200, types.GetNftWalletTradersResponse200>> {
    return this.core.fetch('/nft/wallet/traders', 'get', metadata);
  }

  /**
   * Retrieve detailed metrics on washtrading activity and trends for a specific wallet,
   * identified by its address and chain ID.
   *
   * The response includes:
   *
   * - **washtrade volume**: The total volume suspected to involve wash trading.
   *
   * - **washtrade suspect sales**: The number of sales flagged as potential wash trades.
   *
   * - **washtrade suspect transactions**: The number of transactions identified as
   * suspicious.
   *
   * - **washtrade assets**: Assets involved in suspected wash trading activities.
   *
   * - **washtrade wallets**: Wallets flagged for potential involvement in wash trading.
   *
   * This information helps users assess the integrity of the wallet's trading behavior,
   * providing transparency into wash trading trends and identifying any potential red flags
   * in the wallet’s activity.
   *
   * @summary Wallet Washtrade
   */
  getNftWalletWashtrade(metadata: types.GetNftWalletWashtradeMetadataParam): Promise<FetchResponse<200, types.GetNftWalletWashtradeResponse200>> {
    return this.core.fetch('/nft/wallet/washtrade', 'get', metadata);
  }

  /**
   * Retrieve comprehensive profiling information for a specific wallet, including contract
   * details, NFT holdings, and insights related to notable holders, such as sharks, whales,
   * and any sanctioned entities.
   *
   * The response includes:
   *
   * - **contract addresses and metadata**: Details of NFTs held by the wallet, including
   * contract addresses and associated metadata.
   *
   * - **notable holder classifications**: Identification of significant holders based on
   * asset size, such as sharks and whales.
   *
   * - **sanctioned wallet flags**: Indications of any associations with wallets flagged for
   * sanctions.
   *
   * This data provides a detailed view of the wallet’s contents and associations, offering
   * insights into ownership concentration, asset types, and potential compliance
   * considerations.
   *
   * @summary Wallet Profile
   */
  getNftWalletProfile(metadata?: types.GetNftWalletProfileMetadataParam): Promise<FetchResponse<200, types.GetNftWalletProfileResponse200>> {
    return this.core.fetch('/nft/wallet/profile', 'get', metadata);
  }

  /**
   * Retrieve metadata for a specific NFT using the provided contract address or slug name,
   * token ID and chain ID, offering detailed insights into the collection's attributes.
   *
   * The response includes:
   *
   * - **collection name**: The name of the NFT collection.
   *
   * - **description**: A detailed description of the NFT collection.
   *
   * - **key properties**: Metadata information about the collection's key attributes.
   *
   * This information helps users understand the characteristics and details of specific NFT
   * Token based on contract or slug name and blockchain identifiers.
   *
   * @summary NFT Metadata
   */
  getNftMetadata(metadata: types.GetNftMetadataMetadataParam): Promise<FetchResponse<200, types.GetNftMetadataResponse200>> {
    return this.core.fetch('/nft/metadata', 'get', metadata);
  }

  /**
   * Get comprehensive list of wallets/wallet details of the current holders/holders of NFT
   * from a specified smart contract
   *
   * @summary NFT Owner
   */
  getNftOwner(metadata: types.GetNftOwnerMetadataParam): Promise<FetchResponse<200, types.GetNftOwnerResponse200>> {
    return this.core.fetch('/nft/owner', 'get', metadata);
  }

  /**
   * Get detailed analytics for a specific NFT, identified by its contract address, token ID,
   * and chain ID.
   *
   * The response includes:
   *
   * - **performance tracking**: Analytics to monitor the performance of the NFT.
   *
   * - **market dynamics**: Insights into the market activity and trends surrounding the NFT.
   *
   * This information provides a comprehensive view of the NFT's performance and market
   * behavior.
   *
   * @summary NFT Analytics
   */
  getNftAnalytics(metadata: types.GetNftAnalyticsMetadataParam): Promise<FetchResponse<200, types.GetNftAnalyticsResponse200>> {
    return this.core.fetch('/nft/analytics', 'get', metadata);
  }

  /**
   * Get detailed metrics about scores and holders for a specific NFT, identified by its
   * contract address, token ID, and chain ID.
   *
   * The response includes:
   *
   * - **score insights**: Detailed metrics about various performance scores for the
   * specified NFT.
   *
   * - **trending status**: Identification of trending NFTs within the collection.
   *
   * - **holder insights**: Detailed metrics about the holders of the specified NFT.
   *
   *
   * This information helps assess the NFT's performance and popularity within the market.
   *
   * @summary NFT Scores
   */
  getNftScores(metadata: types.GetNftScoresMetadataParam): Promise<FetchResponse<200, types.GetNftScoresResponse200>> {
    return this.core.fetch('/nft/scores', 'get', metadata);
  }

  /**
   * Get detailed insights into trader metrics specifically for an NFT, identified by its
   * contract address, token ID, and chain ID.
   *
   * The response includes:
   *
   * - **trader interactions**: Insights into trader metrics surrounding the specified NFT.
   *
   * - **trader engagement**: Data tracking how traders are interacting with the NFT over
   * time.
   *
   * This information helps analyze trading activity and trader engagement for the individual
   * NFT.
   *
   * @summary NFT Traders
   */
  getNftTraders(metadata: types.GetNftTradersMetadataParam): Promise<FetchResponse<200, types.GetNftTradersResponse200>> {
    return this.core.fetch('/nft/traders', 'get', metadata);
  }

  /**
   * Get detailed metrics about wash trading for a specific NFT, identified by its contract
   * address, token ID, and chain ID.
   *
   * The response includes:
   *
   * - **wash trading insights**: Metrics to assess wash trading activity for the specified
   * NFT.
   *
   * - **market manipulation detection**: Identification of potential market manipulation
   * indicators.
   *
   * - **transparency and integrity**: Data to ensure transparency and integrity in the
   * trading of the NFT.
   *
   * This information helps monitor wash trading practices, promoting a fair and transparent
   * NFT market.
   *
   * @summary NFT Washtrade
   */
  getNftWashtrade(metadata: types.GetNftWashtradeMetadataParam): Promise<FetchResponse<200, types.GetNftWashtradeResponse200>> {
    return this.core.fetch('/nft/washtrade', 'get', metadata);
  }

  /**
   * get nft top deals
   *
   * @summary NFT Top Deals
   */
  getNftTop_deals(metadata: types.GetNftTopDealsMetadataParam): Promise<FetchResponse<200, types.GetNftTopDealsResponse200>> {
    return this.core.fetch('/nft/top_deals', 'get', metadata);
  }

  /**
   * Get the detailed list of Listing transactions executed by the wallet
   *
   * @summary NFT Listing
   */
  getNftListing(metadata: types.GetNftListingMetadataParam): Promise<FetchResponse<200, types.GetNftListingResponse200>> {
    return this.core.fetch('/nft/listing', 'get', metadata);
  }

  /**
   * Get detailed information on the game contracts
   *
   * @summary NFT supported game
   */
  getNftGamingMetrics(metadata: types.GetNftGamingMetricsMetadataParam): Promise<FetchResponse<200, types.GetNftGamingMetricsResponse200>> {
    return this.core.fetch('/nft/gaming/metrics', 'get', metadata);
  }

  /**
   * Game-Specific Smart Contracts
   * Each NFT game interacts with the blockchain through one or more smart contracts (e.g.,
   * for game items, currencies, staking, or reward systems).
   *
   * Contract-Level Analysis
   * Instead of looking at the game as a whole, metrics are broken down by individual
   * contracts to track how each component is performing.
   *
   * The response includes:
   *  Active Users: Number of unique wallet addresses interacting with the contract.
   *  Transaction Volume: Total number and value of transactions over time.
   *  Earnings / Revenue: Average earnings or rewards distributed via the contract.
   *  Token/NFT Movements: Transfers, minting, and burning of game-related assets.
   *
   *  Chain-Specific Context
   *  Contracts are tied to specific blockchains (e.g., Ethereum, Polygon), and metrics may
   * vary across networks.
   *  These insights helps game developers, analysts, and investors to understand which game
   * features or systems are most used or profitable.
   *
   * @summary NFT gaming metrics by contract
   */
  getNftGamingContractMetrics(metadata: types.GetNftGamingContractMetricsMetadataParam): Promise<FetchResponse<200, types.GetNftGamingContractMetricsResponse200>> {
    return this.core.fetch('/nft/gaming/contract/metrics', 'get', metadata);
  }

  /**
   * Game-Level Metrics are aggregated across all contracts and features associated with a
   * specific NFT game to provide a holistic view of performance.
   *
   * Metrics Includes:
   * Active Users (DAU): Number of unique wallets interacting with any part of the game
   * daily.
   * Transaction Volume: Total value of NFT or token trades within the game ecosystem.
   * Revenue / Earnings Trends: Average earnings per user or total rewards distributed.
   * Chrun rate/ Engagement rate: Helps gauge user growth and stickiness to a game.
   *
   * Multi-Chain Visibility across ethereum, polygon, binance, avalanche, linea, base metrics
   * can be segmented or aggregated per blockchain.
   *
   * These insights helps, developers to improve features based on usage trends, investors to
   * assess project traction and value,  players to understand economic dynamics and
   * potential ROI,
   * researchers/analysts to track trends across the NFT gaming ecosystem.
   *
   * @summary NFT gaming metrics by game
   */
  getNftGamingCollectionMetrics(metadata: types.GetNftGamingCollectionMetricsMetadataParam): Promise<FetchResponse<200, types.GetNftGamingCollectionMetricsResponse200>> {
    return this.core.fetch('/nft/gaming/collection/metrics', 'get', metadata);
  }

  /**
   * Retrieve a paginated and sorted list of NFT transactions, providing detailed information
   * about each transaction.
   *
   * The response includes:
   *
   * - **blockchain details**: Information about the blockchain and chain ID.
   *
   * - **collection information**: Collection name, contract address, and contract creation
   * date.
   *
   * - **transaction details**:
   *   - **contract type**: Type of contract (e.g., ERC721).
   *   - **transaction hash**: Unique identifier for the transaction.
   *   - **wash trade status**: Indicator of potential wash trading.
   *   - **marketplace**: Marketplace involved, if applicable.
   *   - **receiving and sending addresses**: Wallet addresses of the sender and receiver.
   *   - **sale price (USD)**: Sale price converted to USD.
   *   - **transaction timestamp**: Date and time of the transaction.
   *   - **token ID**: Identifier for the NFT involved in the transaction.
   *   - **transaction type**: Type of transaction (e.g., "mint","transfer","burn").
   *
   * This data provides a comprehensive view of transaction activity for specified NFT
   * collections, 
   * supporting analysis of trading patterns, value transfers, and ownership changes within
   * the blockchain ecosystem.
   *
   * **You can query this API using any one of the following parameters**:
   *
   *   - **wallet address**: Returns all transactions where the wallet is the sender or
   * receiver. Useful for analyzing a user’s transaction history.
   *   - **contract address**: Returns all transactions for a specific NFT collection.
   *   - **token id + contract address**: Returns the complete transaction history for a
   * specific NFT asset within the collection.
   *   - **transaction hash**: Retrieves detailed information about a specific transaction.
   *
   * **Note**: If multiple parameters are provided, the API treats them with OR logic and
   * returns combined results from all matching queries.
   *
   * @summary NFT Transactions
   */
  getNftTransactions(metadata: types.GetNftTransactionsMetadataParam): Promise<FetchResponse<200, types.GetNftTransactionsResponse200>> {
    return this.core.fetch('/nft/transactions', 'get', metadata);
  }

  /**
   * Get the floor price of each collection across marketplace
   *
   * @summary NFT Floor Price
   */
  getNftFloor_price(metadata: types.GetNftFloorPriceMetadataParam): Promise<FetchResponse<200, types.GetNftFloorPriceResponse200>> {
    return this.core.fetch('/nft/floor_price', 'get', metadata);
  }

  /**
   * Retrieve the predicted price details for a specific NFT within the requested collection.
   *
   * The response includes:
   *
   * - **rarity sales**: Metrics related to the NFT's rarity and its impact on predicted
   * sales.
   *
   * - **collection drivers**: Key factors influencing the collection's value.
   *
   * - **additional metrics**: Other relevant data points supporting the price prediction.
   *
   * This information provides insights into the predicted market value of the NFT based on
   * rarity, collection trends, and key metrics.
   *
   * @summary NFT Token Price Estimate
   */
  getNftLiquifyPrice_estimate(metadata: types.GetNftLiquifyPriceEstimateMetadataParam): Promise<FetchResponse<200, types.GetNftLiquifyPriceEstimateResponse200>> {
    return this.core.fetch('/nft/liquify/price_estimate', 'get', metadata);
  }

  /**
   * Retrieve the predicted price details for the requested NFT collection and specific NFT.
   *
   * The response includes:
   *
   * - **collection price prediction**: Estimated market value for the overall collection.
   *
   * - **NFT-specific price prediction**: Predicted price for the individual NFT within the
   * collection.
   *
   * This information provides insights into the expected market performance of both the
   * collection as a whole and the specified NFT.
   *
   * @summary NFT Liquify collection Price Estimate
   */
  getNftLiquifyCollectionPrice_estimate(metadata: types.GetNftLiquifyCollectionPriceEstimateMetadataParam): Promise<FetchResponse<200, types.GetNftLiquifyCollectionPriceEstimateResponse200>> {
    return this.core.fetch('/nft/liquify/collection/price_estimate', 'get', metadata);
  }

  /**
   * Retrieve comprehensive metadata for supported collections with price predictions
   * generated by our AI model.
   *
   * The response includes:
   *
   * - **collection metadata**: Detailed information about each collection for which price
   * predictions are available.
   *
   * This information provides users with an overview of the collections supported by the AI
   * model for price prediction.
   *
   * @summary NFT Liquify Supported Collections
   */
  getNftLiquifyCollectionSupported_collections(metadata: types.GetNftLiquifyCollectionSupportedCollectionsMetadataParam): Promise<FetchResponse<200, types.GetNftLiquifyCollectionSupportedCollectionsResponse200>> {
    return this.core.fetch('/nft/liquify/collection/supported_collections', 'get', metadata);
  }

  /**
   * Retrieve detailed metrics for a specific NFT brand or category, providing aggregated
   * performance insights across collections, contracts, and trading activity.
   *
   * The response includes:
   *
   * - **brand & collection info**: Brand name, category, blockchain, chain ID, collection
   * names, contract addresses, total assets, and number of contracts.
   *
   * - **market metrics**: Market cap, total trading volume, and per-marketplace volume
   * (e.g., OpenSea, Blur).
   *
   * - **revenue data**: Minting, primary and secondary sales, royalties, and total revenue.
   *
   * - **user & trading activity**: Number of holders, interactions, growth rate, retained
   * traders.
   *
   * - **trade performance**: Profitable vs. loss-making trades, and associated volumes.
   *
   * This API enables a high-level analysis of brand performance and trading behavior across
   * the NFT ecosystem, supporting research into brand engagement, monetization, and
   * collector loyalty.
   *
   * **You can query this API using one or both of the following filters**:
   * - **brand**: Filters metrics for a specific NFT brand (e.g., Nike).
   * - **category**: Filters metrics by the brands industry segment (e.g., Fashion).
   *
   * **Note:** 
   * - If both parameters are provided, the API returns data only when the brand belongs to
   * the specified category; otherwise, the response will be empty.
   * - If only one parameter is provided, results are filtered based on that single
   * parameter.
   *
   * @summary NFT Brand Metrics
   */
  getNftBrandMetrics(metadata: types.GetNftBrandMetricsMetadataParam): Promise<FetchResponse<200, types.GetNftBrandMetricsResponse200>> {
    return this.core.fetch('/nft/brand/metrics', 'get', metadata);
  }

  /**
   * Retrieve detailed contract metrics for an NFT brand, offering specific insights into
   * contract-level performance and activity.
   *
   * The response includes:
   *
   * - **contract details**: Number of contracts, total assets, blockchain, brand name, chain
   * ID, and associated collection and contract addresses.
   *
   * - **performance metrics**:
   *   - **growth rate**: Contract growth over time.
   *   - **number of holders**: Total count of NFT holders.
   *   - **user interactions**: Engagement metrics related to user interactions.
   *   - **marketplace volumes**: Volume traded across marketplaces.
   *   - **market capitalization**: Valuation of assets under the brand's contracts.
   *   - **minting revenue**: Revenue from minting activities.
   *   - **primary and secondary sale revenues**: Earnings from initial and secondary sales.
   *   - **retained traders**: Number of repeat traders.
   *   - **royalty revenue**: Revenue generated from royalties.
   *   - **total revenue**: Overall revenue associated with the brand's contracts.
   *   - **total volume**: Aggregate trading volume.
   *   - **number of traders**: Count of unique traders.
   *
   * This information provides a granular view of the brand's contract-level activity,
   * financial performance, and trading dynamics within the NFT market.
   *
   * @summary NFT Brand contract metrics
   */
  getNftBrandContract_metrics(metadata: types.GetNftBrandContractMetricsMetadataParam): Promise<FetchResponse<200, types.GetNftBrandContractMetricsResponse200>> {
    return this.core.fetch('/nft/brand/contract_metrics', 'get', metadata);
  }

  /**
   * Retrieve a detailed overview of token balances held by a specified address,
   * including essential blockchain details such as the network name, chain ID, and contract
   * address.
   * This ensures clarity on the source of the data.
   *
   * For each token, the response provides key metrics, including the token name,
   * symbol, and decimal precision. It also includes the quantity held by the address,
   * offering insight into token ownership. By incorporating these details,
   * the response enables a better understanding of the tokens nature and distribution.
   *
   * @summary Token Balance
   */
  getTokenBalance(metadata?: types.GetTokenBalanceMetadataParam): Promise<FetchResponse<200, types.GetTokenBalanceResponse200>> {
    return this.core.fetch('/token/balance', 'get', metadata);
  }

  /**
   * Retrieve key metrics and metadata for a specified token, offering insights into its
   * market performance,
   * liquidity, and activity. The response includes essential details such as the token
   * address, name, symbol,
   * blockchain, and chain ID, ensuring clarity and verification of its origin.
   *
   * The data provides analytical scores evaluating various aspects of the token, including
   * age, holder distribution, 
   * liquidity pool participation, market capitalization, trading activity, and
   * profitability.
   * Additionally, it includes real-time and historical metrics such as 24-hour and all-time
   * trading volume, current price,
   * total and circulating supply, number of holders, and market cap.
   *
   * @summary Token Metrics
   */
  getTokenMetrics(metadata?: types.GetTokenMetricsMetadataParam): Promise<FetchResponse<200, types.GetTokenMetricsResponse200>> {
    return this.core.fetch('/token/metrics', 'get', metadata);
  }

  /**
   * Retrieve a list of the top token holders, detailing their ownership and distribution. 
   * The response includes key blockchain details such as the network name, chain ID, and
   * contract address for clarity.
   *
   * For each holder, the data provides the wallet address, token balance, and quantity held.
   * Additionally, it includes token-specific details like the name, symbol, decimal
   * precision, and contract address, offering insight into token distribution and holder
   * concentration.
   *
   * @summary Token Holders
   */
  getTokenHolders(metadata?: types.GetTokenHoldersMetadataParam): Promise<FetchResponse<200, types.GetTokenHoldersResponse200>> {
    return this.core.fetch('/token/holders', 'get', metadata);
  }

  /**
   * Retrieve a list of token transactions, sorted by the most recent activity. Each
   * transaction includes key details such as sender and receiver addresses,
   * timestamp, token address, transaction hash, and the transferred amount in both native
   * units and USD (if available).
   *
   * This data helps track token movements, analyze trading activity, and assess liquidity
   * trends, supporting research, portfolio tracking, and market analysis.
   *
   * @summary Token Transfers
   */
  getTokenTransfers(metadata?: types.GetTokenTransfersMetadataParam): Promise<FetchResponse<200, types.GetTokenTransfersResponse200>> {
    return this.core.fetch('/token/transfers', 'get', metadata);
  }

  /**
   * Retrieve a token price prediction with key market indicators and volatility trends. The
   * response includes an estimated price range with upper and lower bounds to assess
   * potential movements.
   *
   * Key metrics cover price estimate, volatility trends, Bitcoin and Ethereum influence, and
   * trading volume trends.
   * Blockchain details, including token address and symbol, ensure clarity. This data helps
   * investors and traders analyze price trends, risks, and market conditions effectively.
   *
   * @summary Token Price Prediction
   */
  getTokenPrice_prediction(metadata?: types.GetTokenPricePredictionMetadataParam): Promise<FetchResponse<200, types.GetTokenPricePredictionResponse200>> {
    return this.core.fetch('/token/price_prediction', 'get', metadata);
  }

  /**
   * Retrieve the USD price of an ERC-20 token from decentralized exchanges (DEXs). 
   * The response provides real-time pricing data, ensuring accurate valuation based on the
   * latest market activity.
   *
   * Key metrics include the tokens price in USD, trading volume, liquidity depth, and
   * relevant blockchain details such as token address and symbol. 
   * This data helps investors, traders, and analysts assess market value, track price
   * fluctuations, and make informed trading decisions.
   *
   * @summary Token Dex Price
   */
  getTokenDex_price(metadata: types.GetTokenDexPriceMetadataParam): Promise<FetchResponse<200, types.GetTokenDexPriceResponse200>> {
    return this.core.fetch('/token/dex_price', 'get', metadata);
  }

  /**
   * Get token price forecast
   *
   * @summary Token Price Forecast
   */
  getTokenPrice_forecast(metadata?: types.GetTokenPriceForecastMetadataParam): Promise<FetchResponse<200, types.GetTokenPriceForecastResponse200>> {
    return this.core.fetch('/token/price_forecast', 'get', metadata);
  }

  /**
   * Get ERC20 token historcial price in USD
   *
   * @summary Token Historical Price
   */
  getTokenHistorical_price(metadata: types.GetTokenHistoricalPriceMetadataParam): Promise<FetchResponse<200, types.GetTokenHistoricalPriceResponse200>> {
    return this.core.fetch('/token/historical_price', 'get', metadata);
  }

  /**
   * This endpoint provides OHLC (Open, High, Low, Close) token prices
   *
   * @summary Token Historical Price OHLC
   */
  getTokenOhlc_price(metadata: types.GetTokenOhlcPriceMetadataParam): Promise<FetchResponse<200, types.GetTokenOhlcPriceResponse200>> {
    return this.core.fetch('/token/ohlc_price', 'get', metadata);
  }

  /**
   * Get token price hourly
   *
   * @summary Token Price Hourly
   */
  getTokenPrice_hourly(metadata?: types.GetTokenPriceHourlyMetadataParam): Promise<FetchResponse<200, types.GetTokenPriceHourlyResponse200>> {
    return this.core.fetch('/token/price_hourly', 'get', metadata);
  }

  /**
   * Retrieve a comprehensive overview of a decentralized exchange (DEX) liquidity pool by
   * passing the pair address, including key metrics such as liquidity composition, 
   * ownership percentage, ranking, and relevant details. 
   *
   * The response provides blockchain details, chain ID, deployment date, and deployer
   * address, ensuring clarity on which network and protocol the data is sourced from.
   * For each pair address, the response includes pool type, protocol, token reserves, and
   * liquidity details, enabling insight into the pools structure and trading activity. 
   * It also lists the deployed date, deployer address, and token specifications, providing a
   * complete overview of the liquidity pool.
   *
   * @summary DeFi Pool Metadata
   */
  getDefiPoolMetadata(metadata?: types.GetDefiPoolMetadataMetadataParam): Promise<FetchResponse<200, types.GetDefiPoolMetadataResponse200>> {
    return this.core.fetch('/defi/pool/metadata', 'get', metadata);
  }

  /**
   * Retrieve a comprehensive overview of a decentralized exchange (DEX) liquidity pool by
   * passing the pair address, including key metrics such as total value locked (TVL), 
   * token reserves, trading volume, and transaction activity. 
   *
   * The response provides blockchain details, protocol name, and pair address, ensuring
   * clarity on which network and platform the data is sourced from.
   * For each pair address, the response includes token reserves, token prices, liquidity
   * share, and transaction history, enabling insight into the pools liquidity and trading
   * performance. 
   * It also lists the total transaction count, volume changes over different timeframes, and
   * historical trading data, providing a complete overview of the liquidity pools activity
   * and market impact.
   *
   * @summary DeFi Pool Metrics
   */
  getDefiPoolMetrics(metadata?: types.GetDefiPoolMetricsMetadataParam): Promise<FetchResponse<200, types.GetDefiPoolMetricsResponse200>> {
    return this.core.fetch('/defi/pool/metrics', 'get', metadata);
  }

  /**
   * Retrieve a comprehensive overview of a decentralized exchange (DEX) liquidity pool by
   * passing the pair address, including key metrics such as deployment details, 
   * protocol version, and token specifications. 
   *
   * The response provides blockchain details, chain ID, deployed date, and deployer address,
   * ensuring clarity on which network and protocol the data is sourced from.
   * For each pair address, the response includes protocol version, token details, and
   * contract information, enabling insight into the liquidity pool's structure and the
   * assets involved. 
   * It also lists the token names, symbols, decimals, and contract addresses, providing a
   * complete overview of the liquidity pool within the specified protocol.
   *
   * @summary DeFi Protocol Metadata
   */
  getDefiPool(metadata?: types.GetDefiPoolMetadataParam): Promise<FetchResponse<200, types.GetDefiPoolResponse200>> {
    return this.core.fetch('/defi/pool', 'get', metadata);
  }

  /**
   * Retrieve a comprehensive overview of the supported decentralized exchange (DEX)
   * protocols for a particular blockchain network. 
   *
   * The response provides a list of protocols supported by a specific blockchain , ensuring
   * clarity on which protocols are available for trading and liquidity provision on that
   * network.
   * For each blockchain, the response includes the name of the protocol(s) supported,
   * providing insights into the diversity of DeFi platforms available for users on that
   * blockchain. 
   * This data helps users identify and choose the right platform for liquidity provision,
   * trading, or yield farming within a given blockchain ecosystem.
   *
   * @summary DeFi Supported Protocols
   */
  getDefiPoolSupported_protocols(metadata?: types.GetDefiPoolSupportedProtocolsMetadataParam): Promise<FetchResponse<200, types.GetDefiPoolSupportedProtocolsResponse200>> {
    return this.core.fetch('/defi/pool/supported_protocols', 'get', metadata);
  }

  /**
   * Retrieve a comprehensive view of decentralized exchange (DEX) swap and transfer activity
   * by providing any one of several identifiers,
   * including wallet address, token address, transaction hash, or liquidity pair address. 
   * This API delivers enriched transactional data across various DEX protocols.
   *
   * The response includes blockchain and chain ID details to ensure clarity on the source
   * network.
   * For each match, the API provides transaction direction (sender/receiver), token flow
   * (token in/out), transaction hash, pool address, 
   * and token metadata offering insight into asset movement, trading behavior, and liquidity
   * routing.
   *
   * **This API allows querying swap and transfer data using any one of the following
   * parameters**:
   *
   *   - **wallet address**: Returns all swaps and transfers involving the specified wallet.
   *   - **token address**: Retrieves transactions where the token appears as either input or
   * output.
   *   - **transaction hash**: Fetches detailed information for a specific swap transaction.
   *   - **pair address**: Returns all transactions involving a specific liquidity pool.
   *
   * **Note**: If multiple parameters are provided, the API treats them with OR logic and
   * returns combined results from all matching queries.
   *
   * @summary DeFi Swaps and Transfers
   */
  getDefiTransfers(metadata?: types.GetDefiTransfersMetadataParam): Promise<FetchResponse<200, types.GetDefiTransfersResponse200>> {
    return this.core.fetch('/defi/transfers', 'get', metadata);
  }

  /**
   * Retrieve a comprehensive overview of a wallets DeFi portfolio, including key metrics
   * such as token holdings, 
   * blockchain details, and asset quantities. 
   *
   * The response provides wallet address, blockchain name, chain ID, and token details,
   * ensuring clarity on which network and assets the wallet holds.
   * For each wallet address, the response includes token address, token name, symbol,
   * decimal precision, and quantity held, enabling insight into the wallets DeFi asset
   * composition. 
   * It also lists the blockchain network and chain ID, providing a complete overview of the
   * wallets portfolio across supported DeFi platforms.
   *
   * @summary DeFi Portfolio
   */
  getWalletBalanceDefi(metadata: types.GetWalletBalanceDefiMetadataParam): Promise<FetchResponse<200, types.GetWalletBalanceDefiResponse200>> {
    return this.core.fetch('/wallet/balance/defi', 'get', metadata);
  }

  /**
   * Retrieve a comprehensive overview of a wallets NFT holdings, including key metrics such
   * as collection details, 
   * contract type, token ID, and quantity owned. 
   *
   * The response provides blockchain details, chain ID, contract address, and collection
   * information, ensuring clarity on which network and NFT assets the wallet holds.
   * For each wallet address, the response includes NFT contract type, token ID, quantity
   * held, and collection address, enabling insight into the wallets NFT portfolio. 
   * It also lists the blockchain network and chain ID, providing a complete overview of the
   * wallets NFT holdings across supported ecosystems.
   *
   * @summary NFT Portfolio
   */
  getWalletBalanceNft(metadata: types.GetWalletBalanceNftMetadataParam): Promise<FetchResponse<200, types.GetWalletBalanceNftResponse200>> {
    return this.core.fetch('/wallet/balance/nft', 'get', metadata);
  }

  /**
   * Retrieve a comprehensive overview of a wallets ERC-20 token holdings, including key
   * metrics such as token details, 
   * quantity owned, and blockchain information. 
   *
   * The response provides wallet address, blockchain name, chain ID, and token contract
   * address, ensuring clarity on which network and assets the wallet holds.
   * For each wallet address, the response includes token name, symbol, decimal precision,
   * and quantity held, enabling insight into the wallets ERC-20 asset composition. 
   * It also lists the blockchain network and chain ID, providing a complete overview of the
   * wallets token portfolio across supported ecosystems.
   *
   * @summary ERC20 Portfolio
   */
  getWalletBalanceToken(metadata: types.GetWalletBalanceTokenMetadataParam): Promise<FetchResponse<200, types.GetWalletBalanceTokenResponse200>> {
    return this.core.fetch('/wallet/balance/token', 'get', metadata);
  }

  /**
   * Retrieve a comprehensive overview of a wallets classification and associated risk
   * factors, including key metrics such as activity type, 
   * security status, and protocol involvement. 
   *
   * The response provides wallet address, blockchain details, and chain ID, ensuring clarity
   * on which network the wallet operates on.
   * For each wallet address, the response includes labels indicating whether the wallet is
   * associated with DeFi, exchanges, lending, NFTs, MEV, mining, scams, hacks, or illicit
   * activities, enabling insight into the wallets purpose and risk profile. 
   * It also lists risk categories, scam involvement, and contract interactions, providing a
   * complete overview of the wallet’s behavioral patterns within the ecosystem.
   *
   * @summary Wallet label
   */
  getWalletLabel(metadata: types.GetWalletLabelMetadataParam): Promise<FetchResponse<200, types.GetWalletLabelResponse200>> {
    return this.core.fetch('/wallet/label', 'get', metadata);
  }

  /**
   * Retrieve a comprehensive overview of a wallets activity and risk assessment, including
   * key metrics such as interaction patterns, 
   * classification, and risk scores. 
   *
   * The response provides wallet address, blockchain details, chain ID, and classification
   * type, ensuring clarity on the wallet's status within the network.
   * For each wallet address, the response includes anomalous pattern score, associated token
   * score, risk interaction score, and wallet age score, enabling insight into the wallets
   * behavior and reliability. 
   * It also lists interaction scores related to smart contracts, staking, governance, and
   * centralized platforms, providing a complete evaluation of the wallets overall activity
   * and potential risks.
   *
   * @summary Wallet Score
   */
  getWalletScore(metadata: types.GetWalletScoreMetadataParam): Promise<FetchResponse<200, types.GetWalletScoreResponse200>> {
    return this.core.fetch('/wallet/score', 'get', metadata);
  }

  /**
   * Retrieve a comprehensive overview of a wallets transactional activity, including key
   * metrics such as transaction volume, 
   * inflow/outflow data, and wallet age. 
   *
   * The response provides wallet address, start timestamp, and blockchain activity details,
   * ensuring clarity on the wallets usage and movement of funds.
   * For each wallet address, the response includes the number of incoming and outgoing
   * transactions, inflow and outflow amounts (in ETH and USD), total transaction count, and
   * gas usage, enabling insight into the wallets financial activity. 
   * It also lists the number of unique inflow and outflow addresses, providing a complete
   * overview of the wallets transaction behavior and movement patterns within the network.
   *
   * @summary Wallet Metrics
   */
  getWalletMetrics(metadata: types.GetWalletMetricsMetadataParam): Promise<FetchResponse<200, types.GetWalletMetricsResponse200>> {
    return this.core.fetch('/wallet/metrics', 'get', metadata);
  }
}

const createSDK = (() => { return new SDK(); })()
;

export default createSDK;

export type { GetBlockchainsMetadataParam, GetBlockchainsResponse200, GetDefiPoolMetadataMetadataParam, GetDefiPoolMetadataParam, GetDefiPoolMetadataResponse200, GetDefiPoolMetricsMetadataParam, GetDefiPoolMetricsResponse200, GetDefiPoolResponse200, GetDefiPoolSupportedProtocolsMetadataParam, GetDefiPoolSupportedProtocolsResponse200, GetDefiTransfersMetadataParam, GetDefiTransfersResponse200, GetNftAnalyticsMetadataParam, GetNftAnalyticsResponse200, GetNftBrandContractMetricsMetadataParam, GetNftBrandContractMetricsResponse200, GetNftBrandMetricsMetadataParam, GetNftBrandMetricsResponse200, GetNftCollectionAnalyticsMetadataParam, GetNftCollectionAnalyticsResponse200, GetNftCollectionCategoriesMetadataParam, GetNftCollectionCategoriesResponse200, GetNftCollectionHoldersMetadataParam, GetNftCollectionHoldersResponse200, GetNftCollectionMetadataMetadataParam, GetNftCollectionMetadataResponse200, GetNftCollectionOwnerMetadataParam, GetNftCollectionOwnerResponse200, GetNftCollectionProfileMetadataParam, GetNftCollectionProfileResponse200, GetNftCollectionScoresMetadataParam, GetNftCollectionScoresResponse200, GetNftCollectionTradersMetadataParam, GetNftCollectionTradersResponse200, GetNftCollectionTraitsMetadataParam, GetNftCollectionTraitsResponse200, GetNftCollectionWashtradeMetadataParam, GetNftCollectionWashtradeResponse200, GetNftCollectionWhalesMetadataParam, GetNftCollectionWhalesResponse200, GetNftFloorPriceMetadataParam, GetNftFloorPriceResponse200, GetNftGamingCollectionMetricsMetadataParam, GetNftGamingCollectionMetricsResponse200, GetNftGamingContractMetricsMetadataParam, GetNftGamingContractMetricsResponse200, GetNftGamingMetricsMetadataParam, GetNftGamingMetricsResponse200, GetNftLiquifyCollectionPriceEstimateMetadataParam, GetNftLiquifyCollectionPriceEstimateResponse200, GetNftLiquifyCollectionSupportedCollectionsMetadataParam, GetNftLiquifyCollectionSupportedCollectionsResponse200, GetNftLiquifyPriceEstimateMetadataParam, GetNftLiquifyPriceEstimateResponse200, GetNftListingMetadataParam, GetNftListingResponse200, GetNftMarketInsightsAnalyticsMetadataParam, GetNftMarketInsightsAnalyticsResponse200, GetNftMarketInsightsHoldersMetadataParam, GetNftMarketInsightsHoldersResponse200, GetNftMarketInsightsScoresMetadataParam, GetNftMarketInsightsScoresResponse200, GetNftMarketInsightsTradersMetadataParam, GetNftMarketInsightsTradersResponse200, GetNftMarketInsightsWashtradeMetadataParam, GetNftMarketInsightsWashtradeResponse200, GetNftMarketplaceAnalyticsMetadataParam, GetNftMarketplaceAnalyticsResponse200, GetNftMarketplaceHoldersMetadataParam, GetNftMarketplaceHoldersResponse200, GetNftMarketplaceMetadataMetadataParam, GetNftMarketplaceMetadataResponse200, GetNftMarketplaceTradersMetadataParam, GetNftMarketplaceTradersResponse200, GetNftMarketplaceWashtradeMetadataParam, GetNftMarketplaceWashtradeResponse200, GetNftMetadataMetadataParam, GetNftMetadataResponse200, GetNftOwnerMetadataParam, GetNftOwnerResponse200, GetNftScoresMetadataParam, GetNftScoresResponse200, GetNftTopDealsMetadataParam, GetNftTopDealsResponse200, GetNftTradersMetadataParam, GetNftTradersResponse200, GetNftTransactionsMetadataParam, GetNftTransactionsResponse200, GetNftWalletAnalyticsMetadataParam, GetNftWalletAnalyticsResponse200, GetNftWalletProfileMetadataParam, GetNftWalletProfileResponse200, GetNftWalletScoresMetadataParam, GetNftWalletScoresResponse200, GetNftWalletTradersMetadataParam, GetNftWalletTradersResponse200, GetNftWalletWashtradeMetadataParam, GetNftWalletWashtradeResponse200, GetNftWashtradeMetadataParam, GetNftWashtradeResponse200, GetTokenBalanceMetadataParam, GetTokenBalanceResponse200, GetTokenDexPriceMetadataParam, GetTokenDexPriceResponse200, GetTokenHistoricalPriceMetadataParam, GetTokenHistoricalPriceResponse200, GetTokenHoldersMetadataParam, GetTokenHoldersResponse200, GetTokenMetricsMetadataParam, GetTokenMetricsResponse200, GetTokenOhlcPriceMetadataParam, GetTokenOhlcPriceResponse200, GetTokenPriceForecastMetadataParam, GetTokenPriceForecastResponse200, GetTokenPriceHourlyMetadataParam, GetTokenPriceHourlyResponse200, GetTokenPricePredictionMetadataParam, GetTokenPricePredictionResponse200, GetTokenTransfersMetadataParam, GetTokenTransfersResponse200, GetWalletBalanceDefiMetadataParam, GetWalletBalanceDefiResponse200, GetWalletBalanceNftMetadataParam, GetWalletBalanceNftResponse200, GetWalletBalanceTokenMetadataParam, GetWalletBalanceTokenResponse200, GetWalletLabelMetadataParam, GetWalletLabelResponse200, GetWalletMetricsMetadataParam, GetWalletMetricsResponse200, GetWalletScoreMetadataParam, GetWalletScoreResponse200 } from './types';
