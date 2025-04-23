# Blockchain Integration for Donation Tracking

This document outlines the steps to integrate blockchain donation tracking into the existing application.

## Overview

The integration adds blockchain recording for donation transactions using:
- Solidity smart contract for on-chain donation tracking
- Thirdweb SDK for blockchain interaction
- Express backend server for handling blockchain transactions
- Frontend integration with the existing Supabase database

## Implementation Steps

### 1. Set up the Smart Contract Project

- Create and implement the DonationTracker.sol smart contract
- Configure Hardhat for deployment to Holesky testnet
- Create deployment scripts

### 2. Deploy the Smart Contract

- Install dependencies: `cd backend-contract && yarn install`
- Create .env file with required environment variables
- Deploy to Holesky testnet: `yarn deploy:holesky`
- Note the deployed contract address for configuration

### 3. Set up the Backend Service

- Create the blockchain interaction service
- Implement the Express API for frontend integration
- Configure environment variables for the backend

### 4. Update Database Schema

- Apply SQL migrations to add blockchain-related fields:
  - `blockchain_donation_id` - ID of the donation on the blockchain
  - `status` - Status of the donation (pending, completed, failed)

### 5. Update Frontend Integration

- Create a blockchain service for the frontend
- Update the charityService.ts to record donations on the blockchain
- Update the UI to show blockchain transaction info

## Architecture

```
┌────────────────┐       ┌─────────────────┐       ┌───────────────┐
│                │       │                 │       │               │
│    Frontend    │──────▶│ Supabase Database│◀─────▶│  Backend API  │
│                │       │                 │       │               │
└────────────────┘       └─────────────────┘       └───────┬───────┘
        │                                                  │
        │                                                  │
        │                                                  ▼
        │                                          ┌───────────────┐
        └─────────────────────────────────────────▶│  Blockchain   │
                                                   │               │
                                                   └───────────────┘
```

## Key Files

### Smart Contract
- `backend-contract/contracts/DonationTracker.sol` - The donation tracking smart contract

### Backend
- `backend-contract/src/donationBlockchainService.js` - Service for blockchain interaction
- `backend-contract/src/server.js` - Express API for frontend integration

### Frontend
- `frontend-reactjs-vite/src/services/blockchain/blockchainService.ts` - Frontend blockchain service
- `frontend-reactjs-vite/src/services/supabase/charityService.ts` - Updated charity service
- `frontend-reactjs-vite/src/components/modals/DonationModal.tsx` - Updated UI component

## Donation Flow

1. User initiates a donation through the frontend
2. Frontend calls charityService.makeDonation()
3. Donation is recorded in Supabase as "pending"
4. Backend records the donation on the blockchain
5. Transaction hash is updated in Supabase
6. Donation status is changed to "completed"
7. User is shown confirmation with blockchain explorer link

## Security Considerations

- Private keys are stored securely in environment variables
- Backend API is protected with an API key
- Users don't need their own wallets or to pay gas fees
- All transactions are signed by the server with a dedicated wallet

## Future Improvements

1. Add transaction queue for handling failed blockchain transactions
2. Implement webhook for blockchain transaction confirmation
3. Add blockchain verification page for donors to verify their donations
4. Expand contract to support more donation types and features 