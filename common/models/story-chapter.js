'use strict';

module.exports = function(Storychapter) {
  Storychapter.beforeRemote('create', function(context, storyChapterInstance, next) {
    let params = context.args.data;

    let filterParams = {
      'where': {
        'storyId': params.storyId
      }
    };

    Storychapter.find(filterParams, function (err, instance) {
      console.log(instance);

      params.number = instance.length + 1;

      context.args.data = params;
      next();
    });
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
