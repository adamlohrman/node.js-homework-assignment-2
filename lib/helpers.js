/**
 * Helpers to perform various tasks in other modules and such as......yes...bananas.
 */

//Dependencies
const crypto = require('crypto');
const config = require('./config');
const https = require('https');
const queryString = require('querystring');




let helpers = {};


//USER LOG IN STATUS
helpers.userLogin = (data) => {
  let userStatus;
  if (data) {
    userStatus = 'logged in';
  } else {
    userStatus = 'logged out';
  }
  console.log(userStatus);
};


//CREATES A RANDOM STRING OF CHARACTERS
helpers.createRandomString = (strLength) => {
  strLength = typeof (strLength) === 'number' && strLength > 0 ? strLength : false;
  if (strLength) {
    let possibleCharacters = 'abcdefghijklmnopqrstuvwxyz1234567890';
    let str = '';
    for (i = 1; i <= strLength; i++) {
      let randomCharacter = possibleCharacters.charAt(Math.floor(Math.random() * possibleCharacters.length));
      str += randomCharacter;
    }
    return str;
  } else {
    return false;
  }
};


//CREATE A SHA256 HASH
helpers.hash = (str) => {
  if (typeof (str) === 'string' && str.length > 0) {
    let hash = crypto.createHmac('sha256', config.secret).update(str).digest('hex');
    return hash;
  } else {
    return false;
  }
};


//PARSE A JSON STRING TO AN OBJECT IN ALL CASES WITHOUT THROWING.
helpers.parseJsonToObject = (str) => {
  try {
    let obj = JSON.parse(str);
    return obj;
  } catch (e) {
    return {};
  }
};

// MAKES PAYMENT THROUGH SWIPE
helpers.payment = (card_Num, emailAddress, total, callback) => {

  card_Num = typeof (card_Num) === 'string' && config.swipeInfo.card.indexOf(card_Num) > -1 ? card_Num.trim() : false;

  emailAddress = typeof (emailAddress) === 'string' && emailAddress.trim().length > 0 && emailAddress.trim().includes('@', '.') ? emailAddress.trim() : false;


  total = typeof (total) === 'number' && total >= 0.01 ? total : false;

  if (card_Num && emailAddress && total) {
    let payload = {
      'amount': total * 100,
      'currency': config.swipeInfo.currency,
      'source': card_Num,
      'description': 'Pizza order for ' + emailAddress
    };

    let payloadString = queryString.stringify(payload);

    let requestDetails = {
      'protocol': 'https:',
      'hostname': 'api.stripe.com',
      'method': 'POST',
      'path': '/v1/charges',
      'auth': config.swipeInfo.stripeSecret,
      'headers': {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(payloadString)
      }
    };

    let req = https.request(requestDetails, (res) => {
      let status = res.statusCode;
      if (status === 200 || status === 201) {
        callback(false);
      } else {
        callback(`Status code returned was ${status}`);
      }
    });

    req.on('error', (e) => {
      callback(e);
    });

    req.write(payloadString);

    req.end();

  } else {
    callback('The given parameters were missing or invalid');
  }

};

// SEND VERIFICATION EMAIL THROUGH MAILGUN
helpers.sendEmail = (email, message, callback) => {

  email = typeof (email) === 'string' && email.trim().length > 0 && email.trim().includes('@', '.') ? email.trim() : false;

  message = typeof (message) === 'string' && message.trim().length > 0 ? message.trim() : false;

  if (email && message) {
    let payload = {
      'from': config.mailGun.from,
      'to': email,
      'subject': 'Payment Successful',
      'text': message
    };

    let payloadString = queryString.stringify(payload);

    let requestDetails = {
      'protocol': 'https:',
      'hostname': 'api.mailgun.net',
      'method': 'POST',
      'path': '/v3/sandbox157cc58ff87845829689d9b79e34b1ee.mailgun.org/messages',
      'auth': config.mailGun.key,
      'headers': {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(payloadString)
      }
    };

    let req = https.request(requestDetails, (res) => {
      let status = res.statusCode;
      if (status === 200 || status === 201) {
        callback(false);
      } else {
        callback(`Status code returned was ${status}`);
      }
    });

    req.on('error', (e) => {
      callback(e);
    });

    req.write(payloadString);

    req.end();

  } else {
    callback('There was a problem with the email or message provided.');
  }

};

module.exports = helpers;