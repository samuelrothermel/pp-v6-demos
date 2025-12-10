import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

import {
  getBrowserSafeClientToken,
  createOrder,
  createOrderWithSampleData,
  createOrderWithServerCallbacks,
  captureOrder,
  createPaymentToken,
} from './src/paypalServerSdk.js';
import { configureRoutes } from './src/routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Enable CORS for all requests
app.use(cors());

// Parse JSON bodies
app.use(express.json());

// Configure static file serving and web page routes
configureRoutes(app, __dirname);

// API routes
app.get('/api/paypal/client-token', async (req, res) => {
  try {
    const response = await getBrowserSafeClientToken();
    const clientToken = response.jsonResponse.accessToken;
    res.json({ clientToken });
  } catch (error) {
    console.error('Failed to get client token:', error);
    res.status(500).json({ error: 'Failed to get client token' });
  }
});

// Legacy client token endpoint (for backward compatibility)
app.get('/paypal-api/auth/browser-safe-client-token', async (req, res) => {
  try {
    const { jsonResponse, httpStatusCode } = await getBrowserSafeClientToken();
    res.status(httpStatusCode).json(jsonResponse);
  } catch (error) {
    console.error('Failed to get client token:', error);
    res.status(500).json({ error: 'Failed to get client token' });
  }
});

// Legacy order creation endpoint (for backward compatibility)
app.post(
  '/paypal-api/checkout/orders/create-with-sample-data',
  async (req, res) => {
    try {
      console.log('🧪 Creating sample PayPal order (legacy endpoint)');
      const { jsonResponse, httpStatusCode } =
        await createOrderWithSampleData();
      console.log('✅ Sample PayPal order created:', jsonResponse.id);
      res.status(httpStatusCode).json(jsonResponse);
    } catch (error) {
      console.error('Failed to create sample order:', error);
      res.status(500).json({ error: 'Failed to create sample order' });
    }
  }
);

// Legacy order capture endpoint (for backward compatibility)
app.post('/paypal-api/checkout/orders/:orderID/capture', async (req, res) => {
  try {
    const { orderID } = req.params;
    console.log(`💳 Capturing PayPal order (legacy endpoint): ${orderID}`);
    const { jsonResponse, httpStatusCode } = await captureOrder(orderID);
    console.log('✅ PayPal order captured:', jsonResponse.id);
    res.status(httpStatusCode).json(jsonResponse);
  } catch (error) {
    console.error('Failed to capture order:', error);
    res.status(500).json({ error: 'Failed to capture order' });
  }
});

