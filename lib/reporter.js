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
  var text = 'This is your automated collection report, courtesy of em0ney:reporter<br><br>';
  var times = _.first(_.uniq(_.sortBy(CollectionCount.find().map(function(c) {
    return c.runTime.valueOf();
  }), function(num) { return num; })), 5);
  if (times.length === 1) {
    text += 'This is your first run, so we have no delta values to report (changes).  These will appear on the next email report.<br>';
  }
  text += "<table><tr>";  
  text += '<th>Collection Name</th>';
  _.each(times, function(time) {
    text += '<th>@ ' + moment(new Date(time)).fromNow() + '</th>';
  });
  _.each(collections, function(collection) {
    text += '</tr><tr>';
    text += '<td>' + collection + '</td>';
    var last = null;
    _.each(times, function(time) {
      var count = CollectionCount.findOne({collectionName: collection, runTime: new Date(time)});
      text += '<td>';
      if (count === null) {
        text += 'NaN';
      } else {
        text += count.totalRecords.toString();
        if (last !== null) {
          text += ' [+' + (count.totalRecords - last).toString() + ']';
        }
        last = count.totalRecords;
      }
      text += '</td>'
    });
  });
  text += "</tr></table><br><br>Have a great day!"; 
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
  var htmlText = get_email_text(job_config.collections);
  _.each(job_config.recipients, function(recipient) {
    Meteor.Mandrill.send({
      to: recipient,
      from: job_config.fromAddress,
      subject: 'Your scheduled collection report from em0ney:reporter',
      html: htmlText
    });
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
    fromAddress: '',
    fn: send_delta_email
  }],
  // Configure default job
  configure: function(config_obj) {
    check(config_obj, {schedule: String, collections: [String], recipients: [String], fromAddress: String});
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