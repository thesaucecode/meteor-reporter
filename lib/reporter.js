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

get_collection_from_string = function(collection) {
  var fn = null;
  if (collection.indexOf('.') !== -1) {
    var components = collection.split(/\./);
    fn = this[components[0]];
    if (fn && components.length === 2) {
      fn = fn[components[1]];
    }
  } else {
    fn = this[collection];
  }
  return fn;
};

get_email_text = function(collections) {
  var text = 'This is your automated collection report, courtesy of em0ney:reporter \n';
  var times = _.sortBy(_.uniq(CollectionCount.find({},{limit:5}).map(function(c) {
    return c.runTime.valueOf();
  })), function(num) { return num; });
  if (times.length === 1) {
    text += '\nThis is your first run, so we have no delta values to report (changes).  These will appear on the next email report.\n';
  }
  text = text + 'Collection Name';
  _.each(times, function(time) {
    text += '\t\t@ ' + moment(new Date(time)).fromNow();
  });
  
  _.each(collections, function(collection) {
    text += '\n' + collection;
    var last = null;
    _.each(times, function(time) {
      var count = CollectionCount.findOne({collectionName: collection, runTime: new Date(time)});
      text += '\t\t';
      if (count === null) {
        text += 'NaN';
      } else {
        text += count.totalRecords.toString();
        if (last !== null) {
          text += ' [+' + (count.totalRecords - last).toString() + ']';
        }
        last = count.totalRecords;
      }
    });
  });
  return text;
};

send_delta_email = function(job_config) {
  var runTime = new Date();
  var collectionCounts = {};
  _.each(job_config.collections, function(collection) {
    fn = get_collection_from_string(collection);
    collectionCounts[collection] = fn.find().count();
    CollectionCount.insert({
      collectionName: collection,
      totalRecords: collectionCounts[collection],
      runTime: runTime
    });
  });
  console.log(collectionCounts);
  var html_text = get_email_text(job_config.collections);
  _.each(job_config.recipients, function(recipient) {

  });
  return true;
};

Reporter = {
  // default config
  config: [{
    name: 'send_delta_email',
    schedule: '15 8 ? * *',
    recipients: [],
    collections: [],
    fn: send_delta_email
  }],
  // Configure default job
  configure: function(config_obj) {
    check(config_obj, {schedule: String, collections: [String], recipients: [String]});
    this.config[0] = _.defaults(config_obj, this.config[0]);
    this.init();
  },
  init: function() {
    for (var i = 0; i < this.config.length; i++) {
      var job_config = this.config[i];
      if (job_config.collections.length > 0 && job_config.recipients.length > 0) {
        SyncedCron.add({
          name: job_config.name,
          schedule: function(parser) {
            return parser.cron(job_config.schedule);
          },
          job: function() {
            return job_config.fn(job_config);
          }
        });
      }
    }
    SyncedCron.start();    
  }
};