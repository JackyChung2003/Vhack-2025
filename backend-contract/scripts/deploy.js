const hre = require("hardhat");

async function main() {
  console.log("Deploying DonationTracker contract...");

  // Get the contract factory
  const DonationTracker = await hre.ethers.getContractFactory("DonationTracker");
  
  // Deploy the contract
  const donationTracker = await DonationTracker.deploy();
  
  // Wait for deployment to finish
  await donationTracker.waitForDeployment();
  
  // Get the contract address
  const address = await donationTracker.getAddress();
  
  console.log(`DonationTracker deployed to: ${address}`);
  console.log("Update your .env file with this address!");
}

// Run the deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 