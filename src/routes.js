import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Configure all routes for the Express app (both static and web page routes)
 * @param {express.Application} app - The Express application instance
 */
export function configureRoutes(app) {
  // Configure static file serving
  configureStaticRoutes(app);

  // Configure web page routes
  configureWebPageRoutes(app);
}

/**
 * Configure all static file serving middleware for the Express app
 * @param {express.Application} app - The Express application instance
 */
function configureStaticRoutes(app) {
  // Base static file serving for public directory
  app.use(express.static('public'));

  // PayPal Payments Static Routes
  configurePayPalPaymentsStatic(app);

  // Guest Payments Static Routes
  configureGuestPaymentsStatic(app);

  // PayPal Messages Static Routes
  configurePayPalMessagesStatic(app);

  // Venmo Payments Static Routes
  configureVenmoPaymentsStatic(app);

  // Fastlane Static Routes
  configureFastlaneStatic(app);

  // Apple Pay Static Routes
  configureApplePayStatic(app);

  // Google Pay Static Routes
  configureGooglePayStatic(app);
}

/**
 * Configure all web page routes
 * @param {express.Application} app - The Express application instance
 */
function configureWebPageRoutes(app) {
  // Main and index pages
  configureMainPages(app);

  // PayPal payment routes
  configurePayPalPaymentPages(app);

  // Guest payment routes
  configureGuestPaymentPages(app);

  // PayPal Messages routes
  configurePayPalMessagePages(app);

  // Venmo payment routes
  configureVenmoPaymentPages(app);

  // Fastlane routes
  configureFastlanePages(app);

  // Apple Pay routes
  configureApplePayPages(app);

  // Google Pay routes
  configureGooglePayPages(app);

  // Legacy redirect routes
  configureLegacyRedirects(app);
}

/**
 * Configure static routes for PayPal Payments
 */
function configurePayPalPaymentsStatic(app) {
  // Main PayPal oneTimePayment directory
  app.use(
    '/paypal-payments/one-time',
    express.static(
      path.join(__dirname, '../public/paypalPayments/oneTimePayment/html/src')
    )
  );

  // PayPal Advanced Integration Examples
  app.use(
    '/paypal-payments/one-time/async-validation',
    express.static(
      path.join(
        __dirname,
        '../public/paypalPayments/oneTimePayment/html/src/advanced/merchantAsyncValidation'
      )
    )
  );

  app.use(
    '/paypal-payments/one-time/payment-handler',
    express.static(
      path.join(
        __dirname,
        '../public/paypalPayments/oneTimePayment/html/src/advanced/paymentHandler'
      )
    )
  );

  app.use(
    '/paypal-payments/one-time/redirect',
    express.static(
      path.join(
        __dirname,
        '../public/paypalPayments/oneTimePayment/html/src/advanced/redirect'
      )
    )
  );

  app.use(
    '/paypal-payments/one-time/app-switch',
    express.static(
      path.join(
        __dirname,
        '../public/paypalPayments/oneTimePayment/html/src/advanced/directAppSwitch'
      )
    )
  );

  app.use(
    '/paypal-payments/one-time/recommended',
    express.static(
      path.join(
        __dirname,
        '../public/paypalPayments/oneTimePayment/html/src/recommended'
      )
    )
  );

  // PayPal Save Payment directory
  app.use(
    '/paypal-payments/save-payment',
    express.static(
      path.join(__dirname, '../public/paypalPayments/savePayment/html/src')
    )
  );
}

/**
 * Configure static routes for Guest Payments
 */
function configureGuestPaymentsStatic(app) {
  // Main guest payments directory
  app.use(
    '/guest-payments',
    express.static(
      path.join(__dirname, '../public/paypalGuestPayments/html/src')
    )
  );

  // Guest payment variations
  app.use(
    '/guest-payments/recommended',
    express.static(
      path.join(__dirname, '../public/paypalGuestPayments/html/src/recommended')
    )
  );

  app.use(
    '/guest-payments/shipping',
    express.static(
      path.join(__dirname, '../public/paypalGuestPayments/html/src/shipping')
    )
  );

  app.use(
    '/guest-payments/onload',
    express.static(
      path.join(__dirname, '../public/paypalGuestPayments/html/src/onload')
    )
  );
}

