import { AddressTag, TokenAttributes } from '../types/api';
import { LItem, PropData, GraphQLResponse } from '../types/graphql';

/**
 * Service for mapping GraphQL response data to AddressTag format
 */
export class DataMapper {
  /**
   * Finds a prop value by label from the props array
   */
  private findPropValue(props: PropData[], label: string): string {
    const prop = props.find(p => p.label === label);
    return prop?.value || '';
  }

  /**
   * Gets the latest item for a specific EIP155 address from an array of items
   */
  private getLatestItem(items: LItem[], eip155Address: string): LItem | null {
    const matchingItems = items.filter(item => item.metadata.key0 === eip155Address);
    
    if (matchingItems.length === 0) {
      return null;
    }

    // Sort by latestRequestSubmissionTime (descending) and return the first (latest)
    return matchingItems.sort((a, b) => 
      parseInt(b.latestRequestSubmissionTime) - parseInt(a.latestRequestSubmissionTime)
    )[0];
  }

  /**
   * Gets all items for a specific EIP155 address from an array of items
   */
  private getAllItems(items: LItem[], eip155Address: string): LItem[] {
    return items.filter(item => item.metadata.key0 === eip155Address);
  }

  /**
   * Maps TagData to address tag fields
   */
  private mapTagData(tagItem: LItem | null): Partial<AddressTag> {
    if (!tagItem) {
      return {
        project_name: '',
        name_tag: '',
        public_note: '',
        website_link: ''
      };
    }

    const props = tagItem.metadata.props;
    
    return {
      project_name: this.findPropValue(props, 'Project Name'),
      name_tag: this.findPropValue(props, 'Public Name Tag'),
      public_note: this.findPropValue(props, 'Public Note'),
      website_link: this.findPropValue(props, 'UI/Website Link')
    };
  }

  /**
   * Maps CdnData to verified domains - collects all valid entries
   */
  private mapCdnData(cdnItems: LItem[]): string[] {
    const domains: string[] = [];
    
    for (const item of cdnItems) {
      const domainName = this.findPropValue(item.metadata.props, 'Domain name');
      if (domainName && !domains.includes(domainName)) {
        domains.push(domainName);
      }
    }
    
    return domains;
  }

  /**
   * Maps TokenData to token attributes
   */
  private mapTokenData(tokenItem: LItem | null): TokenAttributes | null {
    if (!tokenItem) {
      return null;
    }

    const props = tokenItem.metadata.props;
    const logoValue = this.findPropValue(props, 'Logo');
    const symbolValue = this.findPropValue(props, 'Symbol');
    const decimalsValue = this.findPropValue(props, 'Decimals');

    // Only return token attributes if we have at least symbol and decimals
    if (!symbolValue || !decimalsValue) {
      return null;
    }

    // Convert IPFS path to full URL if needed
    let logoUrl = logoValue;
    if (logoValue.startsWith('/ipfs/')) {
      logoUrl = `https://ipfs.io${logoValue}`;
    }

    return {
      logo_url: logoUrl,
      token_symbol: symbolValue,
      decimals: parseInt(decimalsValue, 10) || 0
    };
  }

  /**
   * Extracts chain ID from EIP155 address format
   */
  private extractChainId(eip155Address: string): string {
    const parts = eip155Address.split(':');
    return parts.length >= 2 ? parts[1] : '';
  }

  /**
   * Extracts regular address from EIP155 address format
   */
  private extractAddress(eip155Address: string): string {
    const parts = eip155Address.split(':');
    return parts.length >= 3 ? parts[2] : '';
  }

  /**
   * Maps GraphQL response to AddressTag format
   */
  mapResponseToAddressTags(
    response: GraphQLResponse,
    originalChains: string[],
    originalAddresses: string[]
  ): { [address: string]: AddressTag[] }[] {
    const result: { [address: string]: AddressTag[] }[] = [];

    // Process each original address
    for (const address of originalAddresses) {
      const addressTags: AddressTag[] = [];

      // Process each chain for this address
      for (const chainId of originalChains) {
        const eip155Address = `eip155:${chainId}:${address}`;

        // Get the latest item from each registry for this EIP155 address
        const latestTagItem = this.getLatestItem(response.TagData, eip155Address);
        const allCdnItems = this.getAllItems(response.CdnData, eip155Address);
        const latestTokenItem = this.getLatestItem(response.TokenData, eip155Address);

        // Only create an AddressTag if we have data from at least one registry
        if (latestTagItem || allCdnItems.length > 0 || latestTokenItem) {
          const tagData = this.mapTagData(latestTagItem);
          const verifiedDomains = this.mapCdnData(allCdnItems);
          const tokenAttributes = this.mapTokenData(latestTokenItem);

          const addressTag: AddressTag = {
            chain_id: chainId,
            project_name: tagData.project_name || '',
            name_tag: tagData.name_tag || '',
            public_note: tagData.public_note || '',
            website_link: tagData.website_link || '',
            verified_domains: verifiedDomains,
            token_attributes: tokenAttributes
          };

          addressTags.push(addressTag);
        }
      }

      // Add to result if we found any tags for this address
      if (addressTags.length > 0) {
        result.push({ [address]: addressTags });
      } else {
        // Add empty array if no data found
        result.push({ [address]: [] });
      }
    }

    return result;
  }
} 