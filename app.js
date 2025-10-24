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
} from './src/paypalServerSdk.js';
import { configureRoutes } from './src/routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Enable CORS for all requests - configure for production hosting
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://localhost:8080',
    'https://pp-webv6-demos.onrender.com',
    /^https:\/\/.*\.onrender\.com$/,
  ],
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

// Parse JSON bodies with increased limit for PayPal callbacks
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Trust proxy for Render hosting
app.set('trust proxy', 1);

// Add security headers for production
app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
  }
  next();
});

// Add request logging middleware
app.use((req, res, next) => {
  if (req.path.includes('/paypal-api/')) {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    if (req.body && Object.keys(req.body).length > 0) {
      console.log('Request body keys:', Object.keys(req.body));
    }
  }
  next();
});

// Configure static file serving and web page routes
configureRoutes(app, __dirname);

// Health check endpoint for Render
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// PayPal v6 Web SDK API endpoints
app.get('/paypal-api/auth/browser-safe-client-token', async (req, res) => {
  try {
    const { jsonResponse, httpStatusCode } = await getBrowserSafeClientToken();
    res.status(httpStatusCode).json(jsonResponse);
  } catch (error) {
    console.error('Failed to get client token:', error);
    res.status(500).json({ error: 'Failed to get client token' });
  }
});

app.post(
  '/paypal-api/checkout/orders/create-with-sample-data',
  async (req, res) => {
    try {
      console.log('Creating PayPal order with sample data');
      const { jsonResponse, httpStatusCode } =
        await createOrderWithSampleData();
      console.log('PayPal order created:', jsonResponse.id);
      res.status(httpStatusCode).json(jsonResponse);
    } catch (error) {
      console.error('Failed to create sample order:', error);
      res.status(500).json({ error: 'Failed to create sample order' });
    }
  }
);

app.post('/paypal-api/checkout/orders/:orderID/capture', async (req, res) => {
  try {
    const { orderID } = req.params;
    console.log(`Capturing PayPal order: ${orderID}`);
    const { jsonResponse, httpStatusCode } = await captureOrder(orderID);
    console.log('PayPal order captured:', jsonResponse.id);
    res.status(httpStatusCode).json(jsonResponse);
  } catch (error) {
    console.error('Failed to capture order:', error);
    res.status(500).json({ error: 'Failed to capture order' });
  }
});

app.post('/paypal-api/checkout/payment-tokens', async (req, res) => {
  try {
    console.log(
      'Creating PayPal payment token with data:',
      JSON.stringify(req.body, null, 2)
    );
    const { jsonResponse, httpStatusCode } = await createPaymentToken(req.body);
    console.log('PayPal payment token created:', jsonResponse.id);
    res.status(httpStatusCode).json(jsonResponse);
  } catch (error) {
    console.error('Failed to create payment token:', error);
    res.status(500).json({ error: 'Failed to create payment token' });
  }
});