app.post('/api/paypal/orders', async (req, res) => {
  try {
    console.log(
      'Creating PayPal order with data:',
      JSON.stringify(req.body, null, 2)
    );
    const response = await createOrder(req.body);
    const order = response.jsonResponse;
    console.log('PayPal order created:', order.id);
    res.json(order);
  } catch (error) {
    console.error('Failed to create order:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

app.post('/api/paypal/orders/:orderID/capture', async (req, res) => {
  try {
    const { orderID } = req.params;
    console.log(`Capturing PayPal order: ${orderID}`);
    const response = await captureOrder(orderID);
    const capture = response.jsonResponse;
    console.log('PayPal order captured:', capture.id);
    res.json(capture);
  } catch (error) {
    console.error('Failed to capture order:', error);
    res.status(500).json({ error: 'Failed to capture order' });
  }
});

app.post('/api/paypal/sample-order', async (req, res) => {
  try {
    console.log('Creating sample PayPal order');
    const response = await createOrderWithSampleData();
    const order = response.jsonResponse;
    console.log('Sample PayPal order created:', order.id);
    res.json(order);
  } catch (error) {
    console.error('Failed to create sample order:', error);
    res.status(500).json({ error: 'Failed to create sample order' });
  }
});

// Server-side callbacks specific endpoint
app.post(
  '/paypal-api/checkout/orders/create-with-server-callbacks',
  async (req, res) => {
    try {
      console.log('🔄 Creating PayPal order with server-side callbacks');
      const { jsonResponse, httpStatusCode } =
        await createOrderWithServerCallbacks();
      console.log(
        '✅ PayPal order with server callbacks created:',
        jsonResponse.id
      );
      res.status(httpStatusCode).json(jsonResponse);
    } catch (error) {
      console.error('Failed to create order with server callbacks:', error);
      res
        .status(500)
        .json({ error: 'Failed to create order with server callbacks' });
    }
  }
);

app.post('/api/paypal/payment-tokens', async (req, res) => {
  try {
    console.log(
      'Creating PayPal payment token with data:',
      JSON.stringify(req.body, null, 2)
    );
    const response = await createPaymentToken(req.body);
    const paymentToken = response.jsonResponse;
    console.log('PayPal payment token created:', paymentToken.id);
    res.json(paymentToken);
  } catch (error) {
    console.error('Failed to create payment token:', error);
    res.status(500).json({ error: 'Failed to create payment token' });
  }
});

// PayPal Server-Side Callback Endpoints
app.post('/paypal-callbacks/shipping', (req, res) => {
  console.log(
    '📦 PayPal Shipping Callback received:',
    JSON.stringify(req.body, null, 2)
  );

  const {
    id: orderId,
    shipping_address,
    shipping_option,
    purchase_units,
  } = req.body;

  console.log('🆔 Order ID:', orderId);
  console.log('📍 Shipping Address:', shipping_address);
  console.log('📦 Current Shipping Option:', shipping_option);
  console.log('🛒 Purchase Units:', purchase_units);

  // Determine callback type based on presence of shipping_option
  // Initial callback (SHIPPING_ADDRESS) won't have shipping_option
  const isShippingAddressCallback = !shipping_option;
  const callbackType = isShippingAddressCallback
    ? 'SHIPPING_ADDRESS'
    : 'SHIPPING_OPTIONS';

  console.log('🎯 Callback Type:', callbackType);

  try {
    // Validate shipping address
    const addressValidation = validateShippingAddress(shipping_address);

    if (!addressValidation.isValid) {
      console.log('❌ Address validation failed:', addressValidation.error);
      return res.status(422).json({
        name: 'UNPROCESSABLE_ENTITY',
        details: [
          {
            issue: addressValidation.error,
          },
        ],
      });
    }

    // Calculate shipping options based on address
    const shippingOptions = calculateShippingOptions(
      shipping_address,
      shipping_option
    );

    // Calculate updated amounts
    const updatedAmounts = calculateUpdatedAmounts(
      purchase_units,
      shippingOptions,
      shipping_option,
      shipping_address
    );

    // Build response according to PayPal specification
    const callbackResponse = {
      id: orderId,
      purchase_units: [
        {
          reference_id: purchase_units[0]?.reference_id || 'default',
          amount: updatedAmounts,
          shipping_options: shippingOptions,
        },
      ],
    };

    console.log(
      '✅ Sending successful callback response:',
      JSON.stringify(callbackResponse, null, 2)
    );
    res.status(200).json(callbackResponse);
  } catch (error) {
    console.error('❌ Error processing callback:', error);
    res.status(500).json({
      name: 'INTERNAL_SERVER_ERROR',
      details: [
        {
          issue: 'PROCESSING_ERROR',
          description: 'Unable to process shipping callback',
        },
      ],
    });
  }
});

// Helper function to validate shipping address
function validateShippingAddress(address) {
  if (!address) {
    return { isValid: false, error: 'ADDRESS_ERROR' };
  }

  const { country_code, admin_area_1, admin_area_2, postal_code } = address;

  // Only ship to US
  if (country_code !== 'US') {
    return { isValid: false, error: 'COUNTRY_ERROR' };
  }

  // Check if we ship to this state (example: don't ship to Alaska or Hawaii for demo)
  const restrictedStates = ['AK', 'HI'];
  if (restrictedStates.includes(admin_area_1)) {
    return { isValid: false, error: 'STATE_ERROR' };
  }

  // Check postal code format (basic validation)
  if (
    country_code === 'US' &&
    postal_code &&
    !/^\d{5}(-\d{4})?$/.test(postal_code)
  ) {
    return { isValid: false, error: 'ZIP_ERROR' };
  }

  return { isValid: true };
}

// Helper function to calculate shipping options based on address
function calculateShippingOptions(address, currentOption) {
  const { country_code, admin_area_1 } = address;

  // Base shipping options
  const shippingOptions = [
    {
      id: '1',
      label: 'Standard Shipping (5-7 business days)',
      type: 'SHIPPING',
      amount: {
        currency_code: 'USD',
        value: '5.99',
      },
      selected: false,
    },
    {
      id: '2',
      label: 'Express Shipping (2-3 business days)',
      type: 'SHIPPING',
      amount: {
        currency_code: 'USD',
        value: '12.99',
      },
      selected: false,
    },
    {
      id: '3',
      label: 'Overnight Shipping (1 business day)',
      type: 'SHIPPING',
      amount: {
        currency_code: 'USD',
        value: '24.99',
      },
      selected: false,
    },
  ];

  // All shipping is domestic US shipping now
  // No additional adjustments needed since we only support US

  // Set default selection or maintain current selection
  if (currentOption && currentOption.id) {
    const selectedOption = shippingOptions.find(
      opt => opt.id === currentOption.id
    );
    if (selectedOption) {
      selectedOption.selected = true;
    }
  } else {
    // Default to standard shipping for initial callback
    shippingOptions[0].selected = true;
  }

  return shippingOptions;
}

// Helper function to calculate updated amounts
function calculateUpdatedAmounts(
  purchaseUnits,
  shippingOptions,
  selectedOption,
  shippingAddress
) {
  const originalAmount = purchaseUnits[0]?.amount;
  if (!originalAmount) {
    throw new Error('No purchase unit amount found');
  }

  // Find selected shipping option
  const selectedShipping = selectedOption
    ? shippingOptions.find(opt => opt.id === selectedOption.id)
    : shippingOptions.find(opt => opt.selected);

  const shippingCost = selectedShipping
    ? parseFloat(selectedShipping.amount.value)
    : 0;
  const itemTotal = parseFloat(originalAmount.value);

  // Calculate tax based on state - only NY and CA have tax
  let taxAmount = 0;
  const state = shippingAddress?.admin_area_1;

  if (state === 'NY') {
    taxAmount = itemTotal * 0.08; // 8% NY state tax
    console.log('💰 Applying NY state tax (8%):', taxAmount.toFixed(2));
  } else if (state === 'CA') {
    taxAmount = itemTotal * 0.0725; // 7.25% CA state tax
    console.log('💰 Applying CA state tax (7.25%):', taxAmount.toFixed(2));
  } else {
    console.log('💰 No state tax applied for state:', state);
  }

  const totalAmount = itemTotal + shippingCost + taxAmount;

  return {
    currency_code: 'USD',
    value: totalAmount.toFixed(2),
    breakdown: {
      item_total: {
        currency_code: 'USD',
        value: itemTotal.toFixed(2),
      },
      shipping: {
        currency_code: 'USD',
        value: shippingCost.toFixed(2),
      },
      tax_total: {
        currency_code: 'USD',
        value: taxAmount.toFixed(2),
      },
    },
  };
}

// Test endpoint to manually test the callback handler
app.post('/test-callback', (req, res) => {
  console.log('🧪 Testing callback handler with sample CA data...');

  // Sample CA callback data (like what you received)
  const testCallback = {
    id: '5B9509452T6112000',
    shipping_address: {
      admin_area_1: 'CA',
      admin_area_2: 'San Jose',
      postal_code: '95131',
      country_code: 'US',
    },
    purchase_units: [
      {
        reference_id: 'server-callbacks-demo-unit',
        amount: {
          currency_code: 'USD',
          value: '50.00',
          breakdown: {
            item_total: {
              currency_code: 'USD',
              value: '50.00',
            },
          },
        },
      },
    ],
  };

  // Forward to actual callback handler
  req.body = testCallback;
  console.log('📦 Forwarding test data to callback handler...');

  // Call the same logic as the real callback
  const { id: orderId, shipping_address, purchase_units } = testCallback;

  try {
    const addressValidation = validateShippingAddress(shipping_address);
    if (!addressValidation.isValid) {
      return res.status(422).json({
        name: 'UNPROCESSABLE_ENTITY',
        details: [{ issue: addressValidation.error }],
      });
    }

    const shippingOptions = calculateShippingOptions(shipping_address, null);
    const updatedAmounts = calculateUpdatedAmounts(
      purchase_units,
      shippingOptions,
      null,
      shipping_address
    );

    const callbackResponse = {
      id: orderId,
      purchase_units: [
        {
          reference_id: purchase_units[0]?.reference_id || 'default',
          amount: updatedAmounts,
          shipping_options: shippingOptions,
        },
      ],
    };

    console.log(
      '✅ Test callback response:',
      JSON.stringify(callbackResponse, null, 2)
    );
    res.status(200).json(callbackResponse);
  } catch (error) {
    console.error('❌ Test callback error:', error);
    res.status(500).json({ error: 'Test callback failed' });
  }
});

// PayPal return and cancel URL handlers
app.get('/return', (req, res) => {
  console.log('✅ PayPal return URL accessed:', req.query);
  res.send('<h1>Payment Successful!</h1><p>You can close this window.</p>');
});

app.get('/cancel', (req, res) => {
  console.log('❌ PayPal cancel URL accessed:', req.query);
  res.send('<h1>Payment Cancelled</h1><p>You can close this window.</p>');
});

// Legacy checkout route (for backward compatibility)
app.get('/checkout', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'checkout.html'));
});

const port = process.env.PORT ?? 8080;

app.listen(port, async () => {
  const baseUrl =
    process.env.PUBLIC_BASE_URL ||
    process.env.RAILWAY_PUBLIC_URL ||
    `http://localhost:${port}`;

  const isProduction =
    process.env.RAILWAY_PUBLIC_URL && process.env.PUBLIC_BASE_URL;

  console.log(`\n🚀 Server running on port ${port}`);
  console.log(`🌍 Base URL: ${baseUrl}`);
  console.log(`📱 PayPal Checkout page: ${baseUrl}/paypal-payments`);

  // Railway deployment info
  console.log('\n📦 Railway Deployment Configuration:');
  if (isProduction) {
    console.log('✅ Running in PRODUCTION mode');
    console.log(`✅ Public URL: ${baseUrl}`);
    console.log(`✅ Callback endpoint: ${baseUrl}/paypal-callbacks/shipping`);
  } else if (process.env.RAILWAY_PUBLIC_URL) {
    console.log('⚠️  Railway URL detected but PUBLIC_BASE_URL not set');
    console.log(`   Set PUBLIC_BASE_URL to: ${process.env.RAILWAY_PUBLIC_URL}`);
  } else {
    console.log('🏠 Running in LOCAL development mode');
    console.log(
      `   Local callback endpoint: ${baseUrl}/paypal-callbacks/shipping`
    );
    console.log('\n📋 To deploy to Railway:');
    console.log('   1. Push your code to GitHub');
    console.log('   2. Create a new project on Railway.app');
    console.log('   3. Connect your GitHub repository');
    console.log('   4. Add environment variables in Railway dashboard:');
    console.log('      - PAYPAL_SANDBOX_CLIENT_ID');
    console.log('      - PAYPAL_SANDBOX_CLIENT_SECRET');
    console.log('      - PUBLIC_BASE_URL (set to your Railway URL)');
    console.log('   5. Railway will auto-deploy your app');
  }

  console.log(
    `\n🎯 Server-side callbacks demo: ${baseUrl}/paypal-payments/one-time/server-callbacks`
  );
});
