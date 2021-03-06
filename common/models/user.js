'use strict';

let app = require('../../server/server');
let loopback = require('loopback');
let path = require('path');
let pdf = require('html-pdf');

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
    // eslint-disable-next-line max-len
    User.findById(id, {include: {stories: 'storyChapters'}}, function(err, instance) {
      instance.stories().forEach(story => {
        if (story.panel !== null) {
          story.panel = JSON.stringify(User.app.models.Container.getFileContent('storyImage', story.panel));
        }
      });

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

  User.convertJsonIntoHtml = function(jsonObject) {
    let htmlToJson = '<!doctype html>' +
      '<html>' +
        '<body>' +
          '<div style="text-align: center">' +
            '<h1>GDPR Informations</h1>' +
          '</div>' +
          '<div>' +
            '<table style="font-size: 1.5em; margin-left: 25px" cellspacing="10">' +
              '<tr>' +
                '<td width=150>' +
                  'Username:' +
                '</td>' +
                '<td>' +
                  jsonObject.username +
                '</td>' +
              '</tr>' +
              '<tr>' +
                '<td width=150>' +
                  'Email:' +
                '</td>' +
                '<td>' +
                  jsonObject.email +
                '</td>' +
              '</tr>' +
              '<tr>' +
                '<td width=150>' +
                  'Description:' +
                '</td>' +
                '<td>' +
                  jsonObject.description +
                '</td>' +
              '</tr>' +
              '<tr>' +
                '<td>' +
                  'Strories: ' +
                '</td>' +
              '</tr>' +
              '<tr>' +
              '<td></td>' +
              '<td><table cellspacing="10">';

    for (let counter = 0; counter < jsonObject.stories.length; counter++) {
      htmlToJson += '' +
        '<tr>' +
          '<td>Title:</td>' +
          '<td>' + jsonObject.stories[counter].title + '</td>' +
        '</tr>' +
        '<tr>' +
          '<td>Publication Date:</td>' +
          '<td>' + jsonObject.stories[counter].publication_date + '</td>' +
        '</tr>' +
        '<tr>' +
        '<td>Synopsis:</td>' +
        '<td>' + jsonObject.stories[counter].synopsis + '</td>' +
        '</tr>';
    }

    htmlToJson += '</table></td></tr>' +
      '<tr>' +
      '<td>Favorites:</td>' +
      '</tr>' +
      '<tr>' +
      '<td></td>' +
      '<td><table cellspacing="10">';

    for (let counter2 = 0; counter2 < jsonObject.favorites.length; counter2++) {
      htmlToJson += '' +
        '<tr>' +
        '<td>' + jsonObject.favorites[counter2].story.title + '</td>' +
        '</tr>';
    }

    htmlToJson += '</table></td></tr>' +
      '<tr>' +
        '<td>Comments:</td>' +
      '</tr>' +
      '<tr>' +
      '<td></td>' +
      '<td><table cellspacing="10">';

    for (let counter2 = 0; counter2 < jsonObject.publishedCommentaries.length; counter2++) {
      htmlToJson += '' +
        '<tr>' +
          '<td>Comment:</td>' +
          '<td>' + jsonObject.publishedCommentaries[counter2].text + '</td>' +
        '</tr>';
    }

    htmlToJson += '</table></td></tr>' +
      '</table>' +
      '</div>' +
      '</body>' +
      '</html>';
    return htmlToJson;
  };

  /**
   * @param id
   * @param cb
   * Get all values about user and make it readable for gdpr file
   */
  User.getGDPRInformations = function(id, cb) {
    // eslint-disable-next-line max-len
    User.findById(id, {include: ['stories', 'publishedCommentaries', {favorites: 'story'}]}, function(err, instance) {
      let tmp = {};
      let jsonStr;
      let result = {};
      let htmlResult;
      let pathOutputFile = './storage/';
      let config = {format: 'A4'};

      tmp['user'] = instance;
      jsonStr = JSON.stringify(tmp);
      result = JSON.parse(jsonStr);
      result.user.description = Buffer.from(result.user.description.data).toString('ascii');
      result.user.stories.forEach(function(story) {
        story.synopsis = Buffer.from(story.synopsis.data).toString('ascii');
      });
      result.user.publishedCommentaries.forEach(function(comment) {
        comment.text = Buffer.from(comment.text.data).toString('ascii');
      });
      pathOutputFile += result.user.username + '.pdf';
      htmlResult = User.convertJsonIntoHtml(result.user);
      pdf.create(htmlResult, config).toFile(pathOutputFile, function(err, res) {
        if (err) return console.log(err);
        console.log(res);
        cb(null, result, 'application/pdf');
      })
    });
  };

  User.remoteMethod('getGDPRInformations', {
    // eslint-disable-next-line max-len
    accepts: {arg: 'id', type: 'number', http: {source: 'path'}, required: true, description: 'Id of the user'},
    returns: {arg: 'body', type: 'string', root: true},
    http: {path: '/:id/gdpr', verb: 'get'},
    description: 'Récupère toutes les information d\'un utilisateur',
  });

  User.afterRemote('getGDPRInformations', function (context, userInstance, next) {
    console.log(userInstance.user);
    User.app.models.Email.send({
      to: userInstance.user.email,
      from: 'noreply@novelshive.com', // TODO : Refer to the config email address
      subject: 'NovelHive information.',
      attachments: [
        {
          filename: 'NovelHive Informations.pdf',
          path: './storage/' + userInstance.user.username + '.pdf', // stream this file
        },
      ],
    });
  });

  User.getFavoriteStories = function(id, cb) {
    // eslint-disable-next-line max-len
    User.findById(id, {include: {favorites: 'story'}}, function(err, instance) {
      let tmp = {};
      let jsonStr;
      let result;
      let stories = [];
      tmp['user'] = instance;
      jsonStr = JSON.stringify(tmp);
      result = JSON.parse(jsonStr);
      result.user.favorites.forEach(function(favorite) {
        stories.push(favorite.story);
      });
      cb(null, stories);
    });
  };

  User.remoteMethod('getFavoriteStories', {
    // eslint-disable-next-line max-len
    accepts: {arg: 'id', type: 'number', http: {source: 'path'}, required: true, description: 'Id of the user'},
    returns: {arg: 'stories', type: 'string'},
    http: {path: '/:id/favoriteStories', verb: 'get'},
    description: 'Récupère les histoires mises en favoris par un utilisateur',
  });

  // TODO Delete All element about the user

  User.deleteAllAboutUser = function(id, cb) {
    User.findById(id, {include: [{stories: 'storyChapters'}, 'favorites', 'betaReaders']}, function(err, instance) {
      let tmp = {};
      let jsonStr, result;
      tmp['user'] = instance;
      jsonStr = JSON.stringify(tmp);
      result = JSON.parse(jsonStr);
      if (result.user.favorites != undefined) {
        result.user.favorites.forEach(function(favorite) {
          let Fav = app.models.Favorite;
          Fav.destroyById(favorite.id, null);
        });
      }
      if (result.user.stories != undefined) {
        result.user.stories.forEach(function(story) {
          if (story.storyChapters != undefined) {
            story.storyChapters.forEach(function(chapter) {
              let Chapter = app.models.Story_chapter;
              Chapter.destroyById(chapter.id, null);
            });
          }
          let Story = app.models.Story;
          Story.findById(story.id, {include: ['betaReaders', 'favorites']}, function (err, instance) {
            let tmp = {}
            let jsonstr, result;
            tmp['story'] = instance;
            jsonStr = JSON.stringify(tmp);
            result = JSON.parse(jsonStr);
            if (result.story.betaReaders != undefined) {
              result.story.betaReaders.forEach(function(reader) {
                let Reader = app.models.Beta_reader;
                Reader.destroyById(reader.id, null);
              });
            }
            if (result.story.favorites != undefined) {
              result.story.favorites.forEach(function(favorite) {
                let Favorite = app.models.Favorite;
                Favorite.destroyById(favorite.id, null);
              });
            }
            Story.destroyById(story.id, null);
          });
        });
      }
      if (result.user.publishedCommentaries != undefined) {
        result.user.publishedCommentaries.forEach(function(comment) {
          let Comment = app.models.Published_commentary;
          Comment.destroyById(comment.id, null);
        });
      }
      if (result.user.betaReaders != undefined) {
        result.user.betaReaders.forEach(function(reader) {
          let Reader = app.models.Beta_reader;
          Reader.destroyById(reader.id, null);
        });
      }
      User.destroyById(id, null)
      cb(null, instance);
    });
  };

  User.remoteMethod('deleteAllAboutUser', {
    // eslint-disable-next-line max-len
    accepts: {arg: 'id', type: 'number', http: {source: 'path'}, required: true, description: 'Id of the user'},
    http: {path: '/:id/deleteAllAboutUser', verb: 'delete'},
    description: 'Détruit toutes les informations concernant le user',
  });
};
