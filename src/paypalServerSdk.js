import { config } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envFilePath = path.join(__dirname, '../', '.env');
config({ path: envFilePath });

import {
  ApiError,
  CheckoutPaymentIntent,
  Client,
  Environment,
  LogLevel,
  OAuthAuthorizationController,
  OrdersController,
  PaypalPaymentTokenUsageType,
  VaultController,
  VaultInstructionAction,
  VaultTokenRequestType,
} from '@paypal/paypal-server-sdk';

/* ######################################################################
 * Set up PayPal controllers
 * ###################################################################### */

const { DOMAINS, PAYPAL_SANDBOX_CLIENT_ID, PAYPAL_SANDBOX_CLIENT_SECRET } =
  process.env;

if (!PAYPAL_SANDBOX_CLIENT_ID || !PAYPAL_SANDBOX_CLIENT_SECRET) {
  throw new Error('Missing API credentials');
}

const client = new Client({
  clientCredentialsAuthCredentials: {
    oAuthClientId: PAYPAL_SANDBOX_CLIENT_ID,
    oAuthClientSecret: PAYPAL_SANDBOX_CLIENT_SECRET,
  },
  timeout: 0,
  environment: Environment.Sandbox,
  logging: {
    logLevel: LogLevel.Info,
    logRequest: {
      logBody: true,
    },
    logResponse: {
      logHeaders: true,
    },
  },
});

const ordersController = new OrdersController(client);
const oAuthAuthorizationController = new OAuthAuthorizationController(client);
const vaultController = new VaultController(client);

/* ######################################################################
 * Token generation helpers
 * ###################################################################### */

export async function getBrowserSafeClientToken() {
  try {
    const auth = Buffer.from(
      `${PAYPAL_SANDBOX_CLIENT_ID}:${PAYPAL_SANDBOX_CLIENT_SECRET}`
    ).toString('base64');

    const fieldParameters = {
      response_type: 'client_token',
      // the Fastlane component requires this domains[] parameter
      ...(DOMAINS ? { 'domains[]': DOMAINS } : {}),
    };

    const { result, statusCode } =
      await oAuthAuthorizationController.requestToken(
        {
          authorization: `Basic ${auth}`,
        },
        fieldParameters
      );

    const { accessToken, expiresIn, scope, tokenType } = result;
    const transformedResult = {
      accessToken,
      // convert BigInt value to a Number
      expiresIn: Number(expiresIn),
      scope: String(scope),
      tokenType,
    };

    return {
      jsonResponse: transformedResult,
      httpStatusCode: statusCode,
    };
  } catch (error) {
    if (error instanceof ApiError) {
      const { result, statusCode } = error;
      return {
        jsonResponse: result,
        httpStatusCode: statusCode,
      };
    } else {
      throw error;
    }
  }
}

/* ######################################################################
 * Process orders
 * ###################################################################### */

export async function createOrder({ orderRequestBody, paypalRequestId }) {
  try {
    const { result, statusCode } = await ordersController.createOrder({
      body: orderRequestBody,
      paypalRequestId,
      prefer: 'return=minimal',
    });

    return {
      jsonResponse: result,
      httpStatusCode: statusCode,
    };
  } catch (error) {
    if (error instanceof ApiError) {
      const { result, statusCode } = error;
      return {
        jsonResponse: result,
        httpStatusCode: statusCode,
      };
    } else {
      throw error;
    }
  }
}

export async function createOrderWithSampleData() {
  const orderRequestBody = {
    intent: CheckoutPaymentIntent.Capture,
    purchaseUnits: [
      {
        amount: {
          currencyCode: 'USD',
          value: '50.00',
        },
      },
    ],
  };
  return createOrder({ orderRequestBody });
}

