Package.describe({
  summary: "Report collection count + deltas. Growth hacking metrics sent to your email however often you want",
  git: "https://github.com/thesaucecode/meteor-reporter.git",
  version: "0.2.1"
});

Package.on_use(function (api) {
  api.versionsFrom('METEOR@1.0');
  api.use([
    'mongo',
    'aldeed:collection2@2.3.2',
    'underscore',
    'momentjs:moment@2.8.4',
    'percolatestudio:synced-cron@1.1.0',
    'wylio:mandrill@0.2.1'
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
