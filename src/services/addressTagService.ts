import { AddressTagRequest, AddressTagResponse } from '../types/api';
import { CurateGraphQLClient } from './graphqlClient';
import { DataMapper } from './dataMapper';
import { Logger } from 'pino'; // Import the Logger type

/**
 * Service class for handling address tag operations
 */
export class AddressTagService {
  private graphqlClient: CurateGraphQLClient;
  private dataMapper: DataMapper;
  private logger: Logger;

  constructor(logger: Logger) {
    this.graphqlClient = new CurateGraphQLClient(logger);
    this.dataMapper = new DataMapper();
    this.logger = logger;
  }

  /**
   * Retrieves address tags for the given request using GraphQL
   */
  async getAddressTags(request: AddressTagRequest): Promise<AddressTagResponse> {
    const { chains, addresses } = request;
    
    try {
      // Query GraphQL endpoint
      const graphqlResponse = await this.graphqlClient.queryAddressData(chains, addresses);
      
      // Map response to AddressTag format
      const mappedAddresses = this.dataMapper.mapResponseToAddressTags(
        graphqlResponse,
        chains,
        addresses
      );

      return {
        addresses: mappedAddresses
      };
    } catch (error) {
      this.logger.error({ err: error }, 'Error fetching address tags');
      throw error;
    }
  }

  /**
   * Validates business logic constraints
   */
  validateRequest(request: AddressTagRequest): { isValid: boolean; error?: string } {
    if (request.addresses.length > 100) {
      this.logger.warn(`Request contains ${request.addresses.length} addresses, exceeding limit of 100`);
      return {
        isValid: false,
        error: 'Maximum 100 addresses allowed per request'
      };
    }

    if (request.chains.length > 50) {
      this.logger.warn(`Request contains ${request.chains.length} chains, exceeding limit of 50`);  
      return {
        isValid: false,
        error: 'Maximum 50 chains allowed per request'
      };
    }

    return { isValid: true };
  }
}