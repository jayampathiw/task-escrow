# Smart Contract-Based Task Escrow System

A decentralized application that enables secure freelancing through blockchain technology. This system allows clients to create tasks, deposit funds in escrow, and pay freelancers once work is verified.

![Task Escrow System](https://your-screenshot-url-here.png)

## Features

- **Secure Escrow**: Client funds are locked in a smart contract until work is approved
- **Task Creation & Management**: Clients can create tasks with detailed descriptions, deadlines, and payment amounts
- **Work Submission & Verification**: Freelancers can submit work and clients can approve or dispute it
- **Transparent Dispute Resolution**: Simple dispute mechanism for resolving disagreements
- **Full Transaction History**: Complete record of all task interactions on the blockchain

## Technology Stack

- **Frontend**: React with TypeScript
- **Smart Contracts**: Solidity (^0.8.17)
- **Development Environment**: Truffle Suite
- **Blockchain**: Ethereum (local development with Ganache)
- **Web3 Integration**: ethers.js
- **UI Framework**: TailwindCSS
- **State Management**: React Context API

## Project Structure

```
task-escrow/
├── client/                  # React frontend
│   ├── src/
│   │   ├── components/      # UI components
│   │   ├── contexts/        # React context (Web3, Tasks)
│   │   ├── contracts/       # Contract ABI files
│   │   ├── pages/           # Main application pages
│   │   └── utils/           # Helper functions
├── contracts/               # Solidity contracts
│   ├── TaskEscrow.sol       # Main escrow contract
│   └── Migrations.sol       # Truffle migrations
├── migrations/              # Truffle migration scripts
├── test/                    # Contract tests
└── truffle-config.js        # Truffle configuration
```

## Getting Started

### Prerequisites

- Node.js (v14+)
- npm or yarn
- Ganache (for local blockchain)
- MetaMask browser extension

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/task-escrow.git
   cd task-escrow
   ```

2. Install dependencies:
   ```bash
   npm install
   cd client
   npm install
   ```

3. Start Ganache:
   ```bash
   ganache-cli -d
   ```

4. Compile and deploy contracts:
   ```bash
   # From the project root
   truffle compile
   truffle migrate --network development
   ```

5. Copy contract artifacts to client:
   ```bash
   mkdir -p client/src/contracts
   cp build/contracts/TaskEscrow.json client/src/contracts/
   ```

6. Update contract address:
   Edit `client/src/contexts/Web3Context.tsx` and update the `contractAddress` with the deployed contract address from the migration output.

7. Start the frontend:
   ```bash
   cd client
   npm start
   ```

8. Configure MetaMask:
   - Connect MetaMask to Ganache (http://127.0.0.1:8545, Chain ID 1337)
   - Import a Ganache account using its private key

### How to Use

#### As a Client:

1. Connect your wallet using the "Connect Wallet" button
2. Click "Create Task" to create a new task
3. Fill in the task details (description, deadline, payment amount)
4. Submit the transaction and pay the escrow amount
5. Wait for a freelancer to accept and submit work
6. Review submitted work and approve payment or dispute

#### As a Freelancer:

1. Connect your wallet
2. Browse available tasks in the "All Tasks" tab
3. Click "Accept Task" on a task you want to work on
4. Complete the work and submit the deliverable link
5. Wait for the client to approve and release payment

## Testing

### Smart Contract Tests

Run the included test suite to verify contract functionality:

```bash
truffle test
```

### Frontend Testing

```bash
cd client
npm test
```

## Security Considerations

- The smart contract includes measures to prevent reentrancy attacks
- Funds are securely held in the contract until explicitly released
- Client-freelancer relationships are enforced through address verification
- Task state transitions are strictly controlled to prevent invalid operations

## Future Enhancements

- Multi-signature dispute resolution
- Task categories and search functionality
- Reputation system for clients and freelancers
- Support for ERC-20 tokens as payment
- Task milestones with partial payments
- Mobile application

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Truffle Suite](https://www.trufflesuite.com/)
- [React](https://reactjs.org/)
- [ethers.js](https://docs.ethers.io/v5/)
- [TailwindCSS](https://tailwindcss.com/)
