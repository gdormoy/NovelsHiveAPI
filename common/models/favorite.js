'use strict';

module.exports = function(Favorite) {
  Favorite.beforeRemote('create', function(context, favoriteInstance, next) {
    let requestParams = context.args.data;

    let requestFilter = {
      'where': {
        'userId': requestParams.userId,
        'storyId': requestParams.storyId
      }
    };

    Favorite.findOne(requestFilter, function (err, instance) {
      console.log(instance);

      return next();

      if (instance === null) {
        let error = new Error('User have not the story in favorites');
        error.statusCode = 404;
        return next(error);
      } else {
        next()
      }
    });
  });
};
