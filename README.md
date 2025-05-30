# Blockscout API Service

A Node.js backend service that provides address tagging functionality for EVM blockchain addresses across multiple chains. The service integrates with Kleros Curate Registry to fetch verified address tags, token data, and domain information.

## Features

- 🔍 Address tag lookup across multiple EVM chains
- 🏛️ Integration with Kleros Curate Registry via GraphQL
- 🔗 Direct links to Kleros Scout for data verification
- 🛡️ Input validation and sanitization
- 🚀 TypeScript for type safety
- 📊 Structured API responses
- 🏥 Health check endpoint
- 🔒 Security middleware (Helmet, CORS)

## API Endpoints

### POST /api/address-tags

Retrieves address tags for given chains and addresses from the Kleros Curate Registry.

**Request Body:**
```json
{
  "chains": ["1", "137", "56"],
  "addresses": ["0x1234567890123456789012345678901234567890", "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "addresses": [
      {
        "0x1234567890123456789012345678901234567890": [
          {
            "chain_id": "1",
            "project_name": "Example Project",
            "name_tag": "Example Contract",
            "public_note": "This is an example contract",
            "website_link": "https://example.com",
            "verified_domains": ["example.com"],
            "data_origin_link": "https://app.klerosscout.eth.limo/#/?registry=Single_Tags&itemdetails=0x123abc...",
            "token_attributes": {
              "logo_url": "https://example.com/logo.png",
              "token_symbol": "EXM",
              "token_name": "Example Token",
              "decimals": 18
            }
          }
        ]
      }
    ]
  }
}
```

**Response Fields:**

- `chain_id`: The EVM chain ID where the address exists
- `project_name`: Name of the project/protocol associated with the address
- `name_tag`: Public name tag for the address
- `public_note`: Additional public information about the address
- `website_link`: Official website URL
- `verified_domains`: List of verified domain names associated with the address
- `data_origin_link`: Direct link to Kleros Scout for data verification (empty string if no TagData available)
- `token_attributes`: Token-specific information (null if not a token)
  - `logo_url`: Token logo URL
  - `token_symbol`: Token symbol
  - `token_name`: Full token name
  - `decimals`: Number of decimal places

### GET /api/health

Health check endpoint.

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2024-01-01T00:00:00.000Z",
    "service": "blockscout-api"
  }
}
```

## Setup

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd blockscout-api
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp env.example .env
```

4. Configure environment variables in `.env` file as needed.

### Development

Start the development server:
```bash
npm run dev
```

The server will start on `http://localhost:3000` by default.

### Production

1. Build the project:
```bash
npm run build
```

2. Start the production server:
```bash
npm start
```

## Project Structure

```
src/
├── types/           # TypeScript type definitions
│   ├── api.ts       # API request/response types
│   └── graphql.ts   # GraphQL response types
├── middleware/      # Express middleware
│   └── validation.ts # Request validation middleware
├── services/        # Business logic layer
│   ├── addressTagService.ts # Main service for address tag operations
│   ├── graphqlClient.ts     # GraphQL client for Kleros Curate Registry
│   └── dataMapper.ts        # Maps GraphQL responses to API format
├── controllers/     # HTTP request handlers
│   └── addressTagController.ts
├── routes/          # API route definitions
│   └── addressTagRoutes.ts
├── app.ts          # Express app configuration
└── index.ts        # Application entry point
```

## Validation Rules

### Addresses
- Must be valid Ethereum addresses (42 characters starting with '0x')
- Case-insensitive hex format

### Chain IDs
- Must be positive numeric strings
- Examples: "1" (Ethereum), "137" (Polygon), "56" (BSC)

### Request Limits
- Maximum 100 addresses per request
- Maximum 50 chains per request

## Error Handling

The API returns structured error responses:

```json
{
  "success": false,
  "error": {
    "error": "ERROR_CODE",
    "message": "Human readable error message",
    "statusCode": 400
  }
}
```

Common error codes:
- `VALIDATION_ERROR`: Invalid request format or parameters
- `BUSINESS_LOGIC_ERROR`: Request exceeds limits or business rules
- `INTERNAL_SERVER_ERROR`: Unexpected server error

## Development Notes

### Data Sources

The service integrates with three Kleros Curate registries:

1. **TagData Registry** - Contains project names, name tags, public notes, and website links
2. **TokenData Registry** - Contains token-specific information (symbols, names, decimals, logos)  
3. **CDN Registry** - Contains verified domain names

### GraphQL Integration

The service uses GraphQL to query the Kleros Curate subgraph:
- Endpoint: `https://api.studio.thegraph.com/query/61738/legacy-curate-gnosis/version/latest`
- Queries all three registries simultaneously for efficiency
- Filters by valid statuses: "Registered" and "ClearingRequested"

### Data Mapping

The `DataMapper` service handles:
- Converting EIP155 addresses to chain-specific lookups
- Selecting the latest submissions based on timestamp
- Aggregating data from multiple registries per address
- Constructing Kleros Scout verification links

### Extending the Service

To modify or extend functionality:

1. **Add new registries**: Update `REGISTRY_ADDRESSES` in `graphql.ts`
2. **Modify data mapping**: Update methods in `DataMapper` class
3. **Add new GraphQL fields**: Update the query in `CurateGraphQLClient`
4. **Add caching**: Implement Redis or in-memory caching in `AddressTagService`

## Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm test` - Run tests

## License

MIT 