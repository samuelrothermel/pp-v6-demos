async function onPayPalWebSdkLoaded() {
  try {
    const clientToken = await getBrowserSafeClientToken();
    const sdkInstance = await window.paypal.createInstance({
      clientToken,
      components: ["paypal-payments"],
      pageType: "checkout",
    });
    const paypalPaymentSession = sdkInstance.createPayPalOneTimePaymentSession(
      paymentSessionOptions,
    );

    if (paypalPaymentSession.hasReturned()) {
      await paypalPaymentSession.resume();
    } else {
      setupPayPalButton(paypalPaymentSession);
    }
  } catch (error) {
    console.error(error);
  }
}

const paymentSessionOptions = {
  async onApprove(data) {
    console.log("onApprove", data);
    const orderData = await captureOrder({
      orderId: data.orderId,
    });
    console.log("Capture result", orderData);
  },
  onCancel(data) {
    console.log("onCancel", data);
  },
  onError(error) {
    console.log("onError", error);
  },
};

async function setupPayPalButton(paypalPaymentSession) {
  const enableAutoRedirect = document.querySelector("#enable-auto-redirect");
  const paypalButton = document.querySelector("#paypal-button");
  paypalButton.removeAttribute("hidden");

  paypalButton.addEventListener("click", async () => {
    const createOrderPromiseReference = createRedirectOrder();

    try {
      const { redirectURL } = await paypalPaymentSession.start(
        {
          presentationMode: "redirect",
          autoRedirect: {
            enabled: enableAutoRedirect.checked,
          },
        },
        createOrderPromiseReference,
      );
      if (redirectURL) {
        console.log(`redirectURL: ${redirectURL}`);
        window.location.assign(redirectURL);
      }
    } catch (error) {
      console.error(error);
    }
  });
}

async function getBrowserSafeClientToken() {
  const response = await fetch("/paypal-api/auth/browser-safe-client-token", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const { accessToken } = await response.json();

  return accessToken;
}

async function createRedirectOrder() {
  const orderPayload = {
    intent: "CAPTURE",
    paymentSource: {
      paypal: {
        experienceContext: {
          shippingPreference: "NO_SHIPPING",
          userAction: "CONTINUE",
          returnUrl: window.location.href,
          cancelUrl: window.location.href,
        },
      },
    },
    purchaseUnits: [
      {
        amount: {
          currencyCode: "USD",
          value: "10.00",
          breakdown: {
            itemTotal: {
              currencyCode: "USD",
              value: "10.00",
            },
          },
        },
      },
    ],
  };

  const response = await fetch("/paypal-api/checkout/orders/create", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(orderPayload),
  });
  const { id } = await response.json();
  return { orderId: id };
}

async function captureOrder({ orderId }) {
  const response = await fetch(
    `/paypal-api/checkout/orders/${orderId}/capture`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    },
  );
  const data = await response.json();
  return data;
}
