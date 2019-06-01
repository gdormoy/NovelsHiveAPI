'use strict';

let app = require('../../server/server');
let loopback = require('loopback');
let path = require('path');

module.exports = function(User) {
  User.afterRemote('create', function(context, userInstance, next) {
    // eslint-disable-next-line max-len

    let options = {
      type: 'email',
      to: userInstance.email,
      from: 'noreply@novelshive.com', // TODO : Refer to the config email address
      subject: 'Thanks for registering.',
      template: path.resolve(__dirname, '../../common/views/email_template.ejs'),
      user: User,
      redirect: app.get('novelshiveWebsite') + '/login',
      heading: 'Welcome to Novels Hive :)',
      host: app.get('applicationURL'),
    };

    userInstance.verify(options, function(err, response, next) {
      if (err) {
        console.log(err);
        return next(err);
      }
      console.log('> verification email sent');
    });

    next();
  });

  User.getChapters = function(id, cb) {
    console.log('id : ' + id);
    User.findById(id, {include: {stories: 'storyChapters'}}, function(err, instance) {
      console.log(instance);
      cb(null, instance);
    })
  };

  User.remoteMethod('getChapters', {
    accepts: {arg: 'id', type: 'number', http: {source: 'path'}, required: true, description: 'Id of the user'},
    returns: {arg: 'chapters', type: 'string'},
    http: {path: '/:id/chapters', verb: 'get'},
    description: 'Récupère les chapitres écrits par un utilisateur'
  })
};
