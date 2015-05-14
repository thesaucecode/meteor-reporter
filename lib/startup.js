// On server startup
Meteor.startup(function() {
  if (!_.isUndefined(process.env.MANDRILL_API_KEY) && !_.isEmpty(process.env.MANDRILL_API_KEY)) {
    Meteor.Mandrill.config({
      "key": process.env.MANDRILL_API_KEY
    });
  } else {
    console.log("em0ney:reporter : MANDRILL_API_KEY environment variable missing.  Please set before launching.");
  }
});