/**
 * Configure static routes for PayPal Messages
 */
function configurePayPalMessagesStatic(app) {
  // Main PayPal messages directory
  app.use(
    '/paypal-messages',
    express.static(path.join(__dirname, '../public/paypalMessages/html/src'))
  );

  // PayPal messages variations
  app.use(
    '/paypal-messages/recommended',
    express.static(
      path.join(__dirname, '../public/paypalMessages/html/src/recommended')
    )
  );

  app.use(
    '/paypal-messages/advanced',
    express.static(
      path.join(__dirname, '../public/paypalMessages/html/src/advanced')
    )
  );
}

/**
 * Configure static routes for Venmo Payments
 */
function configureVenmoPaymentsStatic(app) {
  app.use(
    '/venmo-payments/one-time',
    express.static(
      path.join(__dirname, '../public/venmoPayments/oneTimePayment/html/src')
    )
  );
}

/**
 * Configure static routes for Fastlane
 */
function configureFastlaneStatic(app) {
  app.use(
    '/fastlane',
    express.static(path.join(__dirname, '../public/fastlane/html/src'))
  );
}

/**
 * Configure static routes for Apple Pay
 */
function configureApplePayStatic(app) {
  app.use(
    '/apple-pay/one-time',
    express.static(path.join(__dirname, '../public/applePay/html/src'))
  );
}

/**
 * Configure static routes for Google Pay
 */
function configureGooglePayStatic(app) {
  app.use(
    '/google-pay/one-time',
    express.static(
      path.join(
        __dirname,
        '../public/googlePayPayments/oneTimePayment/html/src'
      )
    )
  );
}

/* ######################################################################
 * WEB PAGE ROUTE CONFIGURATIONS
 * ###################################################################### */

/**
 * Configure main and index pages
 */
function configureMainPages(app) {
  // Main index page
  app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/main-index.html'));
  });

  // Legacy checkout page route
  app.get('/checkout', (req, res) => {
    res.render('checkout', {
      title: 'PayPal Checkout v6 - One-Time Payment',
      pageType: 'paypal-payments',
    });
  });
}

/**
 * Configure PayPal payment page routes
 */
function configurePayPalPaymentPages(app) {
  // PayPal Payments - Main Index Page
  app.get('/paypal-payments', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/paypal-payments-index.html'));
  });

  // One-Time Payments - Index page
  app.get('/paypal-payments/one-time', (req, res) => {
    res.sendFile(
      path.join(
        __dirname,
        '../public/paypalPayments/oneTimePayment/html/src/index.html'
      )
    );
  });

  // Save Payment - Direct to the page
  app.get('/paypal-payments/save-payment', (req, res) => {
    res.sendFile(
      path.join(
        __dirname,
        '../public/paypalPayments/savePayment/html/src/index.html'
      )
    );
  });

  // PayPal One-Time Payment Examples with new URL structure
  app.get('/paypal-payments/one-time/recommended', (req, res) => {
    res.sendFile(
      path.join(
        __dirname,
        '../public/paypalPayments/oneTimePayment/html/src/recommended/index.html'
      )
    );
  });

  app.get('/paypal-payments/one-time/async-validation', (req, res) => {
    res.sendFile(
      path.join(
        __dirname,
        '../public/paypalPayments/oneTimePayment/html/src/advanced/merchantAsyncValidation/index.html'
      )
    );
  });

  app.get('/paypal-payments/one-time/payment-handler', (req, res) => {
    res.sendFile(
      path.join(
        __dirname,
        '../public/paypalPayments/oneTimePayment/html/src/advanced/paymentHandler/index.html'
      )
    );
  });

  app.get('/paypal-payments/one-time/redirect', (req, res) => {
    res.sendFile(
      path.join(
        __dirname,
        '../public/paypalPayments/oneTimePayment/html/src/advanced/redirect/index.html'
      )
    );
  });

  app.get('/paypal-payments/one-time/app-switch', (req, res) => {
    res.sendFile(
      path.join(
        __dirname,
        '../public/paypalPayments/oneTimePayment/html/src/advanced/directAppSwitch/index.html'
      )
    );
  });
}

