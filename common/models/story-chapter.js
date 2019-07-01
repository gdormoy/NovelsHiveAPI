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
      let counter = 0;
      for (let i = 0; i < instance.length; ++i) {
        if (instance[i].id !== params.id) {
          ++counter;
        }
      }
      params.number = counter + 1;
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


  Storychapter.getChaptersForReading = function (id, cb) {
    Storychapter.findById(id, {include: {story: 'storyChapters'}}, function(err, data) {
      let instance = data.toJSON();

      let result = {};
      result.title = instance.title;
      result.text = instance.text;
      result.storyTitle = instance.story.title;

      result.previousChapter = {};
      result.nextChapter = {};

      result.previousChapter.id = instance.number === 1 ? null : instance.story.storyChapters[parseInt(instance.number) - 2].id;
      let nextChapter = instance.story.storyChapters[parseInt(instance.number)];
      result.nextChapter.id = nextChapter === undefined ? null : nextChapter.id;

      cb(null, result);
    })
  };

  Storychapter.remoteMethod('getChaptersForReading', {
    accepts: {arg: 'id', type: 'number', http: {source: 'path'}, required: true, description: 'Id of the chapter to read'},
    returns: {arg: 'chapter', type: 'string'},
    http: {path: '/:id/read', verb: 'get'},
    description: 'Récupère le chapitre pour la lecture',
  });
};
