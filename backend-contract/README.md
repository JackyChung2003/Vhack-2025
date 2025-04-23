# Donation Tracker Blockchain Integration

This project contains the smart contract and backend service for tracking donations on the blockchain.

## Project Structure

- `contracts/` - Contains the Solidity smart contract for donation tracking
- `scripts/` - Contains deployment scripts
- `src/` - Contains the backend service for blockchain interaction
- `migrations/` - Contains SQL migrations for Supabase database updates

## Prerequisites

- Node.js 16+
- Yarn or npm
- Metamask wallet with Holesky ETH (testnet)
- Thirdweb account with API key
- Supabase project

## Setup Instructions

### 1. Install Dependencies

```bash
# Install project dependencies
yarn install
```

### 2. Configure Environment Variables

Copy the `.env.example` file to `.env` and fill in your values:

```bash
cp .env.example .env
```

Edit the `.env` file with your specific values:

- `PRIVATE_KEY`: Your Metamask private key
- `HOLESKY_RPC_URL`: RPC URL for Holesky testnet
- `ETHERSCAN_API_KEY`: Your Etherscan API key (for contract verification)
- `THIRDWEB_API_KEY`: Your Thirdweb API key
- `THIRDWEB_SECRET_KEY`: Your Thirdweb secret key
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_SERVICE_KEY`: Your Supabase service key (with write access)
- `BLOCKCHAIN_API_KEY`: Generate a secure random string for API authentication

### 3. Deploy the Smart Contract

Deploy the contract to the Holesky testnet:

```bash
yarn deploy:holesky
```

After deployment, copy the contract address and update your `.env` file:

```
CONTRACT_ADDRESS=your_deployed_contract_address
```

Also update the frontend `.env` file with this address:

```
VITE_TEMPLATE_CONTRACT_ADDRESS=your_deployed_contract_address
```

### 4. Apply Database Migrations

Run the SQL migration on your Supabase database to add the blockchain-related fields:

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy the contents of `migrations/add_blockchain_fields.sql`
4. Run the migration

### 5. Start the Backend Server

Start the backend server:

```bash
yarn start
```

For development with auto-restart:

```bash
yarn dev
```

## API Endpoints

The backend server exposes the following endpoints:

- `GET /health` - Health check endpoint
- `POST /donations` - Record a donation on the blockchain
- `GET /donations/:id` - Get details of a donation by ID
- `GET /donations` - Get latest donations

## Frontend Integration

The frontend integration is handled by the `blockchainService.ts` in the frontend project. It provides functions for:

- Recording donations on the blockchain
- Getting donation details from the blockchain
- Getting latest donations from the blockchain
- Getting blockchain explorer URLs for transactions

## Security Considerations

- Keep your private key secure and never commit it to version control
- The backend server uses API key authentication - keep this key secure
- In production, implement proper authentication and authorization
- Consider using a hardware wallet or a dedicated wallet for production deployments
