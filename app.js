import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

import {
  getBrowserSafeClientToken,
  createOrder,
  createOrderWithSampleData,
  captureOrder,
  createPaymentToken,
  createSetupTokenWithSampleDataForPayPal,
} from './src/paypalServerSdk.js';
import { configureRoutes } from './src/routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Configure Express
app.use(cors());
app.use(express.json());

// Configure all routes (static and web pages)
configureRoutes(app);

// Set EJS as template engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

/* ######################################################################
 * API Endpoints for the client-side JavaScript PayPal Integration code
 * ###################################################################### */

app.get('/paypal-api/auth/browser-safe-client-token', async (req, res) => {
  try {
    const { jsonResponse, httpStatusCode } = await getBrowserSafeClientToken();
    res.status(httpStatusCode).json(jsonResponse);
  } catch (error) {
    console.error('Failed to create browser safe access token:', error);
    res
      .status(500)
      .json({ error: 'Failed to create browser safe access token.' });
  }
});

app.post('/paypal-api/checkout/orders/create', async (req, res) => {
  try {
    const paypalRequestId = req.headers['paypal-request-id']?.toString();
    const { jsonResponse, httpStatusCode } = await createOrder({
      orderRequestBody: req.body,
      paypalRequestId,
    });
    res.status(httpStatusCode).json(jsonResponse);
  } catch (error) {
    console.error('Failed to create order:', error);
    res.status(500).json({ error: 'Failed to create order.' });
  }
});

app.post(
  '/paypal-api/checkout/orders/create-with-sample-data',
  async (req, res) => {
    try {
      const { jsonResponse, httpStatusCode } =
        await createOrderWithSampleData();
      res.status(httpStatusCode).json(jsonResponse);
    } catch (error) {
      console.error('Failed to create order:', error);
      res.status(500).json({ error: 'Failed to create order.' });
    }
  }
);

app.post('/paypal-api/checkout/orders/:orderId/capture', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { jsonResponse, httpStatusCode } = await captureOrder(orderId);
    res.status(httpStatusCode).json(jsonResponse);
  } catch (error) {
    console.error('Failed to capture order:', error);
    res.status(500).json({ error: 'Failed to capture order.' });
  }
});

app.post('/paypal-api/vault/setup-token/create', async (req, res) => {
  try {
    const { jsonResponse, httpStatusCode } =
      await createSetupTokenWithSampleDataForPayPal();
    res.status(httpStatusCode).json(jsonResponse);
  } catch (error) {
    console.error('Failed to create setup token:', error);
    res.status(500).json({ error: 'Failed to create setup token.' });
  }
});

app.post('/paypal-api/vault/payment-token/create', async (req, res) => {
  try {
    const { jsonResponse, httpStatusCode } = await createPaymentToken(
      req.body.vaultSetupToken
    );

    if (jsonResponse.id) {
      // This payment token id is a long-lived value for making
      // future payments when the buyer is not present.
      // PayPal recommends storing this value in your database
      // and NOT returning it back to the browser.
      await savePaymentTokenToDatabase(jsonResponse);
      res.status(httpStatusCode).json({
        status: 'SUCCESS',
        description: 'Payment token saved to database for future transactions',
      });
    } else {
      res.status(httpStatusCode).json({
        status: 'ERROR',
        description: 'Failed to create payment token',
      });
    }
  } catch (error) {
    console.error('Failed to create payment token:', error);
    res.status(500).json({ error: 'Failed to create payment token.' });
  }
});

async function savePaymentTokenToDatabase(paymentTokenResponse) {
  // example function to teach saving the paymentToken to a database
  // to be used for future transactions
  return Promise.resolve();
}

const port = process.env.PORT ?? 8080;

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
