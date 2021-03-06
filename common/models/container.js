'use strict';
let fs = require('fs');

module.exports = function(Container) {
  Container.getFileContent = function(container, file, cb = null) {
    let path = 'storage/images/' + container + '/' + file;
    let mimeType = 'image/' + file.slice(file.lastIndexOf('.') + 1);

    // fs.open(path, 'r', (err, fd) => {
    //   let fileStat = fs.statSync(path);
    //
    //   let content = Buffer.alloc(fileStat.size);
    //   fs.read(fd, content, 0, content.length, 0, (err, bytesRead, buffer) => {
    //     fs.close(fd, (err) => {
    //       cb(null, {
    //         mimeType: mimeType,
    //         size: bytesRead,
    //         content: buffer
    //       });
    //     });
    //   });
    // });

    let fd = fs.openSync(path, 'r');
    let fileStat = fs.statSync(path);
    let content = Buffer.alloc(fileStat.size);

    let bytesRead = fs.readSync(fd, content, 0, content.length, 0);
    fs.closeSync(fd);

    let result = {
      mimeType: mimeType,
      size: bytesRead,
      content: content
    };

    if (cb === null) {
      return result;
    }

    cb(null, result);
  };

  Container.remoteMethod('getFileContent', {
    accepts: [
      {arg: 'container', type: 'string', http: {source: 'path'}, required: true, description: 'Name of the container'},
      {arg: 'file', type: 'string', http: {source: 'path'}, required: true, description: 'Name of the file'}
    ],
    returns: {arg: 'result', type: 'string'},
    http: {path: '/:container/files/:file/read', verb: 'GET'},
    description: 'Récupère le fichier'
  });
};
