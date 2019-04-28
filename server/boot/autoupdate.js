'use strict';

module.exports = function enableAuthentication(server, cb) {
  const ds = server.dataSources.mysql;

  const models = [
    'ACL',
    'AccessToken',
    'Role',
    'user',
    'Story',
    'Favorite',
    'Story_status',
    'Beta_reader',
    'Rank',
    'Story_chapter',
    'Draft_commentary',
    'Published_commentary',
    'Language',
    'Story_kind',
    'Story_rating',
    'Universe',
    'Story_tag',
    'Story_has_story_tag'
  ];

  ds.setMaxListeners(Infinity);

  ds.autoupdate(models, function(err) {
    if (err) return cb(err);
    console.log('Tables [' + models + '] created in ', ds.adapter.name);
    cb();
  });
};
