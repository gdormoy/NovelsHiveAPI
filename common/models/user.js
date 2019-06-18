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
      // eslint-disable-next-line max-len
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
    // eslint-disable-next-line max-len
    User.findById(id, {include: {stories: 'storyChapters'}}, function(err, instance) {
      console.log(instance);
      cb(null, instance);
    });
  };

  User.remoteMethod('getChapters', {
    // eslint-disable-next-line max-len
    accepts: {arg: 'id', type: 'number', http: {source: 'path'}, required: true, description: 'Id of the user'},
    returns: {arg: 'chapters', type: 'string'},
    http: {path: '/:id/chapters', verb: 'get'},
    description: 'Récupère les chapitres écrits par un utilisateur',
  });

  /**
   * @param id
   * @param cb
   * Get all values about user and make it readable for gdpr file
   */
  User.getGDPRInformations = function(id, cb) {
    // eslint-disable-next-line max-len
    User.findById(id, {include: ['stories', 'publishedCommentaries']}, function(err, instance) {
      let tmp = {};
      let jsonStr = ''
      let result = {};
      tmp['user'] = instance;
      jsonStr = JSON.stringify(tmp)
      result = JSON.parse(jsonStr)
      result.user.description = Buffer.from(result.user.description.data).toString('ascii')
      result.user.stories.forEach(function(story) {
        story.synopsis = Buffer.from(story.synopsis.data).toString('ascii');
      });
      result.user.publishedCommentaries.forEach(function(comment) {
        comment.text = Buffer.from(comment.text.data).toString('ascii')
      })
      cb(null, result.user);
    });
  };

  User.remoteMethod('getGDPRInformations', {
    // eslint-disable-next-line max-len
    accepts: {arg: 'id', type: 'number', http: {source: 'path'}, required: true, description: 'Id of the user'},
    returns: {arg: 'data', type: 'string'},
    http: {path: '/:id/gdpr', verb: 'get'},
    description: 'Récupère toutes les information d\'un utilisateur',
  });
};
