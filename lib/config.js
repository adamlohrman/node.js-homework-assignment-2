/**
 * Create and Export Configuration variables.
 */

let environments = {};

environments.staging = {
  'httpPort': 3000,
  'httpsPort': 3001,
  'envName': 'staging',
  'secret': 'mySecretSaying',
  'swipeInfo': {
    'stripeSecret': '',
    'currency': 'usd',
    'card': ['tok_visa', 'tok_mastercard']
  },
  'mailGun': {
    'key': '',
    'from': ''
  }
};

environments.production = {
  'httpPort': 5000,
  'httpsPort': 5001,
  'envName': 'production',
  'secret': 'mySecretSaying',
  'swipeInfo': {
    'stripeSecret': '',
    'currency': 'usd',
    'card': ['tok_visa', 'tok_mastercard']
  },
  'mailGun': {
    'key': '',
    'from': '',
  }
};

let currentEnvironment = typeof (process.env.NODE_ENV) === 'string' ? process.env.NODE_ENV.toLowerCase() : '';

let environmentToExport = typeof (environments[currentEnvironment]) === 'object' ? environments[currentEnvironment] : environments.staging;

module.exports = environmentToExport;