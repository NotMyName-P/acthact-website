// Load environment variables from the .env file.
// This is how we keep our secret keys safe.
require('dotenv').config();

const express = require('express');
const cors = require('cors'); // Middleware to handle cross-origin requests

// Initialize Stripe with the secret key from our .env file.
// IMPORTANT: process.env.STRIPE_SECRET_KEY will be undefined if you don't have a .env file
// or if the environment variables are not set on your hosting platform (like Render).
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const app = express();
const PORT = process.env.PORT || 4242; // Render will set the PORT environment variable for you.

// --- Middleware ---

// Enable CORS so your frontend (on a different URL like Netlify) can talk to this backend.
app.use(cors());

// Enable the server to read and understand JSON in the body of requests.
app.use(express.json());


// --- API Routes ---

// A simple test route to make sure the server is alive.
app.get('/', (req, res) => {
  res.send('ActHact Backend Server is running!');
});

// The main route for handling payment processing.
app.post('/create-payment-intent', async (req, res) => {
  // Extract the payment details sent from the frontend script.js
  const { paymentMethodId, amount, currency, description } = req.body;

  // Basic validation to ensure we have the necessary data.
  if (!paymentMethodId || !amount || !currency) {
    return res.status(400).json({ error: { message: "Missing required payment information." } });
  }

  try {
    // Create a PaymentIntent with Stripe.
    // This is the core of the payment processing.
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,                 // Amount in the smallest currency unit (e.g., cents)
      currency: currency,             // e.g., 'usd'
      description: description,       // e.g., 'Purchase of Premium Course'
      payment_method: paymentMethodId,// The non-sensitive ID from the frontend
      confirm: true,                  // Immediately try to capture the payment
      // automatic_payment_methods: { enabled: true }, // A modern way to let Stripe handle payment methods
      return_url: 'https://YOUR_NETLIFY_SITE_URL/success.html', // The URL to return to after 3D Secure
    });

    console.log("PaymentIntent created:", paymentIntent.id);

    // --- Handle the response from Stripe ---

    if (paymentIntent.status === 'requires_action' || paymentIntent.status === 'requires_source_action') {
      // This means the payment requires an extra step, like 3D Secure authentication.
      // We send the `client_secret` back to the frontend. Stripe.js on the frontend
      // will use this to show the authentication popup to the user.
      res.json({
        requiresAction: true,
        clientSecret: paymentIntent.client_secret,
      });
    } else if (paymentIntent.status === 'succeeded') {
      // The payment was successful!
      res.json({ success: true, status: 'Payment Succeeded!' });
    } else {
      // The payment failed for another reason.
      res.status(400).json({ error: { message: 'Payment failed with status: ' + paymentIntent.status } });
    }

  } catch (error) {
    // Handle any errors from the Stripe API (e.g., invalid key, network issues).
    console.error('Stripe API Error:', error.message);
    res.status(500).json({ error: { message: error.message } });
  }
});

// Start the server and listen for incoming requests.
app.listen(PORT, () => {
  console.log(`Server is live and listening on port ${PORT}`);
});