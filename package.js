Package.describe({
  summary: "Report collection count and other stats to admins periodically",
  git: "https://github.com/thesaucecode/meteor-reporter.git",
  version: "0.0.1"
});

Package.on_use(function (api) {
  api.versonsFrom("METEOR@0.9.0");
  api.use([
    'mongo',
    'aldeed:collection2',
    'underscore',
    'momentjs:moment',
    'percolatestudio:synced-cron',
    'wylio:mandrill'
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