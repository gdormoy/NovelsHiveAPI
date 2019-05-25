'use strict';

let app = require('../../server/server');

module.exports = function(User) {
  User.afterRemote('create', function(context, userInstance, next) {
    let options = {
      type: 'email',
      to: userInstance.email,
      from: 'noreply@novelshive.com',
      subject: 'Thanks for registering.',
      user: User,
      redirect: app.get('novelshiveWebsite') + 'HelloWorld'
    };

    userInstance.verify(options, function(err, response, next) {
      if (err) return next(err);
      console.log('> verification email sent');
    });

    next();
  });
};
