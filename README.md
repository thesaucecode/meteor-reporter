# em0ney:reporter

Simple collection count and delta reports.  Growth hacking metrics delivered to your inbox however often you want.

Install: `meteor add em0ney:reporter`

This is a package designed to email a summary of collection counts and statistics to users.  It is built on-top of:

- [aldeed:collection2](https://atmospherejs.com/aldeed/collection2)              [To define collections to store stats]
- [percolatestudio:synced-cron](https://atmospherejs.com/percolatestudio/synced-cron)     [To schedule email digests]
- [wylio:mandrill](https://atmospherejs.com/wylio/mandrill)                  [To send email using mandrill]
- [underscore](https://atmospherejs.com/wylio/mandrill)                  [Everyone's favourite js library]
- [momentjs:moment](https://atmospherejs.com/momentjs/moment)          [To format the time in the email message]

Currently, Reporter will give you the daily count of configured collections and Deltas against the last 5 periods.  For more job types, raise an issue on this repo and we'll be happy to oblige.

## Basic Usage

### 1: Set environment variable with your Mandrill API Key

Either: `$ export MANDRILL_API_KEY=xxxxxxxxxxxxx` in your session before starting meteor or `$ MANDRILL_API_KEY=xxxxxxxxxxx meteor`


### 2: Configure or Deactivate Out of the Box Jobs

The package comes with the following out of the box jobs:

- `send_delta_email`: send configured recipients the configured collection counts and deltas for the last 5 runs

Configure this as follows.  Any options omitted will be sourced from the existing configuration object.

```javascript
Reporter.update_job('send_delta_email', {
  schedule: '15 10 ? * *', // cron schedule: every day at 10:15 am 
  collections: ['Meteor.users', 'Posts', 'Comments'],
  recipients: ['user@example.com', 'other-user@example.com'],
  fromAddress: 'app@example.com',
  subject: 'my custom subject'
});
```

[Cron expression help](http://www.cronmaker.com/)
[later.js cron reference](http://bunkat.github.io/later/parsers.html#cron)

If you do not wish to run an out of the box job, simply fun the following:

```javascript
Reporter.remove_job('send_delta_email');
```

### 3: Initialize Synced Cron through our hook

```javascript
Reporter.init();
```

And that's it!

##### In summary, include the following.

```javascript
if (Meteor.isServer) {
  Meteor.startup(function() {
    Reporter.update_job('send_delta_email', {
      schedule: '15 10 ? * *', // cron schedule: every day at 10:15 am 
      collections: ['Meteor.users', 'Posts', 'Comments'],
      recipients: ['user@example.com', 'other-user@example.com'],
      fromAddress: 'app@example.com',
      dateConfig: 'MMM Do, HH:mm', // OPTIONAL.  moment.js format.  If omitted, uses .ago()
      subject: 'my custom subject'
    });
    Reporter.init();
  }); 
}
```

## Functions

### `init()`

This function declares each SyncedCron job for the entered job configuration and initialises SyncedCron to run.  Must be called for this entered job configurations to take effect.

### `add_job(job_key, config_obj)`
###### `job_key: String`
###### `config_obj: {schedule: String, collections: [String], recipients: [String], fromAddress: String, subject: String, fn: Function}`

This adds a job to be initialised in the `init()` function.  Job keys must be unique.  If called on an existing job, the entire job config will be replaced with that passed in.

### `update_job(job_key, config_obj)`
###### `job_key: String`
###### `config_obj: {schedule: String, collections: [String], recipients: [String], fromAddress: String, subject: String, fn: Function}`

This updates the config for the given job config.  For any arguments that aren't provided, the existing setting from the previous config will be used.

### `remove_job(job_key)`
###### `job_key: String`

This removes a job.

### `reload_job(job_key)`
###### `job_key: String`

This reloads the configuration referenced by job_key, such that SyncedCron reloads the schedule for it.  It should be called after `update_job` if `init()` has already been called.

e.g. 

```javascript
	Reporter.init();
...
	Reporter.update_job('send_delta_email', {
      schedule: '15 10 ? * *', // cron schedule: every day at 10:15 am 
      collections: ['Meteor.users', 'Posts', 'Comments'],
      recipients: ['user@example.com', 'other-user@example.com'],
      fromAddress: 'app@example.com',
      dateConfig: 'MMM Do, HH:mm', // OPTIONAL.  moment.js format.  If omitted, uses .ago()
      subject: 'my custom subject'
    });
    Reporter.reload_job('send_delta_email');
```

### `send_results(html_body, config_obj)`
###### `html_body: String`
###### `config_obj: {schedule: String, collections: [String], recipients: [String], fromAddress: String, subject: String, fn: Function}`

The `config_obj` is provided as the first and only argument to the function for each scheduled job.  After collecting data and creating an HTML formatted email body, call `send_results(html_body, config_obj)` to send that email to each of the job's configured recipients through Mandrill's API.

## Advanced Usage

Coming soon!  Under development are features like:

- Optional integration with `alanning:roles` and defining recipients as emails or roles
- Ability to include recent documents that make up the deltas in the email
- Personalised email templates
- Admin page to configure schedule and collections for jobs
- Dashboard page

