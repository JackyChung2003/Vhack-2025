// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title DonationTracker
 * @dev Contract for tracking donations with Thirdweb
 */
contract DonationTracker is Ownable {
    // Struct to store donation details
    struct Donation {
        address donor;        // The admin address that processed the donation
        string donorId;       // The Supabase user ID of the donor
        string recipientId;   // The Supabase ID of the recipient (charity or campaign)
        uint256 amount;       // Amount in the smallest unit (wei)
        string currency;      // Currency code (e.g., "MYR")
        string donationType;  // Type of donation ("campaign" or "organization")
        uint256 timestamp;    // Timestamp when donation was recorded
        string metadata;      // Additional metadata (JSON string)
    }

    // Events
    event DonationRecorded(
        uint256 indexed donationId, 
        string donorId, 
        string recipientId, 
        uint256 amount, 
        string currency,
        string donationType,
        uint256 timestamp
    );

    event DonationRecordedDetailed(
        uint256 indexed donationId, 
        string donorId,
        string donorName,
        string recipientId, 
        string recipientName,
        uint256 amount, 
        string currency,
        string donationType
    );

    // Donation counter
    uint256 private _donationCounter;
    
    // Mapping from donation ID to Donation
    mapping(uint256 => Donation) private _donations;

    constructor() Ownable(msg.sender) {
        _donationCounter = 0;
    }

    /**
     * @dev Records a donation
     * @param donorId The Supabase user ID of the donor
     * @param recipientId The Supabase ID of the recipient
     * @param amount The donation amount in smallest unit
     * @param currency The currency code
     * @param donationType The type of donation
     * @param metadata Additional metadata as JSON string
     * @return donationId The ID of the recorded donation
     */
    function recordDonation(
        string memory donorId,
        string memory recipientId,
        uint256 amount,
        string memory currency,
        string memory donationType,
        string memory metadata
    ) public onlyOwner returns (uint256) {
        uint256 donationId = _donationCounter;
        
        _donations[donationId] = Donation({
            donor: msg.sender,
            donorId: donorId,
            recipientId: recipientId,
            amount: amount,
            currency: currency,
            donationType: donationType,
            timestamp: block.timestamp,
            metadata: metadata
        });
        
        emit DonationRecorded(
            donationId,
            donorId,
            recipientId,
            amount,
            currency,
            donationType,
            block.timestamp
        );
        
        // Parse metadata to extract key fields
        // (This requires careful implementation)
        
        // Emit detailed event
        emit DonationRecordedDetailed(
            donationId,
            donorId,
            metadata.donorName, // This would require JSON parsing in Solidity
            recipientId,
            metadata.charityName,
            amount,
            currency,
            donationType
        );
        
        _donationCounter++;
        return donationId;
    }

    /**
     * @dev Gets donation by ID
     * @param donationId The donation ID
     * @return donor The address that processed the donation
     * @return donorId The Supabase user ID of the donor
     * @return recipientId The Supabase ID of the recipient
     * @return amount The donation amount
     * @return currency The currency code
     * @return donationType The type of donation
     * @return timestamp The timestamp when donation was recorded
     * @return metadata Additional metadata as JSON string
     */
    function getDonation(uint256 donationId) public view returns (
        address donor,
        string memory donorId,
        string memory recipientId,
        uint256 amount,
        string memory currency,
        string memory donationType,
        uint256 timestamp,
        string memory metadata
    ) {
        require(donationId < _donationCounter, "Donation does not exist");
        
        Donation storage donation = _donations[donationId];
        return (
            donation.donor,
            donation.donorId,
            donation.recipientId,
            donation.amount,
            donation.currency,
            donation.donationType,
            donation.timestamp,
            donation.metadata
        );
    }

    /**
     * @dev Gets the total number of donations
     * @return The donation count
     */
    function getDonationCount() public view returns (uint256) {
        return _donationCounter;
    }

    /**
     * @dev Gets the latest donations
     * @param count The number of latest donations to retrieve
     * @return An array of donation IDs
     */
    function getLatestDonations(uint256 count) public view returns (uint256[] memory) {
        uint256 resultCount = count;
        if (_donationCounter < count) {
            resultCount = _donationCounter;
        }
        
        uint256[] memory result = new uint256[](resultCount);
        for (uint256 i = 0; i < resultCount; i++) {
            result[i] = _donationCounter - i - 1;
        }
        
        return result;
    }
} 