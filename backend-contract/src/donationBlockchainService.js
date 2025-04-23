const { ThirdwebSDK } = require("@thirdweb-dev/sdk");
const { config } = require("dotenv");
config();

// Keep the ABI import if you want to use getContractFromAbi, or remove if using getContract
const donationTrackerArtifact = require("../artifacts/contracts/DonationTracker.sol/DonationTracker.json");
const contractAbi = donationTrackerArtifact.abi;

// --- Initialize SDK (v3 style) ---
const initializeSDK = () => {
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey || typeof privateKey !== 'string' || !privateKey.startsWith('0x')) {
    throw new Error("Private key not found, invalid, or missing '0x' prefix in environment variables");
  }

  // Use fromPrivateKey with Holesky and secret key
  const sdk = ThirdwebSDK.fromPrivateKey(
    privateKey,
    "holesky", // or 17000 if "holesky" isn't recognized by v3
    {
      secretKey: process.env.THIRDWEB_SECRET_KEY, // Make sure this is set
      clientId: process.env.THIRDWEB_API_KEY,   // Optional but good practice
    }
  );
  return sdk;
};

// --- Get Contract (v3 style - choose one method) ---

// Option A: Using getContract (requires contract to be published/imported to Thirdweb)
// const getDonationTrackerContract = async () => {
//   const sdk = initializeSDK();
//   const contractAddress = process.env.CONTRACT_ADDRESS;
//   if (!contractAddress) {
//     throw new Error("Contract address not found");
//   }
//   console.log(`Getting contract (v3) at address: ${contractAddress}`);
//   return await sdk.getContract(contractAddress);
// };

// Option B: Using getContractFromAbi (more reliable if not published)
const getDonationTrackerContract = async () => {
  const sdk = initializeSDK();
  const contractAddress = process.env.CONTRACT_ADDRESS;
  if (!contractAddress) {
    throw new Error("Contract address not found");
  }
  console.log(`Getting contract from ABI (v3) at address: ${contractAddress}`);
  return await sdk.getContractFromAbi(contractAddress, contractAbi);
};


// --- recordDonation function (v3 style) ---
const recordDonation = async (donorId, recipientId, amount, currency, donationType, metadata) => {
  try {
    const contract = await getDonationTrackerContract();
    console.log("Contract instance obtained (v3)");

    // Make sure metadata is properly stringified
    const metadataStr = typeof metadata === 'object' ? 
      JSON.stringify(metadata) : 
      metadata;
    
    // Ensure proper UTF-8 encoding
    console.log("Attempting to call contract.call('recordDonation')...");
    // Use contract.call for v3 write operations
    const tx = await contract.call("recordDonation", [
      donorId, recipientId, amount.toString(), currency, donationType, metadataStr
    ]);
    console.log("Transaction submitted (v3):", tx);

    const receipt = tx.receipt;
    console.log("Transaction receipt (v3):", receipt);

    // Parse donationId from event logs
    let donationId = 0;
    const events = await contract.events.getEvents("DonationRecorded", {
        order: "desc",
        filters: {
            // Optionally filter by something if needed, otherwise get all
        }
    });

    // Find the event related to this transaction (may need better matching)
    const relatedEvent = events.find(event => event.transaction.transactionHash === receipt.transactionHash);

    if (relatedEvent) {
        donationId = Number(relatedEvent.data.donationId);
        console.log(`Parsed Donation ID from event (v3): ${donationId}`);
    } else {
        console.warn("DonationRecorded event not found for this transaction hash.");
        // Fallback or alternative parsing might be needed if event finding is unreliable
    }

    return {
      donationId: donationId || 0, // Return 0 if event not found
      txHash: receipt.transactionHash
    };
  } catch (error) {
    console.error("Error recording donation on blockchain (v3):", error);
    throw error;
  }
};

// --- getDonation function (v3 style - read call) ---
const getDonation = async (donationId) => {
  try {
    const contract = await getDonationTrackerContract();
    // Use contract.call for v3 read operations too
    const result = await contract.call("getDonation", [donationId]);

    let metadata = {};
    try {
      metadata = JSON.parse(result[7]);
    } catch (e) {
      console.error("Error parsing metadata JSON (v3):", e);
    }

    return {
      donor: result[0],
      donorId: result[1],
      recipientId: result[2],
      amount: result[3].toString(),
      currency: result[4],
      donationType: result[5],
      timestamp: new Date(Number(result[6]) * 1000),
      metadata
    };
  } catch (error) {
    console.error("Error getting donation from blockchain (v3):", error);
    throw error;
  }
};

// --- getDonationCount function (v3 style) ---
const getDonationCount = async () => {
  try {
    const contract = await getDonationTrackerContract();
    const count = await contract.call("getDonationCount");
    return parseInt(count.toString());
  } catch (error) {
    console.error("Error getting donation count from blockchain (v3):", error);
    throw error;
  }
};

// --- getLatestDonations function (v3 style) ---
const getLatestDonations = async (count = 10) => {
  try {
    const contract = await getDonationTrackerContract();
    const idsBigInt = await contract.call("getLatestDonations", [count]);
    const ids = idsBigInt.map(id => parseInt(id.toString()));

    const donations = await Promise.all(
      ids.map(id => getDonation(id))
    );

    return donations;
  } catch (error) {
    console.error("Error getting latest donations from blockchain (v3):", error);
    throw error;
  }
};

// --- Exports remain the same ---
module.exports = {
  recordDonation,
  getDonation,
  getDonationCount,
  getLatestDonations
}; 