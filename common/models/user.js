'use strict';

module.exports = function(User) {
  User.afterRemote('create', function(context, userInstance, next) {
    let options = {
      type: 'email',
      to: userInstance.email,
      from: 'noreply@novelshive.com',
      subject: 'Thanks for registering.',
      user: User
    };

    userInstance.verify(options, function(err, response, next) {
      if (err) return next(err);
      console.log('> verification email sent');
    });

    next();
  });
};
