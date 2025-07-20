# Sample Hardhat Project

This project demonstrates a basic Hardhat use case. It comes with a sample contract, a test for that contract, and a Hardhat Ignition module that deploys that contract.

Try running some of the following tasks:

```shell
npx hardhat help
npx hardhat test
REPORT_GAS=true npx hardhat test
npx hardhat node
npx hardhat ignition deploy ./ignition/modules/Lock.js
```

# LOR DApp

This project is a decentralized application (DApp) for managing Letters of Recommendation (LOR) using Ethereum smart contracts. It includes smart contracts, deployment scripts, and a React-based frontend.

## Prerequisites
- Node.js & npm
- Hardhat (for smart contract development)
- MetaMask (for interacting with the frontend)

## Project Structure
- `contracts/` — Solidity smart contracts
- `scripts/` — Deployment scripts
- `test/` — Test scripts for smart contracts
- `front/` — React frontend

---

## Running Tests

1. **Install dependencies:**
   ```powershell
   npm install
   ```
2. **Run tests:**
   ```powershell
   npx hardhat test
   ```
   This will execute all tests in the `test/` directory.

---

## Deploying Smart Contracts

1. **Compile contracts:**
   ```powershell
   npx hardhat compile
   ```
2. **Deploy to local network:**
   ```powershell
   npx hardhat run scripts/deploy.js --network localhost
   ```
   To deploy to Sepolia or another testnet, configure your network in `hardhat.config.js` and use:
   ```powershell
   npx hardhat run scripts/deploy.js --network sepolia
   ```

---

## Starting the Frontend

1. **Navigate to the frontend directory:**
   ```powershell
   cd front
   ```
2. **Install frontend dependencies:**
   ```powershell
   npm install
   ```
3. **Start the frontend app:**
   ```powershell
   npm start
   ```
   The app will be available at `http://localhost:3000`.

---

## Notes
- Ensure your wallet (e.g., MetaMask) is connected to the correct network (local, Sepolia, etc.)
- Update contract addresses in the frontend as needed after deployment.
- Only authorized accounts can approve recommendations.

---

## Troubleshooting
- If you encounter issues, check your network configuration and contract addresses.
- For more details, see the comments in the source files.
