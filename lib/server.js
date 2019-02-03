/**
 * Contains tasks related to server startup and parsing.
 */

//Dependencies
const http = require('http');
const https = require('https');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;
const config = require('./config');
const fs = require('fs');
const handlers = require('./handlers');
const helpers = require('./helpers');
const path = require('path');
const util = require('util');
const debug = util.debuglog('server');
//Dependencies




//Container to export.
let server = {};

server.httpServer = http.createServer((req, res) => {
   server.multiServer(req, res);
});

server.httpsServerOptions = {
   'key': fs.readFileSync(path.join(__dirname, '/../httpSupport/key.pem')),
   'cert': fs.readFileSync(path.join(__dirname, '/../httpSupport/cert.pem'))
};

server.httpsServer = https.createServer(server.httpsServerOptions, (req, res) => {
   server.multiServer(req, res);
});

server.multiServer = (req, res) => {
   const parsedUrl = url.parse(req.url, true);
   const path = parsedUrl.pathname;
   const skimmedPath = path.replace(/^\/+|\/+$/g, '');
   const queryStringObject = parsedUrl.query;
   const method = req.method.toLowerCase();
   const headers = req.headers;

   const decoder = new StringDecoder('utf-8');

   let buffer = '';

   req.on('data', data => {
      buffer += decoder.write(data);
   });

   req.on('end', () => {
      buffer += decoder.end();

      let chosenHandler =
         typeof server.router[skimmedPath] !== 'undefined'
            ? server.router[skimmedPath]
            : handlers.notFound;

      let data = {
         'skimmedPath': skimmedPath,
         'queryStringObject': queryStringObject,
         'method': method,
         'headers': headers,
         'payload': helpers.parseJsonToObject(buffer)
      };

      chosenHandler(data, (statusCode, payload) => {
         statusCode = typeof statusCode === 'number' ? statusCode : 200;
         payload = typeof payload === 'object' ? payload : {};

         let payloadString = JSON.stringify(payload);

         res.setHeader('Content-type', 'application/json');
         res.writeHead(statusCode);
         res.end(payloadString);

         if ((statusCode = 200)) {
            debug(
               '\x1b[32m%s\x1b[0m',
               `${method.toUpperCase()} /${skimmedPath} ${statusCode}`
            );
         } else {
            debug(
               '\x1b[31m%s\x1b[0m',
               `${method.toUpperCase()} /${skimmedPath} ${statusCode}`
            );
         }
      });
   });
};

server.router = {
   'hello': handlers.hello,
   'users': handlers.users,
   'tokens': handlers.tokens,
   'menu': handlers.menu,
   'shoppingCart': handlers.shoppingCart,
   'checkOut': handlers.checkOut
};

server.init = () => {
   server.httpServer.listen(config.httpPort, () => {
      console.log(
         '\x1b[32m%s\x1b[0m',
         `The server is listening on port ${config.httpPort} in: ${config.envName}`
      );
   });

   server.httpsServer.listen(config.httpsPort, () => {
      console.log(
         '\x1b[31m%s\x1b[0m',
         `The server is listening on port ${config.httpsPort} in: ${config.envName}`
      );
   });
};

//Exportation of server.
module.exports = server;
