 const { ethers } = require("hardhat");

async function main() {
  const LORContractFactory = await ethers.getContractFactory("LOR");

  console.log("Deploying contracts ...");

  const contract = await LORContractFactory.deploy();
  await contract.waitForDeployment(); // Wait for deployment to finish

  console.log(`Deploy to :${contract.target}`);
}

main().then(
  () => process.exit(0)
).catch((error) => {
  console.error(error);
  process.exitCode = 1;
});