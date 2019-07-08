'use strict';

module.exports = function(Storychapter) {
  Storychapter.getChapterLocationInStory = function(context, storyChapterInstance, next) {
    let params = context.args.data;

    let filterParams = {
      'where': {
        'storyId': params.storyId
      }
    };

    Storychapter.find(filterParams, function (err, instance) {
      let chapterFound = false;
      let counter = 0;
      for (let i = 0; i < instance.length; ++i) {
        if (instance[i].id === params.id) {
          chapterFound = true;
        }else{
          ++counter;
        }
      }

      if (chapterFound) {
        params.number = counter + 1;
      }

      context.args.data = params;
      next();
    });
  };

  Storychapter.beforeRemote('create', function(context, storyChapterInstance, next) {
    Storychapter.getChapterLocationInStory(context, storyChapterInstance, next);
  });

  Storychapter.beforeRemote('prototype.patchAttributes', function(context, storyChapterInstance, next) {
    Storychapter.getChapterLocationInStory(context, storyChapterInstance, next);
  });

  Storychapter.updateStory = function (context, storyChapterInstance, next) {
    console.log(context.instance);

    if (context.instance === undefined || !context.instance.online) { //Update the 'update_date' of the story only if the chapter is published
      return next();
    }

    let Story = Storychapter.app.models.Story;

    Story.findById(context.args.data.storyId, {}, function (err, instance) {
      instance.updateAttributes({
        "update_date": context.instance.update_date
      }, next);
    })
  };

  Storychapter.afterRemote('prototype.patchAttributes', function(context, storyChapterInstance, next) {
    Storychapter.updateStory(context, storyChapterInstance, next);
  });

  Storychapter.getChaptersForReading = function (id, userId, cb) {
    let filter = {
      include: {
        story: [
          'storyChapters',
          {
            relation: 'favorites',
            scope: {
              where: {
                userId: userId
              }
            }
          }
        ]
      }
    };

    Storychapter.findById(id, filter, function(err, data) {
      let instance = data.toJSON();

      let result = {};
      result.title = instance.title;
      result.text = instance.text;
      result.storyTitle = instance.story.title;

      result.previousChapter = {};
      result.nextChapter = {};

      let favorite = instance.story.favorites[0];

      result.favoriteId = favorite === undefined ? undefined : favorite.id;
      result.storyId = instance.id;

      result.previousChapter.id = instance.number === 1 ? null : instance.story.storyChapters[parseInt(instance.number) - 2].id;
      let nextChapter = instance.story.storyChapters[parseInt(instance.number)];
      result.nextChapter.id = nextChapter === undefined ? null : nextChapter.id;

      cb(null, result);
    })
  };

  Storychapter.remoteMethod('getChaptersForReading', {
    accepts: [
      {arg: 'id', type: 'number', http: {source: 'path'}, required: true, description: 'Id of the chapter to read'},
      {arg: 'userId', type: 'number', http: {source: 'query'}, required: true, description: 'Id of the connected user'}
    ],
    returns: {arg: 'chapter', type: 'string'},
    http: {path: '/:id/read', verb: 'get'},
    description: 'Récupère le chapitre pour la lecture',
  });

  Storychapter.getChapterComments = function (id, cb) {
    Storychapter.findById(id, {include: {publishedCommentaries: 'user'}}, function (err, data) {
      let results = [];

      data.publishedCommentaries().forEach((comment) => {
        let commentary = {};

        commentary.id = comment.id;
        commentary.text = comment.text;
        commentary.publication_date = comment.publication_date;
        commentary.username = comment.user().username;
        results.push(commentary);
      });

      cb(null, results);
    })
  };

  Storychapter.remoteMethod('getChapterComments', {
    accepts: {arg: 'id', type: 'number', http: {source: 'path'}, required: true, description: 'Id of the chapter'},
    returns: {arg: 'commentaries', type: 'string'},
    http: {path: '/:id/publishedCommentaries', verb: 'get'},
    description: 'Récupère les commentaires d\'un chapitre',
  })
};
