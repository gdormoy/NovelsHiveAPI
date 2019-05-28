'use strict';

const DEFAULT_CONFIG = require('./datasources');

const config = {
  mysql: DEFAULT_CONFIG.mysql,
  gmailMailer: DEFAULT_CONFIG.gmailMailer,
};

/*
config.mysql.host = '';
config.mysql.database = '';
config.mysql.password = '';
config.mysql.user = '';

config.gmailMailer.transports[0].auth.user = '';
config.gmailMailer.transports[0].auth.pass = '';
*/

module.exports = config;
