import { GraphQLClient } from "graphql-request";
import {
  GraphQLResponse,
  EnvioGraphQLResponse,
  REGISTRY_ADDRESSES,
  VALID_STATUSES,
  EndpointType,
  LItem,
  EnvioLItem,
} from "../types/graphql";
import { Logger } from "pino";
import { ethers } from "ethers";

/**
 * GraphQL client for querying the Curate Registry
 */
export class CurateGraphQLClient {
  private client: GraphQLClient;
  private readonly apiKey: string | undefined =
    process.env.CURATE_GRAPHQL_API_KEY;
  private endpoint: string;
  private endpointType: EndpointType;
  private logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger;

    // Determine endpoint type from environment variable
    this.endpointType =
      (process.env.GRAPHQL_ENDPOINT_TYPE?.toLowerCase() as EndpointType) ||
      "thegraph";

    if (this.endpointType === "thegraph") {
      if (!this.apiKey) {
        throw new Error(
          "CURATE_GRAPHQL_API_KEY environment variable is required for The Graph endpoint"
        );
      }
      this.endpoint = `https://gateway.thegraph.com/api/${this.apiKey}/subgraphs/id/9hHo5MpjpC1JqfD3BsgFnojGurXRHTrHWcUcZPPCo6m8`;
    } else if (this.endpointType === "envio") {
      // Envio endpoint doesn't require API key
      this.endpoint =
        process.env.ENVIO_ENDPOINT ||
        "https://indexer.hyperindex.xyz/1a2f51c/v1/graphql";
    } else {
      throw new Error(
        `Invalid GRAPHQL_ENDPOINT_TYPE: ${this.endpointType}. Must be 'thegraph' or 'envio'`
      );
    }

    this.logger.info(`Using ${this.endpointType} endpoint: ${this.endpoint}`);
    this.client = new GraphQLClient(this.endpoint);
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
   * Builds the GraphQL query for The Graph endpoint
   */
  private buildTheGraphQuery(eip155Addresses: string[]): string {
    // Generate proper checksummed addresses using ethers library
    const checksummedAddresses = eip155Addresses.map((addr) => {
      const parts = addr.split(":");
      if (parts.length >= 3) {
        const chainId = parts[1];
        const address = parts[2];
        try {
          // Force proper checksumming by converting to lowercase first, then checksumming
          const checksummed = ethers.getAddress(address.toLowerCase());
          return `eip155:${chainId}:${checksummed}`;
        } catch (error) {
          // If checksumming fails, return original
          return addr;
        }
      }
      return addr;
    });

    const allCaseVariations = [
      ...checksummedAddresses, // Proper checksummed case
      ...eip155Addresses.map((addr) => addr.toLowerCase()), // Lowercase
    ];
    const addressesArray = JSON.stringify(allCaseVariations);
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
   * Builds the GraphQL query for Envio (Hasura) endpoint
   */
  private buildEnvioQuery(eip155Addresses: string[]): string {
    // Generate proper checksummed addresses using ethers library
    const checksummedAddresses = eip155Addresses.map((addr) => {
      const parts = addr.split(":");
      if (parts.length >= 3) {
        const chainId = parts[1];
        const address = parts[2];
        try {
          // Force proper checksumming by converting to lowercase first, then checksumming
          const checksummed = ethers.getAddress(address.toLowerCase());
          return `eip155:${chainId}:${checksummed}`;
        } catch (error) {
          // If checksumming fails, return original
          return addr;
        }
      }
      return addr;
    });

    const allCaseVariations = [
      ...checksummedAddresses, // Proper checksummed case
      ...eip155Addresses.map((addr) => addr.toLowerCase()), // Lowercase
    ];
    const addressesArray = JSON.stringify(allCaseVariations);
    const statusFilter = JSON.stringify(VALID_STATUSES);

    return `
      {
        TagData: LItem(
          where: {
            key0: { _in: ${addressesArray} }
            registryAddress: { _eq: "${REGISTRY_ADDRESSES.TAG_DATA}" }
            status: { _in: ${statusFilter} }
          }
          limit: 1000
        ) {
          latestRequestSubmissionTime
          key0
          key1
          key2
          key3
          props {
            value

            label
            description
            isIdentifier
          }
          id
          itemID
          registryAddress
          status
          disputed
        }

        TokenData: LItem(
          where: {
            key0: { _in: ${addressesArray} }
            registryAddress: { _eq: "${REGISTRY_ADDRESSES.TOKEN_DATA}" }
            status: { _in: ${statusFilter} }
          }
          limit: 1000
        ) {
          latestRequestSubmissionTime
          key0
          key1
          key2
          key3
          props {
            value

            label
            description
            isIdentifier
          }
          id
          itemID
          registryAddress
          status
          disputed
        }

        CdnData: LItem(
          where: {
            key0: { _in: ${addressesArray} }
            registryAddress: { _eq: "${REGISTRY_ADDRESSES.CDN_DATA}" }
            status: { _in: ${statusFilter} }
          }
          limit: 1000
        ) {
          latestRequestSubmissionTime
          key0
          key1
          key2
          key3
          props {
            value

            label
            description
            isIdentifier
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
   * Builds the GraphQL query based on endpoint type
   */
  private buildQuery(eip155Addresses: string[]): string {
    if (this.endpointType === "envio") {
      return this.buildEnvioQuery(eip155Addresses);
    }
    return this.buildTheGraphQuery(eip155Addresses);
  }

  /**
   * Normalizes Envio response to The Graph format for compatibility
   */
  private normalizeEnvioResponse(
    envioResponse: EnvioGraphQLResponse
  ): GraphQLResponse {
    const normalize = (items: EnvioLItem[]): LItem[] => {
      return items.map((item) => ({
        latestRequestSubmissionTime: item.latestRequestSubmissionTime,
        id: item.id,
        metadata: {
          key0: item.key0,
          key1: item.key1,
          key2: item.key2,
          key3: item.key3,
          props: item.props,
        },
        itemID: item.itemID,
        registryAddress: item.registryAddress,
        status: item.status,
        disputed: item.disputed,
      }));
    };

    return {
      TagData: normalize(envioResponse.TagData || []),
      TokenData: normalize(envioResponse.TokenData || []),
      CdnData: normalize(envioResponse.CdnData || []),
    };
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

      this.logger.debug(
        `Querying ${this.endpointType} GraphQL with EIP155 addresses: ${eip155Addresses.join(", ")}`
      );

      if (this.endpointType === "envio") {
        const envioResponse =
          await this.client.request<EnvioGraphQLResponse>(query);
        // Normalize Envio response to The Graph format for compatibility
        return this.normalizeEnvioResponse(envioResponse);
      } else {
        const response = await this.client.request<GraphQLResponse>(query);
        return response;
      }
    } catch (error) {
      this.logger.error(`GraphQL query failed: ${error}`);
      throw new Error(
        `Failed to fetch data from ${this.endpointType} GraphQL endpoint: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }
}
