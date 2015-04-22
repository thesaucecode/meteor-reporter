Package.describe({
  summary: "Report collection count and other stats to admins periodically",
  git: "https://github.com/thesaucecode/meteor-reporter.git",
  version: "0.1.0"
});

Package.on_use(function (api) {
  api.versionsFrom('METEOR@1.0');
  api.use([
    'mongo',
    'aldeed:collection2@2.3.2',
    'underscore',
    'momentjs:moment@2.8.4',
    'percolatestudio:synced-cron@1.1.0',
    'wylio:mandrill@0.1.0'
  ]);

  api.add_files([
    'lib/reporter_collections.js'
  ], ['client', 'server']);

  api.add_files([
    'lib/startup.js',
    'lib/reporter.js'
  ], 'server');

  api.export([
    'CollectionCount',
    'Reporter'
  ]);
});
