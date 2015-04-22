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

get_email_text = function(job_config) {
  var text = 'This is your automated collection report, courtesy of em0ney:reporter<br><br>';
  var times = _.last(_.uniq(_.sortBy(CollectionCount.find().map(function(c) {
    return c.runTime.valueOf();
  }), function(num) { return num; })), 5);
  if (times.length === 1) {
    text += 'This is your first run, so we have no delta values to report (changes).  These will appear on the next email report.<br>';
  }
  text += "<table><tr>";  
  text += '<th>Collection Name</th>';
  _.each(times, function(time) { 
    if (job_config.dateConfig) {
      text += '<th>@ ' + moment(new Date(time)).format(job_config.dateConfig) + '</th>';
    } else {
      text += '<th>@ ' + moment(new Date(time)).fromNow() + '</th>';
    }
  });
  _.each(job_config.collections, function(collection) {
    text += '</tr><tr>';
    text += '<td>' + collection + '</td>';
    var last = null;
    _.each(times, function(time) {
      var count = CollectionCount.findOne({collectionName: collection, runTime: new Date(time)});
      text += '<td>';
      if (_.isNull(count) || _.isUndefined(count)) {
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
  var htmlText = get_email_text(job_config);
  Reporter.send_results(htmlText, job_config);
  return true;
};

Reporter = {
  // default config
  defaults: {
    schedule: '15 8 ? * *',
    recipients: [],
    collections: [],
    fromAddress: '',
    subject: 'Your scheduled collection report from em0ney:reporter',
    fn: send_delta_email
  },
  // OOB Jobs
  config: {
    'send_delta_email': {
      schedule: '15 8 ? * *',
      recipients: [],
      collections: [],
      fromAddress: '',
      subject: 'Your scheduled collection report from em0ney:reporter',
      fn: send_delta_email
    }
  },
  // Configure default job
  update_job: function(job_key, config_obj) {
    check(job_key, String);
    check(config_obj, {
      schedule: Match.Optional(String), 
      collections: Match.Optional([String]), 
      recipients: Match.Optional([String]), 
      fromAddress: Match.Optional(String), 
      subject: Match.Optional(String), 
      dateConfig: Match.Optional(String),
      fn: Match.Optional(Function)});
    this.config[job_key] = _.defaults(config_obj, this.defaults);
  },
  add_job: function(job_key, config_obj) {
    check(job_key, String);
    check(config_obj, {schedule: String, collections: [String], recipients: [String], fromAddress: String, fn: Function});
    Reporter.config[job_key] = config_obj;
  },
  remove_job: function(job_key) {
    check(job_key, String);
    Reporter.config[job_key] = undefined;
  },
  init: function() {
    _.each(this.config, function(job_config, job_name) {
      if (job_config.collections.length > 0 && job_config.recipients.length > 0) {
        SyncedCron.add({
          name: job_name,
          schedule: function(parser) {
            return parser.cron(job_config.schedule);
          },
          job: function() {
            return job_config.fn(job_config);
          }
        });
      }
    });
    SyncedCron.start();    
  },
  send_results: function(html_text, job_config) {
    check(html_text, String);
    check(job_config, {
      schedule: String, 
      collections: [String], 
      recipients: [String], 
      fromAddress: String, 
      subject: String,
      dateConfig: Match.Optional(String),
      fn: Function});
    _.each(job_config.recipients, function(recipient) {
      Meteor.Mandrill.send({
        to: recipient,
        from: job_config.fromAddress,
        subject: job_config.subject,
        html: html_text
      });
    });
  }
};