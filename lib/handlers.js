/**
 * Router request handlers and their responses.
 */

//Dependencies
const _data = require('./data');
const helpers = require('./helpers');


//Dependencies

let handlers = {};

// USER INFORMATION AND MANIPULATION.
handlers.users = (data, callback) => {
  let goodMethods = ['post', 'get', 'put', 'delete'];
  if (goodMethods.indexOf(data.method) > -1) {
    handlers._users[data.method](data, callback);
  } else {
    callback(405);
  }
};

handlers._users = {};


//USERS - POST
//REQUIRED DATA: firstName, lastName, phone, password, email, streetAddress, tosAgreement
//NO OPTIONAL DATA IS REQUIRED.

handlers._users.post = (data, callback) => {

  //VERIFY REQUIRED DATA.
  let firstName = typeof (data.payload.firstName) === 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;

  let lastName = typeof (data.payload.lastName) === 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;

  let phone = typeof (data.payload.phone) === 'string' && data.payload.phone.trim().length === 10 ? data.payload.phone.trim() : false;

  let password = typeof (data.payload.password) === 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;

  let email = typeof (data.payload.email) === 'string' && data.payload.email.trim().length > 0 && data.payload.email.trim().includes('@', '.') ? data.payload.email.trim() : false;

  let streetAddress = typeof (data.payload.streetAddress) === 'string' && data.payload.streetAddress.trim().length > 0 ? data.payload.streetAddress.trim() : false;

  let tosAgreement = typeof (data.payload.tosAgreement) === 'boolean' && data.payload.tosAgreement === true ? true : false;


  if (firstName && lastName && phone && password && email && streetAddress && tosAgreement) {

    _data.read('users', phone, (err, data) => {
      if (err) {
        let hashedPassword = helpers.hash(password);
        if (hashedPassword) {
          let userObject = {
            'firstName': firstName,
            'lastName': lastName,
            'hashedPassword': hashedPassword,
            'email': email,
            'streetAddress': streetAddress
          };
          _data.create('customer_info', phone, userObject, (err) => {
            if (!err) {
              callback(200);
            } else {
              console.log(err);
              callback(500, { 'Error': 'New user could not be created, for some reason, or another...' });
            }
          });
        } else {
          callback(500, { 'Error': 'Could not encrypt the user\'s password.' });
        }
      } else {
        callback(400, { 'Error': 'A user with that phone number already exists.' });
      }
    });
  } else {
    callback(400, { 'Error': 'Missing required data to create account, or, data is improperly written.' });
  }
};


//USERS - GET
//REQUIRED DATA: PHONE
//NO OPTIONAL DATA.

handlers._users.get = (data, callback) => {
  //VALIDATE THE USER'S PHONE NUMBER.
  let phone = typeof (data.queryStringObject.phone) === 'string' && data.queryStringObject.phone.trim().length === 10 ? data.queryStringObject.phone.trim() : false;
  if (phone) {
    let token = typeof (data.headers.token) === 'string' ? data.headers.token : false;
    handlers._tokens.verifyToken(token, phone, (tokenIsValid) => {
      if (tokenIsValid) {
        _data.read('customer_info', phone, (err, data) => {
          if (!err && data) {
            delete data.hashedPassword;
            callback(200, data);
          } else {
            callback(404);
          }
        });
      } else {
        callback(403, { 'Error': 'Missing required token. Token should be included in the header.' })
      }
    });
  } else {
    callback(400, { 'Error': 'Missing required information.' })
  }
};


//USERS - PUT(UPDATE)
//REQUIRED DATA: phone
//OPTIONAL DATA: firstName, lastName, password, email, streetAddress.

