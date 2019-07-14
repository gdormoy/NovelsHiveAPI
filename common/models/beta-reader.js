'use strict';

module.exports = function(Betareader) {
  Betareader.afterRemote('create', function (context, betareaderInstance, next) {
    Betareader.app.models.user.findById(context.result.userId, {}, function (err, instance) {
      // context.result['user'] = instance;
      context.result = {
        userId: context.result.userId,
        id: context.result.id,
        storyId: context.result.storyId,
        user: instance
      };
      next();
    })
  })
};
