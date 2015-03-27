# Reporter

Install: `meteor add em0ney:reporter`

This is a package designed to email a summary of collection counts and statistics to users.  It is built on-top of:

- [aldeed:collection2](https://atmospherejs.com/aldeed/collection2)              [To define collections to store stats]
- [percolatestudio:synced-cron](https://atmospherejs.com/percolatestudio/synced-cron)     [To schedule email digests]
- [wylio:mandrill](https://atmospherejs.com/wylio/mandrill)                  [To send email using mandrill]

Currently, Reporter will give you the daily count of configured collections and Deltas against the last 5 periods.  For more job types, raise an issue on this repo and we'll be happy to oblige.

## Basic Usage

### 1: Set environment variable with your Mandrill API Key

Either: `$ export MANDRILL_API_KEY=xxxxxxxxxxxxx` in your session before starting meteor or `$ MANDRILL_API_KEY=xxxxxxxxxxx meteor`


### 2: Configure schedule, collections and recipients

If you are using [alanning:roles](https://atmospherejs.com/alanning/roles), congratulations, the recipient list is just a list of role names to be used.  You can also add in email addresses for situations where you want to add non-user recipients.

    Reporter.config({
      schedule: '15 10 ? * *', // cron schedule: every day at 10:15 am 
      collections: ['Meteor.users', 'Posts', 'Comments'],
      recipients: ['admin', 'manager', 'non-user@example.com']
    });

If you are not using [alanning:roles](https://atmospherejs.com/alanning/roles), 1. you should, 2. just use a list of email addresses.

    Reporter.config({
      schedule: '15 10 ? * *', // cron schedule: every day at 10:15 am 
      collections: ['Meteor.users', 'Posts', 'Comments'],
      recipients: ['user@example.com', 'other-user@example.com'],
      from: 'app@example.com'
    });

[Cron expression help](http://www.cronmaker.com/)
[later.js cron reference](http://bunkat.github.io/later/parsers.html#cron)

## Advanced Usage
