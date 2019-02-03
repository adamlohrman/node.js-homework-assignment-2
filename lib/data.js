/**
 * Functions to manipulate and store data.
 */

//Dependencies
const fs = require('fs');
const path = require('path');
const helpers = require('./helpers');
//Dependencies

let dataLib = {};

dataLib.baseDir = path.join(__dirname, '/../.data/');

//CREATES AND WRITES NEW DATA TO A FILE.

dataLib.create = (dir, file, data, callback) => {
  fs.open(dataLib.baseDir + dir + '/' + file + '.json', 'wx', (err, fileDescriptor) => {
    if (!err && fileDescriptor) {
      let stringifiedData = JSON.stringify(data);

      fs.writeFile(fileDescriptor, stringifiedData, (err) => {
        if (!err) {
          fs.close(fileDescriptor, (err) => {
            if (!err) {
              callback(false);
            } else {
              callback('There was a problem closing the file.');
            }
          });
        } else {
          callback('There was a problem writing the file to disk.');
        }
      });
    } else {
      callback('Could not create new file. This file may already exist.');
    }
  });
};

//READ THE DATA FROM A FILE.

dataLib.read = (dir, file, callback) => {
  fs.readFile(dataLib.baseDir + dir + '/' + file + '.json', 'utf8', (err, data) => {
    if (!err && data) {
      let parsedData = helpers.parseJsonToObject(data);
      callback(false, parsedData);
    } else {
      callback(err, data);
    }
  });
};

//UPDATE THE DATA IN AN EXISTING FILE.

dataLib.update = (dir, file, data, callback) => {
  fs.open(dataLib.baseDir + dir + '/' + file + '.json', 'r+', (err, fileDescriptor) => {
    if (!err && fileDescriptor) {
      let stringifiedData = JSON.stringify(data);
      fs.ftruncate(fileDescriptor, (err) => {
        if (!err) {
          fs.writeFile(fileDescriptor, stringifiedData, (err) => {
            if (!err) {
              fs.close(fileDescriptor, (err) => {
                if (!err) {
                  callback(false);
                } else {
                  callback('There was an issue closing the file after updating.')
                }
              });
            } else {
              callback('There was a problem when trying to write to the existing file.')
            }
          });
        } else {
          callback('There was an issue when trying to truncate the file for updating.')
        }
      });
    } else {
      callback('There was a problem opening the file for updating.')
    }
  });
};


//DELETE A FILE AND THE DATA WITHIN IT.

dataLib.delete = (dir, file, callback) => {
  fs.unlink(dataLib.baseDir + dir + '/' + file + '.json', (err) => {
    if (!err) {
      callback(false);
    } else {
      callback('There was a problem with deleting the file.')
    }
  });
};


//LIST ALL OF THE ITEMS WITHING A DIRECTORY AFTER APPENDING THEM TO AN ARRAY.

dataLib.list = (dir, callback) => {
  fs.readdir(dataLib.baseDir + dir + '/', (err, data) => {
    if (!err && data && data.length > 0) {
      let trimmedFileNames = [];
      data.forEach((fileName) => {
        trimmedFileNames.push(fileName.replace('.json', ''));
      });
      callback(false, trimmedFileNames);
    } else {
      callback(err, data);
    }
  });
};

dataLib.addToFile = (dir, file, callback) => {
  fs.appendFile(dataLib.baseDir + dir + '/' + file, (err) => {
    if (!err) {
      callback(false);
    } else {
      callback(err);
    }
  });
};


module.exports = dataLib;