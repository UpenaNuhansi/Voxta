const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
// Loads environment variables from a .env file into process.env
require('dotenv').config();

const app = express();
const port = 3000;

// --- Middleware ---
// Enable Cross-Origin Resource Sharing (CORS) so frontend can call this server
app.use(cors());
// Enable the express app to parse JSON formatted request bodies
app.use(express.json());

// --- START OF FIX ---
// Get the Google API key from your environment variables
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

// Check if the API key was loaded correctly when the server starts.
if (!GOOGLE_API_KEY) {
  console.error('🔴 FATAL ERROR: GOOGLE_API_KEY not found.');
  console.error('Please create a .env file in the root directory with the line:');
  console.error('GOOGLE_API_KEY=YOUR_SECRET_API_KEY');
  process.exit(1); // Stop the server from starting if the key is missing
}

const GOOGLE_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${GOOGLE_API_KEY}`;
// --- END OF FIX ---


// This is the endpoint your frontend will call
app.post('/api/generate-audio', async (req, res) => {
  try {
    // Forward the request from the frontend to the actual Google API
    const googleResponse = await fetch(GOOGLE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      // Pass the body from the original frontend request
      body: JSON.stringify(req.body)
    });

    // Check if the request to Google's API was successful
    if (!googleResponse.ok) {
      const errorData = await googleResponse.json();
      console.error('Error from Google API:', errorData);
      // Forward the exact error from Google back to the frontend
      return res.status(googleResponse.status).json(errorData);
    }

    // Send the successful response from Google back to the frontend
    const data = await googleResponse.json();
    res.json(data);

  } catch (error) {
    console.error('Error in proxy server:', error);
    res.status(500).json({ error: 'An internal server error occurred.' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`✅ Secure proxy server running at http://localhost:${port}`);
  console.log('API key has been loaded successfully.');
  console.log('Your frontend should now send requests here.');
});

