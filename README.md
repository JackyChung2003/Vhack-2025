# Dermanow - Transparent Blockchain Donation Platform

<img alt="Dermanow Logo" align="right" src="/frontend-reactjs-vite/src/assets/images/logo-png.png" width="20%" />

Welcome to **Dermanow**, a trust-focused blockchain donation platform created to restore transparency and accountability in charitable giving.

This platform was built using modern web technologies including **React**, **Vite**, and **Solidity**, with **Supabase** powering our backend and smart contracts deployed via **Thirdweb**.

---

## 🌟 Vision

To build a world where every donation is seen, felt, and remembered.

## 🚀 Mission

To rebuild trust in charitable giving through technology, transparency, and community engagement.

---

## 🔍 Project Overview

In Malaysia and beyond, donations often go untracked and charities struggle to prove their impact. **Dermanow** bridges this gap by enabling:

- Transparent donations via smart contracts.
- Flexible donation options (Success-Only or Always).
- Real-time visual updates for donors.
- Vendor-based procurement with verification.

---

## ⚙️ Prerequisites

Before running the project locally, ensure you have:

- [Node.js](https://nodejs.org/)
- [Git](https://git-scm.com/)
- [MetaMask](https://metamask.io/) browser extension (for wallet interaction)

---

## 💻 Installation

Clone the repository:

```bash
git clone https://github.com/JackyChung2003/Vhack-2025
```

Navigate into the project directory:

```bash
cd Vhack/frontend-reactjs-vite
```

Install the dependencies:

```bash
yarn
```

---

## 🔐 Environment Setup

Before running the frontend locally, you need to set up your environment variables.

### 📁 Step 1: Create a `.env` File

In the root of the `frontend-reactjs-vite` directory, create a file named:

```
.env
```

### 🧩 Step 2: Add the Following Variables

Paste the following content into your `.env` file and replace the placeholder values with your actual credentials:

```env
VITE_TEMPLATE_CLIENT_ID=
VITE_TEMPLATE_CONTRACT_ADDRESS=

VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

> 💡 **Tips**:
>
> - `VITE_TEMPLATE_CLIENT_ID`: Your app/client ID from Thirdweb or other integration.
> - `VITE_TEMPLATE_CONTRACT_ADDRESS`: The address of your deployed smart contract.
> - `VITE_SUPABASE_URL`: Your Supabase project URL.
> - `VITE_SUPABASE_ANON_KEY`: Your Supabase anon/public API key.

---

## 🚀 Usage

To run the project locally:

```bash
yarn dev
```

Open your browser and visit:

```
http://localhost:5173/Vhack-2025/
```

---

## 📸 Screenshots

_Coming soon: Interface previews, donation tracking timeline, and smart contract interaction flow._

---

## 🛠️ Tech Stack

- **Frontend**: React, Vite, Tailwind CSS
- **Blockchain**: Solidity, Thirdweb
- **Wallet Integration**: MetaMask
- **Database**: Supabase
- **APIs**: Etherscan for tracking
- **Security**: Etherscan API, optional AI ML model for fraud detection

---

## 🧩 Key Features

### Donation System

- **General Fund**: Donated via charity profile
- **Specific Fund**: Campaign-based donation with two options:
  - **Always Donation**: Redirect to General Fund if campaign fails
  - **Success-Only Donation**: Refund if campaign goal is not achieved

### Vendor System

- Support both **Registered** and **Unregistered** vendors
- Payments via DuitNow QR (for unregistered)
- Direct integration for verified suppliers (registered)

### Transparency & Automation

- Real-time donation tracking and visual proof
- Smart contract-based fund release tied to campaign milestones
- Community feedback, timelines, and notifications

---

## 🧑‍🤝‍🧑 Key Roles

### Donor

- Browse and donate to campaigns
- Select donation method
- Track usage and receive updates or refunds
- Send messages and participate in donor community

### Charity

- Create campaigns and manage donations
- Provide spending updates and visual proofs
- Use chat-based vendor system for procurement
- Withdraw funds upon milestone completion

### Vendor

- Register and verify identity via SSM, TIN, and bank statements
- Accept payments via smart contracts or DuitNow QR
- Upload delivery proof and receive payment upon confirmation

---

## 💼 Business Model

- **Subscription**:
  - Free tier for basic functions
  - Premium for featured campaigns, priority verification
- **Vendor Subscription**:
  - RM500/year for verified vendors
- **Donor Round-ups**:
  - Round up small donations to nearest RM
- **Sponsorships**:
  - Corporate partnerships and CSR support

---

## 📈 Future Improvements

- Stablecoin and fiat (MYR) integration
- Data privacy enhancements
- NFT-based reward and voting system
- Leaderboards and gamification
- AI fraud detection and spending audits

---

## 📊 Transparency Model

- **Public**: Summary of fund usage and campaign progress
- **Donors**: Full breakdown of transaction history, invoices, and delivery proofs

---

## 🔐 Security & Verification

- Double-verification for charities and campaigns
- Fraud detection through community voting and automated tools
- Invoice, photo, and video proof for every transaction

---

## 💡 Highlights

- Community feature (chat, post, feedback)
- Leaderboard for donors and campaigns
- QR-based payments for vendor integration
- Donation timeline for every campaign

---

### Join us in transforming the future of charity — one trusted transaction at a time.
