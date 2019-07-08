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
    });
  });
};
