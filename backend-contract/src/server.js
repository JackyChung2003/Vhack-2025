require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { createClient } = require('@supabase/supabase-js');
const donationBlockchainService = require('./donationBlockchainService');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 4000;

// Initialize Supabase client with service role key (IMPORTANT: Secure this in production)
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Middleware to verify server-side authentication
const authenticate = async (req, res, next) => {
  try {
    // In a real application, you'd implement proper authentication.
    // This could be a server-to-server API key or other mechanism.
    const apiKey = req.headers['x-api-key'];
    if (!apiKey || apiKey !== process.env.BLOCKCHAIN_API_KEY) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ error: 'Unauthorized' });
  }
};

// Routes
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Record a donation on the blockchain
app.post('/donations', authenticate, async (req, res) => {
  try {
    const { 
      donorId, 
      recipientId, 
      amount, 
      currency, 
      donationType,
      metadata 
    } = req.body;

    if (!donorId || !recipientId || !amount || !currency || !donationType) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Sanitize and validate metadata before sending to blockchain
    let safeMetadata = {};
    
    if (metadata) {
      if (typeof metadata === 'string') {
        try {
          // If it's a string, try to parse it as JSON
          safeMetadata = JSON.parse(metadata);
        } catch (e) {
          console.warn("Received invalid JSON metadata string:", metadata);
          // If parsing fails, use it as-is but only if it's not too large
          if (metadata.length <= 1000) {
            safeMetadata = { rawData: metadata.replace(/[^\x20-\x7E]/g, '') }; // Keep only printable ASCII
          } else {
            safeMetadata = { error: "Metadata too large or contains invalid characters" };
          }
        }
      } else if (typeof metadata === 'object') {
        // If it's already an object, sanitize its string properties
        safeMetadata = Object.entries(metadata).reduce((acc, [key, value]) => {
          if (typeof value === 'string') {
            // Clean string values
            acc[key] = value.replace(/[^\x20-\x7E]/g, '').trim().substring(0, 200);
          } else if (typeof value === 'number' || typeof value === 'boolean') {
            // Keep numbers and booleans
            acc[key] = value;
          } else if (value === null || value === undefined) {
            // Skip null/undefined
            acc[key] = '';
          }
          return acc;
        }, {});
      }
    }
    
    console.log("Sanitized metadata:", JSON.stringify(safeMetadata));

    // Record on blockchain
    const result = await donationBlockchainService.recordDonation(
      donorId,
      recipientId,
      amount,
      currency,
      donationType,
      safeMetadata
    );

    // Return the blockchain transaction result
    res.status(201).json({
      message: 'Donation recorded on blockchain',
      donationId: result.donationId,
      txHash: result.txHash
    });
  } catch (error) {
    console.error('Error recording donation:', error);
    res.status(500).json({ error: 'Error recording donation' });
  }
});

// Get donation details from blockchain
app.get('/donations/:id', authenticate, async (req, res) => {
  try {
    const donationId = parseInt(req.params.id);
    const donation = await donationBlockchainService.getDonation(donationId);
    res.json(donation);
  } catch (error) {
    console.error('Error getting donation:', error);
    res.status(500).json({ error: 'Error getting donation' });
  }
});

// Get latest donations from blockchain
app.get('/donations', authenticate, async (req, res) => {
  try {
    const count = parseInt(req.query.count || '10');
    const donations = await donationBlockchainService.getLatestDonations(count);
    res.json(donations);
  } catch (error) {
    console.error('Error getting donations:', error);
    res.status(500).json({ error: 'Error getting donations' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 