/**
 * Configure guest payment page routes
 */
function configureGuestPaymentPages(app) {
  // PayPal Guest Payments Examples
  app.get('/guest-payments', (req, res) => {
    res.sendFile(
      path.join(__dirname, '../public/paypalGuestPayments/html/src/index.html')
    );
  });

  app.get('/guest-payments/recommended', (req, res) => {
    res.sendFile(
      path.join(
        __dirname,
        '../public/paypalGuestPayments/html/src/recommended/index.html'
      )
    );
  });

  app.get('/guest-payments/shipping', (req, res) => {
    res.sendFile(
      path.join(
        __dirname,
        '../public/paypalGuestPayments/html/src/shipping/index.html'
      )
    );
  });

  app.get('/guest-payments/onload', (req, res) => {
    res.sendFile(
      path.join(
        __dirname,
        '../public/paypalGuestPayments/html/src/onload/index.html'
      )
    );
  });
}

/**
 * Configure PayPal Messages page routes
 */
function configurePayPalMessagePages(app) {
  // PayPal Messages Examples
  app.get('/paypal-messages', (req, res) => {
    res.sendFile(
      path.join(__dirname, '../public/paypalMessages/html/src/index.html')
    );
  });

  app.get('/paypal-messages/recommended', (req, res) => {
    res.sendFile(
      path.join(
        __dirname,
        '../public/paypalMessages/html/src/recommended/index.html'
      )
    );
  });

  app.get('/paypal-messages/advanced', (req, res) => {
    res.sendFile(
      path.join(
        __dirname,
        '../public/paypalMessages/html/src/advanced/index.html'
      )
    );
  });
}

/**
 * Configure Venmo payment page routes
 */
function configureVenmoPaymentPages(app) {
  // Venmo Payments Examples
  app.get('/venmo-payments', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/venmo-payments-index.html'));
  });

  app.get('/venmo-payments/one-time', (req, res) => {
    res.sendFile(
      path.join(
        __dirname,
        '../public/venmoPayments/oneTimePayment/html/src/index.html'
      )
    );
  });
}

/**
 * Configure Fastlane page routes
 */
function configureFastlanePages(app) {
  // Fastlane Integration
  app.get('/fastlane', (req, res) => {
    res.sendFile(
      path.join(__dirname, '../public/fastlane/html/src/index.html')
    );
  });
}

/**
 * Configure Apple Pay page routes
 */
function configureApplePayPages(app) {
  // Apple Pay Integration
  app.get('/apple-pay', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/apple-pay-index.html'));
  });

  app.get('/apple-pay/one-time', (req, res) => {
    res.sendFile(
      path.join(__dirname, '../public/applePay/html/src/index.html')
    );
  });
}

/**
 * Configure Google Pay page routes
 */
function configureGooglePayPages(app) {
  // Google Pay Integration
  app.get('/google-pay', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/google-pay-index.html'));
  });

  app.get('/google-pay/one-time', (req, res) => {
    res.sendFile(
      path.join(
        __dirname,
        '../public/googlePayPayments/oneTimePayment/html/src/index.html'
      )
    );
  });
}

/**
 * Configure legacy redirect routes
 */
function configureLegacyRedirects(app) {
  // Legacy routes - redirect to new structure
  app.get('/one-time-payments', (req, res) => {
    res.redirect('/paypal-payments/one-time');
  });

  app.get('/save-payment', (req, res) => {
    res.redirect('/paypal-payments/save-payment');
  });

  app.get('/one-time/paypalPayments', (req, res) => {
    res.redirect('/paypal-payments/one-time');
  });
}
