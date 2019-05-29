'use strict';

let app = require('../../server/server');
let loopback = require('loopback');
let path = require('path');

module.exports = function(User) {
  User.afterRemote('create', function(context, userInstance, next) {
    // eslint-disable-next-line max-len
    const emailText = 'Thanks for registering. Please follow the link below to complete your registration.\n\n' +
      '[MUST INSERT THE LINK]'; // TODO : Add this in config

    const emailBody = {
      heading: 'Welcome to Novels Hive :)',
      text: emailText,
    };

    let options = {
      type: 'email',
      to: userInstance.email,
      from: 'noreply@novelshive.com', // TODO : Refer to the config email address
      subject: 'Thanks for registering.',
      template: path.resolve(__dirname, '../../common/views/email_template.ejs'),
      user: User,
      redirect: app.get('novelshiveWebsite') + '/login',
      heading: 'Welcome to Novels Hive :)',
      text: emailText,
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
};
