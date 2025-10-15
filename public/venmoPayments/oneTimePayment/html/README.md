# One-Time Payments HTML Sample Integration

This HTML sample integration uses HTML, JavaScript, and CSS. It does not require a build process to transpile the source code. It's just static files that can be served up by any web server. [Vite](https://vite.dev/) is used for the local web server to provide the following functionality:

1. Serve up the static HTML and JavaScript files.
2. Proxy the API server so both the client and server are running on port 3000.

## How to Run Locally

```bash
npm install
npm start
```

### Sample Integrations

| Sample Integration                                                                                            | Description                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| ------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Recommended](../../../paypalPayments/oneTimePayment/html/src/recommended/index.html)                         | Start with this recommended sample integration. It displays all buttons supported by the v6 SDK and includes eligibility logic. It uses the "auto" presentation mode which attempts to launch a popup window and then automatically falls back to the modal presentation mode when the browser does not support popups.                                                                                                                                 |
| [Custom Payment Handler](../../../paypalPayments/oneTimePayment/html/src/advanced/paymentHandler/index.html)  | This custom integration uses the experimental "payment-handler" presentation mode. It teaches how to control the fallback logic for presentation modes based on what the browser supports.                                                                                                                                                                                                                                                              |
| [Custom Sandboxed Iframe](../../../paypalPayments/oneTimePayment/html/src/advanced/sandboxedIframe/README.md) | This custom integration demonstrates how a merchant can wrap the v6 SDK integration code into their own iframe and what values need to be passed to the [iframe sandbox attribute](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/iframe#sandbox). It does require two web servers to demonstrate the use case. Refer to the README in the ../../../paypalPayments/oneTimePayment/html/src/advanced/sandboxedIframe directory to learn more. |
