# 🎰 Lotto - Decentralized Lottery on Flow Blockchain

A fully decentralized lottery platform built on the Flow blockchain, featuring provably fair randomness, transparent prize distribution, and secure smart contract infrastructure.

![Flow Blockchain](https://img.shields.io/badge/Flow-Blockchain-00EF8B?style=for-the-badge&logo=flow&logoColor=white)
![React](https://img.shields.io/badge/React-19.1.1-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Cadence](https://img.shields.io/badge/Cadence-Smart_Contracts-00EF8B?style=for-the-badge)

## 📋 Table of Contents

-   [Overview](#-overview)
-   [Features](#-features)
-   [How It Works](#-how-it-works)
-   [Tech Stack](#-tech-stack)
-   [Project Structure](#-project-structure)
-   [Prerequisites](#-prerequisites)
-   [Installation](#-installation)
-   [Running Locally](#-running-locally)
-   [Smart Contract Details](#-smart-contract-details)
-   [Available Scripts](#-available-scripts)
-   [Deployment](#-deployment)
-   [Testing](#-testing)
-   [Contributing](#-contributing)

## 🎯 Overview

Lotto is a decentralized lottery application that allows users to:

-   **Create lottery sessions** with custom ticket prices and end times
-   **Purchase tickets** using FLOW tokens
-   **Win prizes** through provably fair blockchain randomness
-   **Track sessions** and view detailed statistics
-   **Close sessions** and trigger automatic prize distribution

All lottery logic is executed on-chain via Cadence smart contracts, ensuring complete transparency and fairness.

## ✨ Features

### 🔐 Provably Fair

-   Uses Flow's `revertibleRandom()` for verifiable on-chain randomness
-   No possibility of manipulation or unfair winner selection
-   All transactions recorded on the blockchain

### 💰 Fair Prize Distribution

-   **85%** to the winner
-   **10%** to the session creator
-   **2.5%** to the platform
-   **2.5%** to the person who closes the session

### ⏰ Time-Based Sessions

-   Each session has a defined start and end time
-   Automatic session state management
-   Manual closing mechanism with closer rewards

### 🎫 Ticket Management

-   Maximum tickets per wallet to ensure fairness
-   Real-time ticket purchase tracking
-   View all participants and their ticket counts

### 🏆 Session States

1. **Active** - Accepting ticket purchases
2. **Expired** - Time passed, awaiting winner selection
3. **Winner Picked** - Winner selected, ready for distribution
4. **Completed** - Prizes distributed

## 🎲 How It Works

### Creating a Session

1. Connect your Flow wallet
2. Set a ticket price (minimum 0.1 FLOW)
3. Set an end time for the session
4. Submit the transaction to create the session on-chain

### Buying Tickets

1. Browse available active sessions
2. Select a session and choose number of tickets
3. Confirm the transaction (ticket price × quantity)
4. Your tickets are recorded on the blockchain

### Closing a Session

1. When a session expires, anyone can close it
2. The closer triggers the winner selection process
3. Winner is randomly selected using provably fair randomness
4. Prizes are automatically distributed to all parties

## 🛠 Tech Stack

### Frontend

-   **React 19.1.1** - UI framework
-   **TypeScript** - Type safety
-   **Vite** - Build tool and dev server
-   **React Router 7** - Client-side routing
-   **Tailwind CSS 4** - Styling
-   **shadcn/ui** - UI component library
-   **Lucide React** - Icon library
-   **React Hook Form + Zod** - Form validation

### Blockchain

-   **Flow Blockchain** - Layer 1 blockchain
-   **Cadence** - Smart contract language
-   **@onflow/react-sdk** - Flow integration for React
-   **Flow CLI** - Development tools

### Development Tools

-   **ESLint** - Code linting
-   **Flow Emulator** - Local blockchain for testing
-   **Flow Dev Wallet** - Wallet for local development

## 📁 Project Structure

```
lotto/
├── cadence/                    # Smart contracts and scripts
│   ├── contracts/
│   │   └── Lotto.cdc          # Main lottery smart contract
│   ├── scripts/               # Read-only blockchain queries
│   │   ├── GetAllSessions.cdc
│   │   ├── GetSessionByID.cdc
│   │   ├── GetSessionInfo.cdc
│   │   ├── GetUserSessions.cdc
│   │   └── GetUserTicketStatus.cdc
│   ├── transactions/          # Blockchain state modifications
│   │   ├── BuyTickets.cdc
│   │   ├── CloseSession.cdc
│   │   └── CreateSession.cdc
│   └── tests/
│       └── Lotto_test.cdc     # Smart contract tests
├── src/
│   ├── components/            # React components
│   │   ├── layout/           # Header, footer
│   │   ├── mysessions/       # Session list components
│   │   ├── session/          # Session detail components
│   │   └── ui/               # Reusable UI components (shadcn)
│   ├── lib/                  # Utilities and helpers
│   │   ├── layout.tsx        # Layout wrapper
│   │   ├── router.tsx        # Route configuration
│   │   ├── scripts.ts        # Cadence script loaders
│   │   └── utils.ts          # Helper functions
│   ├── routes/               # Page components
│   │   ├── Homepage.tsx
│   │   ├── CreateLotto.tsx
│   │   ├── Session.tsx
│   │   ├── MySessions.tsx
│   │   ├── MyTickets.tsx
│   │   └── UserProfile.tsx
│   └── types/                # TypeScript type definitions
│       ├── session.ts
│       └── ticket.ts
├── imports/                   # Flow contract dependencies
├── flow.json                 # Flow configuration
├── package.json              # Node dependencies
└── vite.config.ts           # Vite configuration
```

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

-   **Node.js** (v18 or higher)
-   **npm** or **yarn** or **pnpm**
-   **Flow CLI** - [Installation Guide](https://developers.flow.com/tools/flow-cli/install)

### Installing Flow CLI

**macOS (Homebrew):**

```bash
brew install flow-cli
```

**Linux:**

```bash
sh -ci "$(curl -fsSL https://storage.googleapis.com/flow-cli/install.sh)"
```

**Windows:**

```powershell
iex "& { $(irm 'https://storage.googleapis.com/flow-cli/install.ps1') }"
```

Verify installation:

```bash
flow version
```

## 🚀 Installation

1. **Clone the repository**

    ```bash
    git clone https://github.com/yourusername/lotto.git
    cd lotto
    ```

2. **Install dependencies**

    ```bash
    npm install
    ```

3. **Configure environment variables**

    Create a `.env` file in the root directory with the following variables:

    ```env
    # Application URL
    VITE_PUBLIC_URL=http://localhost:5173

    # WalletConnect Project ID (get from https://cloud.walletconnect.com/)
    VITE_WALLET_CONNECT_PROJECT_ID=your_wallet_connect_project_id

    # Flow Network Configuration
    VITE_ACCESS_NODE_URL=http://localhost:8888
    VITE_NETWORK=emulator
    VITE_DISCOVERY_WALLET_URL=http://localhost:8701/fcl/authn

    # Contract Address (automatically set after deployment)
    VITE_CONTRACT_ADDRESS_LOTTERY=0xf8d6e0586b0a20c7
    ```

    **For Testnet deployment**, uncomment and use these instead:

    ```env
    # VITE_ACCESS_NODE_URL=https://rest-testnet.onflow.org
    # VITE_NETWORK=testnet
    # VITE_DISCOVERY_WALLET_URL=https://fcl-discovery.onflow.org/testnet/authn
    ```

## 🏃 Running Locally

To run the project locally, you need to start three separate processes:

### 1. Start the Flow Emulator

The Flow emulator is a local blockchain for development and testing.

```bash
npm run flow:emulator
```

This starts a local Flow blockchain at `http://127.0.0.1:3569`.

**Keep this terminal running.**

### 2. Deploy Contracts to Emulator

In a **new terminal**, deploy the Lotto smart contract to the local emulator:

```bash
npm run flow:deploy:emulator
```

You should see output confirming the contract deployment.

### 3. Start the Development Server

In a **third terminal**, start the React development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173` (or the next available port).

### 4. (Optional) Start Flow Dev Wallet

For wallet connectivity in local development:

```bash
npm run flow:dev-wallet
```

This provides a browser-based wallet interface for testing.

## 🔧 Smart Contract Details

### Lotto.cdc Contract

The main smart contract implements the following functionality:

#### Key Components

**Resources:**

-   `Session` - Represents a lottery session with participants and prizes
-   `SessionCollection` - Stores multiple sessions for a user
-   `Admin` - Administrative capabilities

**Public Functions:**

-   `createSession(ticketPrice, endTime)` - Create a new lottery session
-   `buyTickets(sessionID, numberOfTickets, payment)` - Purchase tickets for a session
-   `closeSession(sessionID)` - Close an expired session and distribute prizes

**View Functions:**

-   `getSessionInfo(address, sessionID)` - Get detailed session information
-   `getUserSessions(address)` - Get all sessions created by a user
-   `getUserTicketStatus(address, sessionID)` - Get user's tickets for a session

#### Constants

```cadence
platformFeePercentage: 2.5%
creatorFeePercentage: 10%
closerFeePercentage: 2.5%
maxTicketsPerWallet: Variable (check contract)
```

#### Prize Distribution Logic

When a session is closed:

1. Random winner selected using `revertibleRandom()`
2. Winner probability = (user tickets / total tickets)
3. Prizes distributed:
    - Winner receives 85% of pool
    - Creator receives 10% of pool
    - Platform receives 2.5% of pool
    - Closer receives 2.5% of pool

## 📜 Available Scripts

### Development

-   `npm run dev` - Start Vite development server
-   `npm run build` - Build for production
-   `npm run preview` - Preview production build

### Flow Blockchain

-   `npm run flow:emulator` - Start Flow emulator (local blockchain)
-   `npm run flow:deploy:emulator` - Deploy contracts to emulator
-   `npm run flow:deploy:testnet` - Deploy contracts to testnet
-   `npm run flow:dev-wallet` - Start development wallet UI
-   `npm run flow:test` - Run Cadence smart contract tests

### Code Quality

-   `npm run lint` - Run ESLint

## 🌐 Deployment

### Deploying to Flow Testnet

1. **Create a Flow Testnet Account**

    - Visit [Flow Testnet Faucet](https://testnet-faucet.onflow.org/)
    - Create an account and save your address and private key

2. **Configure flow.json**
   Update the `accounts` section in `flow.json`:

    ```json
    "accounts": {
      "testnet-account": {
        "address": "YOUR_TESTNET_ADDRESS",
        "key": "YOUR_PRIVATE_KEY"
      }
    }
    ```

3. **Deploy to Testnet**

    ```bash
    npm run flow:deploy:testnet
    ```

4. **Build and Deploy Frontend**
    ```bash
    npm run build
    ```
    Deploy the `dist/` folder to your hosting provider (Vercel, Netlify, etc.)

### Environment Variables

Create a `.env` file for production configuration:

```env
VITE_FLOW_NETWORK=testnet
VITE_LOTTO_CONTRACT_ADDRESS=YOUR_DEPLOYED_CONTRACT_ADDRESS
```

## 🧪 Testing

### Running Smart Contract Tests

```bash
npm run flow:test
```

This runs the Cadence test suite in `cadence/tests/Lotto_test.cdc`.

### Test Coverage

The test suite covers:

-   ✅ Session creation
-   ✅ Ticket purchasing
-   ✅ Session closing
-   ✅ Prize distribution
-   ✅ Edge cases and error handling

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

-   [Flow Blockchain](https://flow.com/) for the amazing blockchain infrastructure
-   [Cadence](https://cadence-lang.org/) for the smart contract language
-   [shadcn/ui](https://ui.shadcn.com/) for the beautiful UI components

## 📞 Support

For questions or issues:

-   Open an issue on GitHub
-   Contact the development team
-   Join our community Discord

---

**Built with ❤️ on Flow Blockchain**
