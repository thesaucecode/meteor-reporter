# Reporter

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


### 2: Configure schedule, collections, sender and recipients

    Reporter.config({
      schedule: '15 10 ? * *', // cron schedule: every day at 10:15 am 
      collections: ['Meteor.users', 'Posts', 'Comments'],
      recipients: ['user@example.com', 'other-user@example.com'],
      from: 'app@example.com'
    });

[Cron expression help](http://www.cronmaker.com/)
[later.js cron reference](http://bunkat.github.io/later/parsers.html#cron)

## Advanced Usage

Coming soon!  Under development are features like:

- Integration with `alanning:roles` and defining recipients as emails or roles
- Easier user-defined reporter functions
- Ability to include recent documents that make up the deltas in the email
- Personalised email templates