handlers._users.put = (data, callback) => {
  //VERIFY REQUIRED DATA
  let phone = typeof (data.queryStringObject.phone) === 'string' && data.queryStringObject.phone.trim().length === 10 ? data.queryStringObject.phone.trim() : false;

  //VERIFY OPTIONAL DATA
  let firstName = typeof (data.payload.firstName) === 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;

  let lastName = typeof (data.payload.lastName) === 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;

  let password = typeof (data.payload.password) === 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;

  let email = typeof (data.payload.email) === 'string' && data.payload.email.trim().length > 0 && data.payload.email.trim().includes('@', '.') ? data.payload.email.trim() : false;

  let streetAddress = typeof (data.payload.streetAddress) === 'string' && data.payload.streetAddress.trim().length > 0 ? data.payload.streetAddress.trim() : false;

  if (phone) {
    if (firstName || lastName || password || email || streetAddress) {
      let token = typeof (data.headers.token) === 'string' ? data.headers.token : false;

      handlers._tokens.verifyToken(token, phone, (tokenIsValid) => {
        if (tokenIsValid) {
          _data.read('customer_info', phone, (err, userData) => {
            if (!err && userData) {
              if (firstName) {
                userData.firstName = firstName;
              }
              if (lastName) {
                userData.lastName = lastName;
              }
              if (password) {
                userData.hashedPassword = helpers.hash(password);
              }
              if (email) {
                userData.email = email;
              }
              if (streetAddress) {
                userData.streetAddress = streetAddress;
              }

              _data.update('customer_info', phone, userData, (err) => {
                if (!err) {
                  callback(200);
                } else {
                  console.log(err);
                  callback(500, { 'Error': 'Could not update the customer\'s information. Possibly due to an internal error within the file system.' });
                }
              });
            } else {
              callback(400, { 'Error': 'The selected customer does not exist in the file system.' });
            }
          });
        } else {
          callback(403, { 'Error': 'Missing the required token in the header, or the token is invalid.' });
        }
      });
    }
  } else {
    callback(400, { 'Error': 'The phone number is invalid or missing.' });
  }
};


//USERS - DELETE
//REQUIRED DATA: phone
//THERE IS NO OPTIONAL DATA NEEDED FOR THIS OPTION.

handlers._users.delete = (data, callback) => {

  let phone = typeof (data.queryStringObject.phone) === 'string' && data.queryStringObject.phone.trim().length === 10 ? data.queryStringObject.phone.trim() : false;

  if (phone) {
    let token = typeof (data.headers.token) === 'string' ? data.headers.token : false;

    handlers._tokens.verifyToken(token, phone, (tokenIsValid) => {
      if (tokenIsValid) {
        _data.read('customer_info', phone, (err, userData) => {
          if (!err && userData) {
            _data.delete('customer_info', phone, (err) => {
              if (!err) {
                callback(200, { 'Success': 'The selected customer has been deleted successfully' });
              } else {
                callback(500, { 'Error': 'Could not delete the selected user.' });
              }
            });
          } else {
            callback(400, { 'Error': 'Could not find the selected customer.' });
          }
        });
      } else {
        callback(403, { 'Error': 'Missing required token in the header, or token is invalid.' });
      }
    });
  } else {
    callback(400, { 'Error': 'Missing required data within the query string.' });
  }
};


//THE NEXT SECTION CREATES A TOKEN FOR THE CUSTOMER. IF THE CUSTOMER HAS A TOKEN THEY ARE CONSIDERED LOGGED-IN, IF THE TOKEN IS DELETED, THE CUSTOMER IS CONSIDERED LOGGED OUT. THE MENU CAN ONLY BE VIEWED WITH A VALID TOKEN. THE TOKEN IS GOOD FOR ONE DAY AFTER IT'S RECIEVED. IN ORDER TO RECIEVE A TOKEN, YOU MUST HAVE A VALID PHONE NUMBER AND PASSWORD.

//TOKENS
handlers.tokens = (data, callback) => {
  let goodMethods = ['post', 'get', 'put', 'delete'];
  if (goodMethods.indexOf(data.method) > -1) {
    handlers._tokens[data.method](data, callback);
  } else {
    callback(405);
  }
};



handlers._tokens = {};

//TOKEN VERIFICATION USED FOR OTHER HANDLERS.
handlers._tokens.verifyToken = (id, phone, callback) => {
  _data.read('tokens', id, (err, tokenData) => {
    if (!err && tokenData) {
      if (tokenData.phone === phone && tokenData.expires > Date.now()) {
        callback(true);
      } else {
        callback(false);
      }
    } else {
      callback(false);
    }
  });
}

//TOKENS - POST
//REQUIRED DATA: phone, password
//THERE IS NO OPTIONAL DATA REQUIRED.


