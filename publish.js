var zipFolder = require('zip-folder');
var path = require('path');
var fs = require('fs');
var request = require('request');

var rootFolder = path.resolve('.');
var zipPath = path.resolve(rootFolder, '../ukit-a071.zip');
var kuduApi = 'https://ukit-a071.scm.azurewebsites.net/api/zip/site/wwwroot';
var userName = '$ukit-a071';
var password = 'Rqlsst4LlHv6HfHlodxHhnGihQ8l8HqYwkteEEC7ibuEjBHvH4ikGE8fhfGj';

function uploadZip(callback) {
  fs.createReadStream(zipPath).pipe(request.put(kuduApi, {
    auth: {
      username: userName,
      password: password,
      sendImmediately: true
    },
    headers: {
      "Content-Type": "applicaton/zip"
    }
  }))
  .on('response', function(resp){
    if (resp.statusCode >= 200 && resp.statusCode < 300) {
      fs.unlink(zipPath);
      callback(null);
    } else if (resp.statusCode >= 400) {
      callback(resp);
    }
  })
  .on('error', function(err) {
    callback(err)
  });
}

function publish(callback) {
  zipFolder(rootFolder, zipPath, function(err) {
    if (!err) {
      uploadZip(callback);
    } else {
      callback(err);
    }
  })
}

publish(function(err) {
  if (!err) {
    console.log('ukit-a071 publish');
  } else {
    console.error('failed to publish ukit-a071', err);
  }
});