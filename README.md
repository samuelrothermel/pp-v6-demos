# PayPal v6 SDK Demo Collection

A comprehensive collection of PayPal Checkout v6 SDK integration examples and demos, showcasing various payment methods, integration patterns, and advanced features.

## Quick Start

1. **Clone and Install**

   ```bash
   git clone <repository-url>
   cd pp-v6-demos
   npm install
   ```

2. **Environment Setup**

   Create a `.env` file in the root directory:

   ```bash
   CLIENT_ID=your_paypal_sandbox_client_id
   CLIENT_SECRET=your_paypal_sandbox_client_secret
   PORT=8080
   ```

3. **Run the Demo Server**

   ```bash
   npm run dev    # Development mode with auto-reload
   npm start      # Production mode
   ```

4. **Explore the Demos**

   Visit `http://localhost:8080` to access the main demo dashboard with links to all available integrations.

## Available Demos

### PayPal Payments

**URL:** `/paypal-payments`

Complete PayPal payment integration examples:

- **One-Time Payments** - Standard checkout flows
- **Recommended Integration** - Best practices implementation
- **Advanced Examples:**
  - Async Validation - Server-side order validation
  - Payment Handler - Custom payment processing
  - Redirect Flow - Full-page redirect experience
  - Direct App Switch - Mobile app integration
- **Save Payment Methods** - Vault payment tokens for future use

### Guest Payments

**URL:** `/guest-payments`

Streamlined checkout without requiring PayPal accounts:

- **Recommended Flow** - Optimized guest experience
- **Shipping Integration** - Address and shipping callbacks
- **Auto-Load Options** - Pre-configured checkout flows

### PayPal Messages

**URL:** `/paypal-messages`

Promotional messaging to increase conversions:

- **Recommended Setup** - Standard message integration
- **Advanced Configuration** - Custom messaging options
- **Pay Later Offers** - Credit and installment messaging
- **Dynamic Content** - Context-aware promotional content

### Apple Pay

**URL:** `/apple-pay`

Apple Pay integration with PayPal infrastructure:

- **Touch ID & Face ID** support
- **Mobile-optimized** checkout experience
- **iOS integration** examples
- **Setup documentation** and domain verification guide

### Fastlane

**URL:** `/fastlane`

PayPal's accelerated checkout experience:

- **Lightning-fast checkout** flows
- **Guest acceleration** features
- **One-click payments** for returning customers
- **Optimized conversion** rates

### Google Pay

**URL:** `/google-pay`

Google Pay payment method integration:

- **Android integration** examples
- **Google Wallet** compatibility
- **Cross-platform** payment flows
- **Quick checkout** implementation

### Venmo

**URL:** `/venmo-payments`

Venmo payment integration for social commerce:

- **Mobile-first** design
- **Social payment** features
- **Youth market** targeting
- **Simple integration** patterns

## Project Architecture

```
pp-v6-demos/
├── app.js                                    # Express server setup
├── package.json                              # Dependencies and scripts
├── src/
│   ├── paypalServerSdk.js                   # PayPal API integrations
│   └── routes.js                            # Route configurations
├── public/                                   # Static assets and demos
│   ├── main-index.html                      # Demo dashboard
│   ├── styles/                              # Shared CSS
│   ├── paypalPayments/                      # PayPal payment demos
│   ├── paypalGuestPayments/                 # Guest payment demos
│   ├── paypalMessages/                      # Messaging demos
│   ├── applePay/                            # Apple Pay demos
│   ├── fastlane/                            # Fastlane demos
│   ├── googlePayPayments/                   # Google Pay demos
│   └── venmoPayments/                       # Venmo demos

```

## Technology Stack

- **Backend:** Node.js 18+ with Express.js
- **PayPal SDK:** @paypal/paypal-server-sdk v1.1.0
- **Frontend:** Vanilla JavaScript with PayPal v6 Client SDK
- **Styling:** Custom CSS with responsive design

## 🔌 API Endpoints

The server provides several API endpoints for PayPal integration:

- `GET /paypal-api/auth/browser-safe-client-token` - Get client authentication token
- `POST /paypal-api/checkout/orders/create` - Create new payment order
- `POST /paypal-api/checkout/orders/create-with-sample-data` - Create order with sample data
- `POST /paypal-api/checkout/orders/:orderId/capture` - Capture completed payment
- `POST /paypal-api/vault/setup-token/create` - Create setup token for vaulting
- `POST /paypal-api/vault/payment-token/create` - Create payment token for saved payments

## Testing

### Sandbox Environment

All demos are configured to work with PayPal's sandbox environment by default. Use your sandbox credentials in the `.env` file.

### Test Accounts

Create test buyer and seller accounts in the [PayPal Developer Dashboard](https://developer.paypal.com/) for testing various scenarios.

### Device Testing

- **Desktop:** All modern browsers (Chrome, Firefox, Safari, Edge)
- **Mobile:** iOS Safari, Android Chrome
- **Special Features:** Apple Pay (iOS/Safari), Google Pay (Android/Chrome)

## Deployment

### Environment Variables (Production)

```bash
CLIENT_ID=your_live_paypal_client_id
CLIENT_SECRET=your_live_paypal_client_secret
PORT=8080
NODE_ENV=production
```

### Platform Support

- **Node.js:** 18.x or higher
- **npm:** 9.x or higher
- Compatible with most cloud platforms (Heroku, Render, AWS, etc.)

## Documentation

- **PayPal Developer Documentation:** [https://developer.paypal.com/](https://developer.paypal.com/)
- **v6 SDK Reference:** [PayPal JavaScript SDK](https://developer.paypal.com/sdk/js/reference/)
- **Server SDK:** [@paypal/paypal-server-sdk](https://www.npmjs.com/package/@paypal/paypal-server-sdk)
- **Integration Guides:** Available in each demo's individual README files

## Contributing

This demo collection is designed for learning and development purposes. Feel free to:

1. Fork the repository
2. Experiment with different configurations
3. Add new integration examples
4. Submit improvements via pull requests

## License

Apache License 2.0 - See the project's package.json for full license details.

## Support

For PayPal integration support:

- **PayPal Developer Community:** [https://developer.paypal.com/community/](https://developer.paypal.com/community/)
- **Technical Documentation:** [https://developer.paypal.com/docs/](https://developer.paypal.com/docs/)
- **API Reference:** [https://developer.paypal.com/api/rest/](https://developer.paypal.com/api/rest/)