handlers._tokens.post = (data, callback) => {
  let phone = typeof (data.payload.phone) === 'string' && data.payload.phone.trim().length === 10 ? data.payload.phone.trim() : false;

  let password = typeof (data.payload.password) === 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;

  if (phone && password) {
    _data.read('customer_info', phone, (err, userData) => {
      if (!err && userData) {
        let hashedPassword = helpers.hash(password);
        if (hashedPassword === userData.hashedPassword) {
          let tokenId = helpers.createRandomString(20);
          let expires = Date.now() + 1000 * 60 * 60 * 24;
          let tokenObject = {
            'phone': phone,
            'id': tokenId,
            'expires': expires
          };

          _data.create('tokens', tokenId, tokenObject, (err) => {
            if (!err) {
              callback(200, { tokenObject, 'Success': 'You have created your token and are now logged in. To log out simply delete your token. With this token, you are now able to view the menu.' });
            } else {
              callback(500, { 'Error': 'There was a problem when creating the token.' })
            }
          });
        } else {
          callback(400, { 'Error': 'Password did not match the selected user;' });
        }
      } else {
        callback(400, { 'Error': 'Could not find the selected customer.' });
      }
    });
  } else {
    callback(400, { 'Error': 'Missing required data to receive token.' });
  }
};

//TOKENS - GET
//REQUIRED DATA: id
//THERE IS NO OPTIONAL DATA REQUIRED


handlers._tokens.get = (data, callback) => {
  let id = typeof (data.queryStringObject.id) === 'string' && data.queryStringObject.id.trim().length === 20 ? data.queryStringObject.id.trim() : false;

  if (id) {
    _data.read('tokens', id, (err, tokenData) => {
      if (!err && tokenData) {
        callback(200, tokenData);
      } else {
        callback(404);
      }
    });
  } else {
    callback(400, { 'Error': 'Missing the required fields.' });
  }
};

//TOKENS - PUT
//REQUIRED DATA: id, extend
//THERE IS NO OPTIONAL DATA REQUIRED

handlers._tokens.put = (data, callback) => {

  let id = typeof (data.payload.id) === 'string' && data.payload.id.trim().length === 20 ? data.payload.id.trim() : false;

  let extend = typeof (data.payload.extend) === 'boolean' && data.payload.extend === true ? true : false;

  if (id && extend) {
    _data.read('tokens', id, (err, tokenData) => {
      if (!err && tokenData) {
        if (tokenData.expires > Date.now()) {
          tokenData.expires = Date.now() + 1000 * 60 * 60 * 24;
          _data.update('tokens', id, tokenData, (err) => {
            if (!err) {
              callback(200, { 'Success': 'Your token\'s expiration has been extended for another 24 hours.' });
            } else {
              callback(500, { 'Error': 'Could not reset the token expiration time.' });
            }
          });
        }
      } else {
        callback(400, { 'Error': 'Token data does not exist.' });
      }
    });
  } else {
    callback(400, { 'Error': 'The required fields are missing and/or invalid' });
  }
};


//TOKENS - DELETE
//REQUIRED DATA: id
//THERE IS NO OPTIONAL DATA NEEDED

handlers._tokens.delete = (data, callback) => {

  let id = typeof (data.queryStringObject.id) === 'string' && data.queryStringObject.id.trim().length === 20 ? data.queryStringObject.id.trim() : false;

  if (id) {
    _data.read('tokens', id, (err, tokenData) => {
      if (!err && tokenData) {
        _data.delete('tokens', id, (err) => {
          if (!err) {
            callback(200, { 'Success': 'You have deleted your token and are now logged out. Hope you have a wonderful day, come back and see us!' });
          } else {
            callback(500, { 'Error': 'There was a problem deleting the token.' })
          }
        });
      } else {
        callback(400, { 'Error': 'Could not find the selected token for deletion' });
      }
    });
  } else {
    callback(400, { 'Error': 'Required fields are missing.' });
  }
};



//THE NEXT HANDLER ALLOWS THE CUSTOMER TO VIEW THE MENU. IN ORDER TO DO SO, YOU MUST HAVE A VALID TOKEN AND PHONE NUMBER.

handlers.menu = (data, callback) => {
  let goodMethods = ['get'];
  if (goodMethods.indexOf(data.method) > -1) {
    handlers._menu[data.method](data, callback);
  } else {
    callback(405);
  }
};

