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
    console.log('PayPal SDK - getBrowserSafeClientToken called');
    console.log('Environment check:', {
      hasClientId: !!PAYPAL_SANDBOX_CLIENT_ID,
      hasClientSecret: !!PAYPAL_SANDBOX_CLIENT_SECRET,
      domains: DOMAINS,
    });

    const auth = Buffer.from(
      `${PAYPAL_SANDBOX_CLIENT_ID}:${PAYPAL_SANDBOX_CLIENT_SECRET}`
    ).toString('base64');

    const fieldParameters = {
      response_type: 'client_token',
      // Add domains back in the correct format if they exist
      ...(DOMAINS
        ? { 'domains[]': DOMAINS.split(',').map(d => d.trim()) }
        : {}),
    };

    console.log('Field parameters:', fieldParameters);

    const { result, statusCode } =
      await oAuthAuthorizationController.requestToken(
        {
          authorization: `Basic ${auth}`,
        },
        fieldParameters
      );

    console.log('PayPal response:', { statusCode, hasResult: !!result });

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
    paymentSource: {
      paypal: {
        experienceContext: {
          paymentMethodPreference: 'UNRESTRICTED',
          brandName: 'PayPal V6 Demos',
          locale: 'en-US',
          landingPage: 'LOGIN',
          shippingPreference: 'GET_FROM_FILE',
          userAction: 'PAY_NOW',
          callbackUrl:
            'https://pp-webv6-demos.onrender.com/paypal-api/checkout/shipping-callback',
          callbackEvents: [
            'SHIPPING_ADDRESS_CHANGED',
            'SHIPPING_OPTIONS_CHANGED',
          ],
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
