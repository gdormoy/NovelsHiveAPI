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
  })
};
