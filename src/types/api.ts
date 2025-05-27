/**
 * API Request and Response Types
 */

export interface AddressTagRequest {
  chains: string[];     // A list of EVM chain ids
  addresses: string[];  // A list of addresses with '0x' prefix
}

export interface TokenAttributes {
  logo_url: string;
  token_symbol: string;
  decimals: number;
}

export interface AddressTag {
  chain_id: string;
  project_name: string;
  name_tag: string;
  public_note: string;
  website_link: string;
  verified_domains: string[];
  token_attributes: TokenAttributes | null; // Optional token attributes if an address is a token
}

export interface AddressTagResponse {
  addresses: {
    [address: string]: AddressTag[];
  }[];
}

/**
 * Error Response Types
 */
export interface ErrorResponse {
  error: string;
  message: string;
  statusCode: number;
}

/**
 * API Response wrapper
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ErrorResponse;
} 