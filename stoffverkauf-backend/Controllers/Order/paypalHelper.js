const paypal = require('@paypal/checkout-server-sdk');
const Integration = require('../../Modals/Integration/integration');

const getPaypalClient = async () => {
    const integration = await Integration.findOne({ key: 'paypal' });
    if (!integration || !integration.isActive) {
        throw new Error('PayPal integration not found or inactive');
    }

    const { paypalClientId, paypalSecret, paypalMode } = integration.data;
    
    let environment;
    if (paypalMode === 'live') {
        environment = new paypal.core.LiveEnvironment(paypalClientId, paypalSecret);
    } else {
        // environment = new paypal.core.SandboxEnvironment(paypalClientId, paypalSecret);
        environment = new paypal.core.LiveEnvironment(paypalClientId, paypalSecret);
    }

    return new paypal.core.PayPalHttpClient(environment);
};

module.exports = { getPaypalClient };
