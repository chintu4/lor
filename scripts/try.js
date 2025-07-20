const { JsonRpcProvider } = require('ethers');

// Connect to the Ethereum network
const provider = new JsonRpcProvider("https://eth-sepolia.g.alchemy.com/v2/b8EuWWmnwAYKBkMvLNaK4Xu3Fo5g2zJE");

(async () => {
  const blockNumber = "latest";
  const block = await provider.getBlock(blockNumber);
  console.log(block);
})();