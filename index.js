/**
 * Primary file for starting the server and initializing any other background operations.
 * 
 */

//Dependencies
let server = require('./lib/server');

let app = {};

app.init = () => {
  server.init();
};

app.init();

module.exports = app;