/**
 * GraphQL Response Types for the Curate Registry
 */

export interface PropData {
  value: string;
  type: string;
  label: string;
  description: string;
  isIdentifier: boolean;
}

export interface MetaData {
  key0: string;
  key1: string;
  key2: string;
  key3: string;
  props: PropData[];
}

export interface LItem {
  latestRequestSubmissionTime: string;
  id: string;
  metadata: MetaData;
  itemID: string;
  registryAddress: string;
  status: string;
  disputed: boolean;
}

export interface GraphQLResponse {
  TagData: LItem[];
  TokenData: LItem[];
  CdnData: LItem[];
}

/**
 * Registry addresses for the three different data sources
 */
export const REGISTRY_ADDRESSES = {
  TAG_DATA: "0x66260c69d03837016d88c9877e61e08ef74c59f2",
  TOKEN_DATA: "0xee1502e29795ef6c2d60f8d7120596abe3bad990",
  CDN_DATA: "0x957a53a994860be4750810131d9c876b2f52d6e1"
} as const;

/**
 * Valid status values for filtering
 */
export const VALID_STATUSES = ["Registered", "ClearingRequested"] as const; 