handlers._menu = {};


//MENU - GET
//REQUIRED DATA: token, phone
//THERE IS NO OPTIONAL DATA REQUIRED

handlers._menu.get = (data, callback) => {

  let phone = typeof (data.payload.phone) === 'string' && data.payload.phone.trim().length === 10 ? data.payload.phone.trim() : false;

  if (phone) {
    let token = typeof (data.headers.token) === 'string' ? data.headers.token : false;


    handlers._tokens.verifyToken(token, phone, (tokenIsValid) => {
      if (tokenIsValid) {
        _data.read('menu_items', 'menu', (err, data) => {
          if (!err && data) {
            callback(200, data);
            console.log(data.pepperoniFiend.price);
          } else {
            callback(500, { 'Error': 'There was a problem getting the requested data.' });
          }
        });
      } else {
        callback(400, { 'Error': 'Missing required token in header, or token is invalid.' });
      }
    });
  } else {
    callback(400, { 'Error': 'Missing required data.' });
  }
};

//THE FOLLOWING HANDLER ALLOWS THE CUSTOMER TO PLACE THEIR ORDER INTO THEIR SHOPPING CART USING A POST REQUEST.

handlers.shoppingCart = (data, callback) => {
  let goodMethods = ['post', 'get', 'put', 'delete'];
  if (goodMethods.indexOf(data.method) > -1) {
    handlers._shoppingCart[data.method](data, callback);
  } else {
    callback(405);
  }
};

handlers._shoppingCart = {};

//SHOPPING CART - POST
//REQUIRED DATA - phone, token, name, price, quantity
//THERE IS NO OPTIONAL DATA REQUIRED.
handlers._shoppingCart.post = (data, callback) => {

  let phone = typeof (data.payload.phone) === 'string' && data.payload.phone.trim().length === 10 ? data.payload.phone.trim() : false;

  let pizzaNumber = typeof (data.payload.pizzaNumber) === 'string' && data.payload.pizzaNumber.trim().length > 0 ? data.payload.pizzaNumber.trim() : false;

  let quantity = typeof (data.payload.quantity) === 'number' && data.payload.quantity > 0 ? data.payload.quantity : false;




  // console.log(phone, pizzaNumber, quantity);

  if (phone && pizzaNumber && quantity) {

    let token = typeof (data.headers.token) === 'string' && data.headers.token.length === 20 ? data.headers.token : false;
    handlers._tokens.verifyToken(token, phone, (tokenIsValid) => {
      if (tokenIsValid) {
        let orderId = helpers.createRandomString(10);

        //Verify it's on the menu.
        _data.read('menu_items', 'menu', (err, menuData) => {
          menuData.forEach((item) => {
            let price = item[pizzaNumber].price;
            let name = item[pizzaNumber].name;
            let orders = [];
            cartData = {
              "id": orderId,
              "name": name,
              "pizzaNumber": pizzaNumber,
              "price": price,
              "quantity": quantity,
              "total": quantity * price
            };
            orders.push(cartData);
            if (!err && menuData) {
              _data.create('shopping_cart', orderId, orders, (err) => {
                if (!err) {
                  _data.read('shopping_cart', orderId, (err, orderData) => {
                    if (!err && orderData) {
                      callback(200, orderData);
                    } else {
                      callback(500, { 'Error': 'There was a problem reading and sending your orders data.' });
                    }
                  });
                } else {
                  callback(500, { 'Error': 'There was a problem saving your selection to the shopping cart.' });
                }
              });
            } else {
              callback(404, { 'Error': 'That item wasn\'t found on the menu' });
            }
          });
        });
      } else {
        callback(400, { 'Error': 'Missing required token in the headers, or the token is invalid.' });
      }
    });
  } else {
    callback(400, { 'Error': 'Required data is missing, or invalid' });
  }


};


// SHOPPING CART - GET
//REQUIRED DATA: token, phone, orderId
//NO OPTIONAL DATA REQUIRED.