// PayPal Server-Side Shipping Callback Endpoint
app.post('/paypal-api/checkout/shipping-callback', async (req, res) => {
  const startTime = Date.now();
  const { id, shipping_address, shipping_option, purchase_units } = req.body;

  try {
    console.log('PayPal Shipping Callback Received:');
    console.log('Order ID:', id);
    console.log('Shipping Address:', shipping_address);
    console.log('Shipping Option:', shipping_option);
    console.log('Purchase Units:', purchase_units);
    console.log('Request headers:', {
      'user-agent': req.get('User-Agent'),
      'content-type': req.get('Content-Type'),
      'x-forwarded-for': req.get('X-Forwarded-For'),
      'x-real-ip': req.get('X-Real-IP'),
    });

    // Validate required data
    if (!shipping_address || !purchase_units || !purchase_units[0]) {
      return res.status(400).json({
        name: 'BAD_REQUEST',
        message: 'Missing required shipping callback data',
        details: [
          {
            issue: 'MISSING_REQUIRED_PARAMETER',
            description: 'shipping_address and purchase_units are required',
          },
        ],
      });
    }

    // Check if the shipping address country is not USA
    if (shipping_address.country_code !== 'US') {
      console.log(
        `Rejecting non-US shipping address: ${shipping_address.country_code}`
      );
      return res.status(422).json({
        name: 'UNPROCESSABLE_ENTITY',
        message: 'Shipping only available within the United States',
        details: [
          {
            issue: 'COUNTRY_ERROR',
            description: `Shipping not available to ${shipping_address.country_code}. We only ship within the United States.`,
          },
        ],
      });
    }

    // Log breakdown and shipping details
    const purchaseUnit = purchase_units[0];
    if (purchaseUnit.amount.breakdown) {
      console.log(
        'Current Breakdown:',
        JSON.stringify(purchaseUnit.amount.breakdown, null, 2)
      );
    }
    if (purchaseUnit.shipping) {
      console.log(
        'Current Shipping:',
        JSON.stringify(purchaseUnit.shipping, null, 2)
      );
    }

    // Calculate the total amount
    let itemTotal = parseFloat(
      purchaseUnit.amount.breakdown?.item_total?.value ||
        purchaseUnit.amount.value
    );

    // Define shipping amounts for both options
    const freeShippingAmount = 0;
    const expressShippingAmount = 10; // Express shipping is $10.00

    // Determine which shipping option is selected
    let selectedShippingAmount = freeShippingAmount; // default to free
    let selectedShippingId = '1';

    if (shipping_option?.id === '2') {
      selectedShippingAmount = expressShippingAmount;
      selectedShippingId = '2';
    }

    // Calculate tax based on state
    const stateCode = shipping_address.admin_area_1;
    const taxRates = {
      CA: 0.1075, // 10.75% - California
      NY: 0.08, // 8% - New York
    };

    const taxRate = taxRates[stateCode] || 0;
    const taxAmount = itemTotal * taxRate;

    // Update shippingAmount and totalAmount based on selected option
    const shippingAmount = selectedShippingAmount;
    const totalAmount = (itemTotal + shippingAmount + taxAmount).toFixed(2);

    console.log(
      `Calculated amounts - Item: $${itemTotal.toFixed(
        2
      )}, Tax: $${taxAmount.toFixed(2)} (${(taxRate * 100).toFixed(
        1
      )}%), Shipping: $${shippingAmount.toFixed(2)}, Total: $${totalAmount}`
    );

    // Construct the response
    const response = {
      id: id,
      purchase_units: [
        {
          reference_id: purchaseUnit.reference_id || 'default',
          amount: {
            currency_code: 'USD',
            value: totalAmount,
            breakdown: {
              item_total: {
                currency_code: 'USD',
                value: itemTotal.toFixed(2),
              },
              shipping: {
                currency_code: 'USD',
                value: shippingAmount.toFixed(2),
              },
              tax_total: {
                currency_code: 'USD',
                value: taxAmount.toFixed(2),
              },
            },
          },
          shipping_options: [
            {
              id: '1',
              amount: {
                currency_code: 'USD',
                value: freeShippingAmount.toFixed(2),
              },
              type: 'SHIPPING',
              label: 'Free Shipping',
              selected: selectedShippingId === '1',
            },
            {
              id: '2',
              amount: {
                currency_code: 'USD',
                value: expressShippingAmount.toFixed(2),
              },
              type: 'SHIPPING',
              label: 'Express Shipping',
              selected: selectedShippingId === '2',
            },
          ],
        },
      ],
    };

    const processingTime = Date.now() - startTime;
    console.log('Server Callback Response:', JSON.stringify(response, null, 2));
    console.log(`Callback processed in ${processingTime}ms`);

    // Set appropriate headers for PayPal callback response
    res.set({
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    });

    // Respond with the constructed response
    res.status(200).json(response);
  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error('Shipping callback error:', error);
    console.error(`Error occurred after ${processingTime}ms`);
    console.error('Error stack:', error.stack);

    res.status(500).json({
      name: 'INTERNAL_SERVER_ERROR',
      message: 'Server error during shipping callback processing',
      details: [
        {
          issue: 'SERVER_ERROR',
          description:
            'An internal server error occurred while processing the shipping callback',
        },
      ],
    });
  }
});

const port = process.env.PORT || 8080;
const host = process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost';
const baseUrl =
  process.env.NODE_ENV === 'production'
    ? 'https://pp-webv6-demos.onrender.com'
    : `http://localhost:${port}`;

app.listen(port, host, () => {
  console.log(`Server running at ${baseUrl}`);
  console.log(`PayPal Checkout page: ${baseUrl}/paypal-payments`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(
    `Shipping callback endpoint: ${baseUrl}/paypal-api/checkout/shipping-callback`
  );
});
