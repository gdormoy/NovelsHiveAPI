'use strict';

module.exports = function(Story) {
  Story.beforeRemote('create', function(context, storyInstance, next) {
    let requestParams = context.args.data;

    let requestFilter = {
      'where': {
        'userId': requestParams.userId,
        'title': requestParams.title
      }
    };

    Story.find(requestFilter, function(err, instance) {
      console.log(instance);
      console.log(instance.length)

      if (instance.length > 0) {
        console.log("Returning an error");
        let error = new Error("A story with title '" + requestParams.title + "' for userId '" + requestParams.userId
          + "' already exists");
        error.statusCode = 409;
        return next(error);
      }else{
        console.log("Continuing to creation");
        next()
      }
    });
  })
};
