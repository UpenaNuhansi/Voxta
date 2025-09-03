# Voxta: Document Audio Player 
Voxta is a minimalist web application that converts text documents (.txt and .pdf) into high-quality audio using Google's powerful generative AI models. It provides a clean, user-friendly interface that allows you to upload a document and instantly generate and play an audio version.

# Features
  * Document-to-Audio Conversion: Transform text content from .txt and .pdf files into speech.
  * Generative AI-Powered: Leverages the Google Gemini API for natural-sounding, high-quality audio generation.
  * User-Friendly Interface: A clean, single-page application with a sleek dark theme.
  * Responsive Design: The application is fully responsive and works seamlessly across desktops, tablets, and mobile devices.
  * Dynamic Backgrounds: The background changes automatically when audio is being played to provide visual feedback.

# Getting Started
Prerequisites
To run this project locally, you will need the following:
  * Node.js (LTS version recommended)
  * A Google Cloud project with the Generative Language API enabled.
  * An API key for the Generative Language API.

# Setup
1. Clone the Repository
    git clone https://github.com/UpenaNuhansi/Voxta.git
    cd Voxta

2. Install Dependencies
  Navigate to the project directory and install the required Node.js packages.
    npm install
   
3. Configure API Key
  Create a .env file in the root directory and add your Google Generative Language API key.
    GOOGLE_API_KEY=your_api_key_here
  Make sure to replace your_api_key_here with your actual API key.

4. Run the Server
  Start the local development server.
    npm start
  The application should now be running at http://localhost:3000. Open this URL in your browser to start using Voxta.

# How it Works
The application is built with a simple Express.js backend that handles the API calls to Google's Generative Language API. The frontend is a single HTML file that uses Tailwind CSS for styling and vanilla JavaScript to handle user interactions, file uploads, and audio playback.

  1. A user uploads a .txt or .pdf file.
  2. The JavaScript reads the file content.
  3. On clicking "Generate & Play Audio," the text content is sent to the backend.
  4. The backend makes a POST request to the Google Gemini API, requesting a text-to-speech conversion.
  5. The API returns the audio data as a base64-encoded string.
  6. The backend sends this data back to the frontend.
  7. The frontend converts the base64 data into a playable .wav audio file and embeds it in the page.
  8. The audio automatically starts playing, and the background changes to indicate playback.

# Technology Stack
  * Frontend: HTML, Tailwind CSS, JavaScript, PDF.js
  * Backend: Node.js, Express.js
  * API: Google Generative Language API (Gemini models)

# Contributing
We welcome contributions! If you have suggestions for improvements, new features, or bug fixes, feel free to open an issue or submit a pull request.

# License
This project is licensed under the MIT License.

# Acknowledgements
  * The Google Gemini team for providing the powerful text-to-speech model.
  * The PDF.js library for enabling PDF document parsing.
