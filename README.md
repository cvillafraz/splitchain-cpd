# SplitChain - Web3-Powered Expense Sharing

## Overview

**SplitChain** is a Web3-enabled expense-sharing app for frictionless group payments, built to provide instant, onchain settlement with embedded wallets, real-time micropayments, and crypto-friendly funding. Users can split bills, settle in crypto, fund wallets via Coinbase Pay, and access spending insights—all within an intuitive interface.

## Key Features

- **Embedded Wallets for Easy Onboarding:**  
  New users receive secure, encrypted wallets automatically—no seed phrases or crypto complexity.
- **Expense Creation & Splitting:**  
  Easily record, split, and manage group expenses. View individual shares and history at a glance.
- **Coinbase Pay Integration:**  
  Fund your wallet with fiat currency in seconds using Coinbase Pay—no need to pre-convert crypto.


## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/en/) v18+ (or your project’s chosen backend runtime)
- [Yarn](https://yarnpkg.com/) or [npm](https://www.npmjs.com/)
- [Metamask](https://metamask.io/) (or compatible Web3 wallet, for testing)
- A [Coinbase](https://www.coinbase.com/) account (for demoing fiat wallet funding)

### Installation

1. **Clone the repo**  
   ```bash
   git clone https://github.com/cvillafraz/splitchain-cpd.git
   cd splitchain-cpd
   ```
2. **Install dependencies**  
   ```bash
   yarn install
   # or
   npm install
   ```

3. **Configuration**  
   - Set up environment variables for wallet and API integrations
   - Configure your CDP Embedded Wallet Provider, X402 Payment API, and Coinbase Pay API keys.

4. **Run the App**  
   ```bash
   yarn start
   # or
   npm start
   ```
   Access the interface at `http://localhost:3000`

## Usage

1. **Sign Up:**  
   Instantly onboard—your in-app wallet is created securely and invisibly.
2. **Add Expense:**  
   Enter amounts, select friends to split with, and let SplitChain calculate shares.
3. **Settle Instantly:**  
   Pay out your share or collect from others with real-time confirmation.
4. **Fund Wallet:**  
   Use Coinbase Pay for one-click fiat-to-crypto funding.

## Architecture & Components

- **CDP Embedded Wallets:** Seamless onboarding and secure wallet creation
- **CDP Trade API:** Automatic token swaps underneath the hood
- **Coinbase Pay:** Native integration for fiat wallet top-ups
- **Notification Service:** Instant transaction and onboarding alerts

## Security & Compliance

- Encrypted wallets and transaction data
- User authentication required
- Two-factor authentication for large payments
- Data privacy controls for analytics

## Roadmap

- Advanced analytics (custom spending reports, forecasting)
- Dispute resolution for payments
- Enhanced accessibility and multi-language support
- Integration with additional payment networks

## Contributing

We welcome contributions! Please submit pull requests or open issues for features, bugs, or documentation improvements.

1. Fork the repo, create a feature branch, and submit a pull request
2. For questions/discussion: [Issues](https://github.com/cvillafraz/splitchain-cpd/issues)