export async function createOrderWithServerCallbacks() {
  // Use Railway URL for production, localhost for development
  const baseUrl =
    process.env.PUBLIC_BASE_URL ||
    process.env.RAILWAY_PUBLIC_URL ||
    `http://localhost:${process.env.PORT || 8080}`;

  const callbackUrl = `${baseUrl}/paypal-callbacks/shipping`;
  const returnUrl = `${baseUrl}/return`;
  const cancelUrl = `${baseUrl}/cancel`;

  console.log('🔗 Using callback URL:', callbackUrl);
  console.log('🏠 Base URL:', baseUrl);

  const orderRequestBody = {
    intent: CheckoutPaymentIntent.Capture,
    purchaseUnits: [
      {
        referenceId: 'server-callbacks-demo-unit',
        items: [
          {
            name: 'Demo T-Shirt',
            description: 'Premium Cotton T-Shirt',
            unitAmount: {
              currencyCode: 'USD',
              value: '25.00',
            },
            quantity: '2',
            category: 'PHYSICAL_GOODS',
            sku: 'TSHIRT-001',
          },
        ],
        amount: {
          currencyCode: 'USD',
          value: '50.00',
          breakdown: {
            itemTotal: {
              currencyCode: 'USD',
              value: '50.00',
            },
          },
        },
      },
    ],
    paymentSource: {
      paypal: {
        experienceContext: {
          userAction: 'PAY_NOW',
          shippingPreference: 'GET_FROM_FILE',
          returnUrl: returnUrl,
          cancelUrl: cancelUrl,
          orderUpdateCallbackConfig: {
            callbackEvents: ['SHIPPING_ADDRESS', 'SHIPPING_OPTIONS'],
            callbackUrl: callbackUrl,
          },
        },
      },
    },
  };
  return createOrder({ orderRequestBody });
}

export async function captureOrder(orderId) {
  try {
    const { result, statusCode } = await ordersController.captureOrder({
      id: orderId,
      prefer: 'return=minimal',
    });

    return {
      jsonResponse: result,
      httpStatusCode: statusCode,
    };
  } catch (error) {
    if (error instanceof ApiError) {
      const { result, statusCode } = error;
      return {
        jsonResponse: result,
        httpStatusCode: statusCode,
      };
    } else {
      throw error;
    }
  }
}

/* ######################################################################
 * Save payment methods
 * ###################################################################### */

export async function createSetupToken(setupTokenRequestBody, paypalRequestId) {
  try {
    const { result, statusCode } = await vaultController.createSetupToken({
      body: setupTokenRequestBody,
      paypalRequestId,
    });

    return {
      jsonResponse: result,
      httpStatusCode: statusCode,
    };
  } catch (error) {
    if (error instanceof ApiError) {
      const { result, statusCode } = error;
      return {
        jsonResponse: result,
        httpStatusCode: statusCode,
      };
    } else {
      throw error;
    }
  }
}

export async function createSetupTokenWithSampleDataForPayPal() {
  const defaultSetupTokenRequestBody = {
    paymentSource: {
      paypal: {
        experienceContext: {
          cancelUrl: 'https://example.com/cancelUrl',
          returnUrl: 'https://example.com/returnUrl',
          vaultInstruction: VaultInstructionAction.OnPayerApproval,
        },
        usageType: PaypalPaymentTokenUsageType.Merchant,
      },
    },
  };

  return createSetupToken(defaultSetupTokenRequestBody, Date.now().toString());
}

export async function createPaymentToken(vaultSetupToken, paypalRequestId) {
  try {
    const { result, statusCode } = await vaultController.createPaymentToken({
      paypalRequestId: paypalRequestId ?? Date.now().toString(),
      body: {
        paymentSource: {
          token: {
            id: vaultSetupToken,
            type: VaultTokenRequestType.SetupToken,
          },
        },
      },
    });

    return {
      jsonResponse: result,
      httpStatusCode: statusCode,
    };
  } catch (error) {
    if (error instanceof ApiError) {
      const { result, statusCode } = error;
      return {
        jsonResponse: result,
        httpStatusCode: statusCode,
      };
    } else {
      throw error;
    }
  }
}
