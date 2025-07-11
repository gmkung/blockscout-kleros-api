import { GraphQLClient } from "graphql-request";
import {
  GraphQLResponse,
  REGISTRY_ADDRESSES,
  VALID_STATUSES,
} from "../types/graphql";
import { Logger } from "pino";

/**
 * GraphQL client for querying the Curate Registry
 */
export class CurateGraphQLClient {
  private client: GraphQLClient;
  private readonly apiKey: string | undefined = process.env.CURATE_GRAPHQL_API_KEY;
  private endpoint: string = "https://api.studio.thegraph.com/query/61738/legacy-curate-gnosis/version/latest"
  private logger: Logger;
  
  constructor(logger: Logger) {
    this.logger = logger;
    if (this.apiKey && process.env.CURATE_GRAPHQL_API_URL) {
      // if API key is defined and the production API url, use the production endpoint
      this.endpoint = process.env.CURATE_GRAPHQL_API_URL;
      this.client = new GraphQLClient(this.endpoint, {headers: {"Authorization": `Bearer ${this.apiKey}`}});
    } else {
      this.client = new GraphQLClient(this.endpoint);
    }

    this.logger.info(`Using GraphQL endpoint: ${this.endpoint}`);
  }

  /**
   * Generates EIP155 address permutations from chains and addresses
   */
  generateEIP155Addresses(chains: string[], addresses: string[]): string[] {
    const eip155Addresses: string[] = [];

    for (const chainId of chains) {
      for (const address of addresses) {
        eip155Addresses.push(`eip155:${chainId}:${address}`);
      }
    }

    return eip155Addresses;
  }

  /**
   * Builds the GraphQL query for fetching data from all three registries
   */
  private buildQuery(eip155Addresses: string[]): string {
    const addressesArray = JSON.stringify(eip155Addresses);
    const statusFilter = JSON.stringify(VALID_STATUSES);

    return `
      {
        TagData: litems(
          where: {
            metadata_: { key0_in: ${addressesArray} }
            registry: "${REGISTRY_ADDRESSES.TAG_DATA}"
            status_in: ${statusFilter}
          }
        ) {
          latestRequestSubmissionTime
          metadata {
            key0
            key1
            key2
            key3
            props {
              value
              type
              label
              description
              isIdentifier
            }
          }
          id
          itemID
          registryAddress
          status
          disputed
        }

        TokenData: litems(
          where: {
            metadata_: { key0_in: ${addressesArray} }
            registry: "${REGISTRY_ADDRESSES.TOKEN_DATA}"
            status_in: ${statusFilter}
          }
        ) {
          latestRequestSubmissionTime
          metadata {
            key0
            key1
            key2
            key3
            props {
              value
              type
              label
              description
              isIdentifier
            }
          }
          id
          itemID
          registryAddress
          status
          disputed
        }

        CdnData: litems(
          where: {
            metadata_: { key0_in: ${addressesArray} }
            registry: "${REGISTRY_ADDRESSES.CDN_DATA}"
            status_in: ${statusFilter}
          }
        ) {
          latestRequestSubmissionTime
          metadata {
            key0
            key1
            key2
            key3
            props {
              value
              type
              label
              description
              isIdentifier
            }
          }
          id
          itemID
          registryAddress
          status
          disputed
        }
      }
    `;
  }

  /**
   * Queries the GraphQL endpoint for address tag data
   */
  async queryAddressData(
    chains: string[],
    addresses: string[]
  ): Promise<GraphQLResponse> {
    try {
      const eip155Addresses = this.generateEIP155Addresses(chains, addresses);
      const query = this.buildQuery(eip155Addresses);

      this.logger.debug(`Querying GraphQL with EIP155 addresses: ${eip155Addresses}`);

      const response = await this.client.request<GraphQLResponse>(query);
      return response;
    } catch (error) {
      this.logger.error(`GraphQL query failed: ${error}`);
      throw new Error(
        `Failed to fetch data from GraphQL endpoint: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }
}
