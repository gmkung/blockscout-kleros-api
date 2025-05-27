# Blockscout API Service

A Node.js backend service that provides address tagging functionality for EVM blockchain addresses across multiple chains.

## Features

- 🔍 Address tag lookup across multiple EVM chains
- 🛡️ Input validation and sanitization
- 🚀 TypeScript for type safety
- 📊 Structured API responses
- 🏥 Health check endpoint
- 🔒 Security middleware (Helmet, CORS)

## API Endpoints

### POST /api/address-tags

Retrieves address tags for given chains and addresses.

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
            "token_attributes": {
              "logo_url": "https://example.com/logo.png",
              "token_symbol": "EXM",
              "decimals": 18
            }
          }
        ]
      }
    ]
  }
}
```

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
│   └── api.ts       # API request/response types
├── middleware/      # Express middleware
│   └── validation.ts # Request validation middleware
├── services/        # Business logic layer
│   └── addressTagService.ts
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

### Mock Data

The current implementation includes mock data for demonstration purposes. Replace the `fetchAddressTagFromDataSource` method in `AddressTagService` with your actual data source implementation.

### Extending the Service

To add real data sources:

1. Implement database connections or external API clients
2. Replace mock data in `AddressTagService`
3. Add environment variables for configuration
4. Implement caching if needed

## Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm test` - Run tests

## License

MIT 