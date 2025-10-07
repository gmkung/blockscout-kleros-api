# Envio GraphQL Endpoint Migration Guide

This guide explains how to use the Envio GraphQL endpoint as an alternative to The Graph.

## Quick Start

### Using Envio (Free, No API Key Required)

Set these environment variables:

```bash
GRAPHQL_ENDPOINT_TYPE=envio
ENVIO_ENDPOINT=https://indexer.hyperindex.xyz/1a2f51c/v1/graphql  # Optional, this is the default
```

### Using The Graph (Requires API Key)

Set these environment variables:

```bash
GRAPHQL_ENDPOINT_TYPE=thegraph
CURATE_GRAPHQL_API_KEY=your_api_key_here
```

## Key Differences Between Endpoints

| Feature | The Graph | Envio (Hasura) |
|---------|-----------|----------------|
| **Authentication** | Requires API key | Free, no authentication |
| **Entity Name** | `litems` | `LItem` |
| **Pagination** | `first: 1000` | `limit: 1000` |
| **Sorting** | `orderBy: field`<br>`orderDirection: asc` | `order_by: {field: asc}` |
| **Field Names** | `registry` | `registryAddress` |
| **Metadata** | Nested in `metadata {}` | Flat structure (top-level keys) |
| **Equality Filter** | `field: "value"` | `field: {_eq: "value"}` |
| **Greater Than** | `field_gt: N` | `field: {_gt: N}` |
| **Array Match** | `field_in: [A, B]` | `field: {_in: [A, B]}` |
| **Response Path** | `data.litems` | `data.LItem` |

## Query Examples

### The Graph Query Format

```graphql
{
  litems(
    first: 1000,
    orderBy: latestRequestSubmissionTime,
    orderDirection: asc,
    where: {
      registry: "0x957a53a994860be4750810131d9c876b2f52d6e1",
      status_in: [Registered],
      disputed: false,
      metadata_: { key0_in: ["eip155:1:0x..."] }
    }
  ) {
    itemID
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
      }
    }
  }
}
```

### Envio Query Format

```graphql
{
  LItem(
    limit: 1000,
    order_by: {latestRequestSubmissionTime: asc},
    where: {
      registryAddress: {_eq: "0x957a53a994860be4750810131d9c876b2f52d6e1"},
      status: {_eq: "Registered"},
      disputed: {_eq: false},
      key0: {_in: ["eip155:1:0x..."]}
    }
  ) {
    itemID
    latestRequestSubmissionTime
    key0
    key1
    key2
    key3
    props {
      value
      type
      label
    }
  }
}
```

## Response Structure

### The Graph Response

```json
{
  "data": {
    "litems": [{
      "itemID": "0x...",
      "metadata": {
        "key0": "eip155:1:0x...",
        "key1": "example.com",
        "key2": "...",
        "props": [...]
      }
    }]
  }
}
```

### Envio Response

```json
{
  "data": {
    "LItem": [{
      "itemID": "0x...",
      "key0": "eip155:1:0x...",
      "key1": "example.com",
      "key2": "...",
      "props": [...]
    }]
  }
}
```

## How the Service Handles Both Endpoints

The service automatically handles the differences between endpoints:

1. **Query Building**: Different query builders generate the appropriate GraphQL syntax for each endpoint
2. **Response Normalization**: Envio responses are normalized to The Graph format internally
3. **Transparent API**: The REST API remains unchanged regardless of which GraphQL endpoint is used

### Internal Architecture

```
User Request
    ↓
API Controller
    ↓
AddressTagService
    ↓
CurateGraphQLClient
    ├── buildTheGraphQuery() → The Graph endpoint
    └── buildEnvioQuery() → Envio endpoint
    ↓
normalizeEnvioResponse() (if needed)
    ↓
DataMapper (same for both)
    ↓
API Response (same format)
```

## Benefits of Envio

1. **No API Key Required**: Free to use without authentication
2. **No Rate Limits**: (Check with Envio for current limits)
3. **Hasura-Powered**: Modern GraphQL engine with advanced filtering
4. **Direct Access**: No gateway layer

## Benefits of The Graph

1. **Established Infrastructure**: Proven reliability and uptime
2. **Decentralized**: Multiple indexer nodes
3. **Industry Standard**: Widely used in Web3
4. **Advanced Features**: Subgraph composition, conditional queries

## Testing Your Configuration

1. Set your environment variables
2. Start the server:
   ```bash
   npm run dev
   ```
3. Check the startup logs for:
   ```
   Using thegraph endpoint: https://gateway.thegraph.com/...
   # or
   Using envio endpoint: https://indexer.hyperindex.xyz/...
   ```
4. Test the API:
   ```bash
   curl -X POST http://localhost:3000/api/address-tags \
     -H "Content-Type: application/json" \
     -d '{
       "chains": ["1"],
       "addresses": ["0x1234567890123456789012345678901234567890"]
     }'
   ```

## Troubleshooting

### Error: "CURATE_GRAPHQL_API_KEY environment variable is required"

**Cause**: Using `GRAPHQL_ENDPOINT_TYPE=thegraph` without an API key

**Solution**: Either:
- Add `CURATE_GRAPHQL_API_KEY=your_key` to `.env`
- Switch to Envio: `GRAPHQL_ENDPOINT_TYPE=envio`

### Error: "Invalid GRAPHQL_ENDPOINT_TYPE"

**Cause**: Invalid value for `GRAPHQL_ENDPOINT_TYPE`

**Solution**: Set to either `thegraph` or `envio` (case-insensitive)

### Different Results Between Endpoints

**Cause**: Data sync differences between indexers

**Solution**: This is expected - different indexers may have slight variations in data depending on sync status

## Migration Checklist

- [ ] Decide which endpoint to use (Envio for free, The Graph for established infrastructure)
- [ ] Set `GRAPHQL_ENDPOINT_TYPE` environment variable
- [ ] If using The Graph: Set `CURATE_GRAPHQL_API_KEY`
- [ ] If using Envio: Optionally set `ENVIO_ENDPOINT` (uses default if not set)
- [ ] Rebuild the application: `npm run build`
- [ ] Test the API endpoints
- [ ] Monitor logs for successful queries
- [ ] Update deployment configurations if needed

## Custom Envio Endpoints

If you're running your own Envio indexer or using a different Envio endpoint:

```bash
GRAPHQL_ENDPOINT_TYPE=envio
ENVIO_ENDPOINT=https://your-custom-envio-endpoint.com/v1/graphql
```

The query builder will automatically use the correct Hasura syntax for any Envio endpoint.

