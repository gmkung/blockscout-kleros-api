import { AddressTagRequest, AddressTagResponse } from '../types/api';
import { CurateGraphQLClient } from './graphqlClient';
import { DataMapper } from './dataMapper';

/**
 * Service class for handling address tag operations
 */
export class AddressTagService {
  private graphqlClient: CurateGraphQLClient;
  private dataMapper: DataMapper;

  constructor() {
    this.graphqlClient = new CurateGraphQLClient();
    this.dataMapper = new DataMapper();
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
      console.error('Error fetching address tags:', error);
      throw error;
    }
  }



  /**
   * Validates business logic constraints
   */
  validateRequest(request: AddressTagRequest): { isValid: boolean; error?: string } {
    // Add any business logic validation here
    if (request.addresses.length > 100) {
      return {
        isValid: false,
        error: 'Maximum 100 addresses allowed per request'
      };
    }

    if (request.chains.length > 50) {
      return {
        isValid: false,
        error: 'Maximum 50 chains allowed per request'
      };
    }

    return { isValid: true };
  }
} 