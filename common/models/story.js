'use strict';

let app = require('../../server/server');
let _ = require('lodash');

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
      if (instance.length > 0) {
        let error = new Error("A story with title '" + requestParams.title + "' for userId '" + requestParams.userId
          + "' already exists");
        error.statusCode = 409;
        return next(error);
      }else{
        next()
      }
    });
  });

  Story.afterRemote('create', function(context, storyInstance, next) {
    let storyId = context.result.id;

    let tags = context.result.storyTags.map(tag => {
      tag = tag.trim().toLowerCase();
      tag = tag.charAt(0).toUpperCase() + tag.slice(1);

      return tag;
    });

    let StoryHasStoryTag = Story.app.models.StoryHasStoryTag;
    let StoryTag = StoryHasStoryTag.app.models.StoryTag;

    tags.forEach(storyTag => {
      let findFilter = {
        where: {
          name: storyTag
        }
      };

      StoryTag.find(findFilter)
        .then(foundStoryTag => {
          if (foundStoryTag.length > 0)
            return new Promise((resolve, reject) => resolve(foundStoryTag[0]));

          return StoryTag.create({name: storyTag})
        })
        .then(storyTag => {
          let newRelation = {
            storyId: storyId,
            storyTagId: storyTag.id
          };

          StoryHasStoryTag.findOrCreate({where: newRelation}, newRelation, function (err, instance, created) {
          });
        });
    });
    next();
  });

  Story.getStoryTags = function(id, cb) {
    // eslint-disable-next-line max-len
    Story.findById(id, {include: {storyHasStoryTags: 'storyTag'}}, function(err, instance) {
      let tmp = {};
      let jsonStr;
      let result;
      let tags = [];
      tmp['story'] = instance;
      jsonStr = JSON.stringify(tmp);
      result = JSON.parse(jsonStr);
      result.story.storyHasStoryTags.forEach(function(storyTagLink) {
        tags.push(storyTagLink.storyTag);
      });
      cb(null, tags);
    });
  };

  Story.remoteMethod('getStoryTags', {
    // eslint-disable-next-line max-len
    accepts: {arg: 'id', type: 'number', http: {source: 'path'}, required: true, description: 'Id of the story'},
    returns: {arg: 'tags', type: 'string'},
    http: {path: '/:id/storyTags', verb: 'get'},
    description: 'Récupère les tags associés à une histoire',
  });

  Story.getStoryAndChaptersById = function (id, connectedUserId, filterParam, cb) {
    let filter = {
      include: [
        {
          relation: 'user',
          scope: {
            fields: ['id', 'username']
          }
        },
        {
          relation: 'storyChapters',
          scope: {
            fields: ['title', 'number', 'id', 'online']
          }
        },
        {
          relation: 'storyKind'
        },
        {
          relation: 'favorites',
          scope: {
            where: {
              userId: connectedUserId
            }
          }
        }
      ]
    };

    function customizer(objValue, srcValue) {
      if (_.isArray(objValue)) {
        return objValue.concat(srcValue);
      }
    }

    let result = _.mergeWith(filter, filterParam, customizer);

    Story.findById(id, result, function (err, instance) {
      instance.storyChapters().forEach((chapter) => {
        if (chapter.online === false) {
          chapter.title = '[UNPUBLISHED] ' + chapter.title;
        }
      });

      cb(null, instance);
    })
  };

  Story.remoteMethod('getStoryAndChaptersById', {
    // eslint-disable-next-line max-len
    accepts: [
      {arg: 'id', type: 'number', http: {source: 'path'}, required: true, description: 'Id of the story'},
      {arg: 'userId', type: 'number', http: {source: 'query'}, required: true, description: 'Id of the connected user'},
      {arg: 'filter', type: 'object', http: {source: 'query'}, required: false, description: 'Filter'}
    ],
    returns: {arg: 'story', type: 'string'},
    http: {path: '/:id/chapters', verb: 'get'},
    description: 'Récupère une histoire et les chapitres associés',
  });
};