handlers._shoppingCart.get = (data, callback) => {

  let phone = typeof (data.payload.phone) === 'string' && data.payload.phone.trim().length === 10 ? data.payload.phone.trim() : false;

  let orderId = typeof (data.queryStringObject.orderId) === 'string' && data.queryStringObject.orderId.trim().length === 10 ? data.queryStringObject.orderId.trim() : false;


  if (phone && orderId) {
    let token = typeof (data.headers.token) === 'string' && data.headers.token.length === 20 ? data.headers.token : false;

    handlers._tokens.verifyToken(token, phone, (tokenIsValid) => {
      if (tokenIsValid) {
        _data.read('shopping_cart', orderId, (err, cartData) => {
          if (!err && cartData) {
            callback(200, cartData);
          } else {
            callback(500, { 'Error': 'There was an issue retrieving your shopping cart\'s information.' })
          }
        })
      } else {
        callback(400, { 'Error': 'Missing required token in the header, or the token is invalid.' })
      }
    });
  } else {
    callback(400, { 'Error': 'Missing required data.' })
  }
};

//SHOPPING CART - PUT
//REQUIRED DATA: phone, token, orderId
//OPTIONAL DATA: pizzaNumber, quantity

handlers._shoppingCart.put = (data, callback) => {
  //REQUIRED
  let phone = typeof (data.payload.phone) === 'string' && data.payload.phone.trim().length === 10 ? data.payload.phone.trim() : false;

  let orderId = typeof (data.queryStringObject.orderId) === 'string' && data.queryStringObject.orderId.trim().length === 10 ? data.queryStringObject.orderId.trim() : false;

  //OPTIONAL
  let pizzaNumber = typeof (data.payload.pizzaNumber) === 'string' && data.payload.pizzaNumber.trim().length > 0 ? data.payload.pizzaNumber.trim() : false;

  let quantity = typeof (data.payload.quantity) === 'number' && data.payload.quantity > 0 ? data.payload.quantity : false;

  if (phone && orderId) {
    if (pizzaNumber || quantity) {
      let token = typeof (data.headers.token) === 'string' && data.headers.token.length === 20 ? data.headers.token : false;
      handlers._tokens.verifyToken(token, phone, (tokenIsValid) => {
        if (tokenIsValid) {
          _data.read('shopping_cart', orderId, (err, cartData) => {
            if (!err && cartData) {
              cartData.forEach((cart) => {
                _data.read('menu_items', 'menu', (err, menuData) => {
                  if (!err, menuData) {
                    menuData.forEach((item) => {
                      cart.name = item[pizzaNumber].name;
                      cart.price = item[pizzaNumber].price;
                      cart.total = Number((quantity * cart.price).toFixed(2));
                      if (pizzaNumber) {
                        cart.pizzaNumber = pizzaNumber;
                      }
                      if (quantity) {
                        cart.quantity = quantity;
                      }
                    });
                  }
                });
              });

              _data.update('shopping_cart', orderId, cartData, (err) => {
                if (!err) {
                  callback(200, cartData);
                } else {
                  callback(500, { 'Error': 'There was a problem updating your order.' });
                }
              })
            } else {
              callback(400, { 'Error': 'The selected order does not exist, or the orderId is incorrect.' });
            }
          });
        } else {
          callback(400, { 'Error': 'Missing required token in the headers, or token is invalid.' });
        }
      });
    }
  } else {
    callback(400, { 'Error': 'Missing required data.' });
  }
};


//SHOPPING CART - DELETE
//REQUIRED DATA: phone, token, orderId
//NO OPTIONAL DATA REQUIRED

handlers._shoppingCart.delete = (data, callback) => {

  let phone = typeof (data.payload.phone) === 'string' && data.payload.phone.trim().length === 10 ? data.payload.phone.trim() : false;

  let orderId = typeof (data.queryStringObject.orderId) === 'string' && data.queryStringObject.orderId.trim().length === 10 ? data.queryStringObject.orderId.trim() : false;

  if (phone && orderId) {
    let token = typeof (data.headers.token) === 'string' && data.headers.token.length === 20 ? data.headers.token : false;
    handlers._tokens.verifyToken(token, phone, (tokenIsValid) => {
      if (tokenIsValid) {
        _data.read('shopping_cart', orderId, (err, cartData) => {
          if (!err && cartData) {
            _data.delete('shopping_cart', orderId, (err) => {
              if (!err) {
                callback(200, { 'Success': 'Your order was successfully deleted.' });
              } else {
                callback(500, { 'Error': 'There was a problem deleting your order.' });
              }
            });
          } else {
            callback(500, { 'Error': 'There was a problem retrieving your selected order.' });
          }
        });
      } else {
        callback(400, { 'Error': 'Missing token in headers, or token is invalid.' });
      }
    });
  } else {
    callback(400, { 'Error': 'Missing required data.' });
  }
};


