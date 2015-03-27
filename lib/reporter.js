convertRecipientList = function(recipients) {
  var result = [];
  for (var i = 0; i < recipients.length; i++) {
    var recipient = recipients[i];
    if (recipient.indexOf('@') === -1) {
      //Meteor.users.find({"roles.__global_roles__": {$exists: recipient}}).fetch()
    } else {
      result.push(recipient);
    }
  }
  return result; 
};

sendCollectionCounts = function(collections, recipients) {
  console.log("sending collection counts");
  console.log(collections);
  console.log(recipients);
  var collectionCounts = {};
  for (var i = 0; i < collections.length; i++) {
    var collection = collections[i];

  }
  for (var i = 0; i < recipients.length; i++) {
    var recipient = recipients[i];
    console.log("sending email to: " + recipient);
  }


};

Reporter = {
  send_delta_email: function(collections, recipients) {
    sendCollectionCounts(collections, convertRecipientList(recipients));
  },
  // default config
  config: [{
    name: 'send_delta_email',
    schedule: '15 8 ? * *',
    recipients: [],
    collections: [],
    fn: Reporter.send_delta_email
  }],
  // Configure default job
  configure: function(config_obj) {
    check(config_obj, {schedule: String, collections: [String], recipients: [String]});
    this.config[0] = config;
    this.init();
  },
  init: function() {
    for (var i = 0; i < this.config.length; i++) {
      var job_config = this.config[i];
      if (job_config.collections.length > 0 && job_config.recipients.length > 0) {
        SyncedCron.add({
          name: job_config.name,
          schedule: function(parser) {
            // parser is a later.parse object
            return parser.cron(job_config.schedule);
          },
          job: function() {
            return job_config.fn(job_config.collections, job_config.recipients);
          }
        });
      }
    }
    SyncedCron.start();    
  }



};