//PAYMENT AND EMAILING RECIEPT.
handlers.checkOut = (data, callback) => {
  let goodMethods = ['post'];
  if (goodMethods.indexOf(data.method) > -1) {
    handlers._checkOut[data.method](data, callback);
  } else {
    callback(405);
  }
};

handlers._checkOut = {};


//PAYMENT - POST
//REQUIRED DATA: email, orderId, token, phone  
//NO OPTIONAL DATA REQUIRED

handlers._checkOut.post = (data, callback) => {

  let cardNumber = typeof (data.payload.cardNumber) === 'string' && data.payload.cardNumber.trim().length > 0 ? data.payload.cardNumber.trim() : false;

  let email = typeof (data.payload.email) === 'string' && data.payload.email.trim().length > 0 && data.payload.email.trim().includes('@', '.') ? data.payload.email.trim() : false;

  let phone = typeof (data.payload.phone) === 'string' && data.payload.phone.trim().length === 10 ? data.payload.phone.trim() : false;

  let orderId = typeof (data.queryStringObject.orderId) === 'string' && data.queryStringObject.orderId.trim().length === 10 ? data.queryStringObject.orderId.trim() : false;

  if (cardNumber && email && phone && orderId) {
    let token = typeof (data.headers.token) === 'string' && data.headers.token.length === 20 ? data.headers.token : false;
    handlers._tokens.verifyToken(token, phone, (tokenIsValid) => {
      if (tokenIsValid) {

        _data.read('shopping_cart', orderId, (err, cartData) => {
          if (!err && cartData) {
            // ITERATE THROUGH THE SHOPPING CART ARRAY
            // @TODO: GATHER ALL OF THE TOTALS FROM ALL OF THE SHOPPING CART ARRAYS AND ADD THEM TOGETHER AT ONCE, SO THE USER DOESN'T HAVE TO MAKE MULTIPLE PURCHACES TO COMPLETE AN ORDER.

            cartData.forEach((paymentData) => {
              total = (paymentData.total);

              //PROCESS THE PAYMENT
              helpers.payment(cardNumber, email, total, (err) => {
                if (!err) {

                  //SEND MESSAGE CONFIRMING THE ORDER WAS PROCESSED.
                  let message =
                    `Thank you for trusting us to make a delicious pizza for your family. We hoped you enjoy it and were looking forward to having you as a customer in the future. If there are any problems with your order feel free to contact us at 1-800-PIZZAPI!!! Your order id is ${orderId} and the total charged to your card was ${total}.`


                  helpers.sendEmail(email, message, (err) => {
                    if (!err) {

                      //AFTER ORDER IS PLACED AND MESSAGE IS SENT DELETE THE ORDER FROM THE SHOPPING CART.
                      _data.delete('shopping_cart', orderId, (err) => {
                        if (!err) {
                          callback(200, { 'Success': 'Your payment was processed successfully and an email has been sent to your provided email address. Thank You.' });
                        } else {
                          callback(500, { 'Error': 'There was a problem deleting your shopping cart item after payment was processed.' });
                        }
                      });
                    } else {
                      callback(500, { 'Error': 'There was a problem sending your confirmation email.' });
                    }
                  });
                } else {
                  callback(500, { 'Error': 'There was a problem processing your payment.' });
                }
              });
            });
          } else {
            callback(400, { 'Error': 'There was an error opening your shopping cart, or the order id was invalid.' })
          }
        });
      } else {
        callback(400, { 'Error': 'The token in the headers is either invalid or missing.' })
      }
    })
  } else {
    callback(400, { 'Error': 'Required data is missing.' })
  }
};




//HANDLERS.HELLO IS USED TO TEST THE SERVER.
handlers.hello = (data, callback) => {
  callback(200, { 'Hello': 'Welcome to the Pizza Fiend Machine Queen!!!' });
  console.log(loggedIn);
};





module.exports = handlers;