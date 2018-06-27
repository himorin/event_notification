Registration control panel
======

Registration page allows user to:

- List registered notification events for the user
- Register new notification event
- Add new notification configuration scheme from calendar entry
- List notification targets (tel no, browser etc.) for the user

Backend is connected via REST-liked API.

ToC

- `APIs`_
- `JSON scheme`_

APIs
====

Following APIs are defined for operation.
API is provided through json.cgi, user need to call as 
`/json.cgi/destinations/:username` (or `/json/destination/:username` if server 
is configured). 

- `/notices`_: Registered notification event
- `/targets`_: Notification targets (tel no, browser etc.)
- `/schemes`_: Notification configuration scheme from calendar entry

In API list, query options after `?` is all optional. Default value for each 
option is shown in listings (like `GET /notices/?state=queued`_), and 
`:username` means username currently logged in. 

/notices
------

List and manipulate notification events.
One notification event represents one notification to be fired (not for all 
notification targets of user), which has configuration of event and ID of 
notification target to be used. 

- `GET /notices?state=queued&username=:username`_: Get list of registered 
  notification events
- `GET /notices/:id`_: Get specified registered notification event
- `POST /notices`_: Register new notification event for current logged in 
  user.
- `DELETE /notices/:id`_: Delete specified registered notification event

/targets
------

List and manipulate notification targets.
Multiple notification targets could be defined for one user, and user can 
select target per each notification event on registration. If user selects 
multiple notification targets, the same number of new notification events are 
registered for one notification source. 

- `GET /targets?username=:username`_: Get list of notification targets
- `GET /targets/:id`_: Get specified notification target
- `POST /targets`_: Register new notification target
- `DELETE /targets/:id`_: Delete specified notification target

/schemes
------

List and manipulate notification configuration scheme, which will be used by 
cron-like job to register new notification events from external calendar 
resource. 

- `GET /schemes?username=:username`_: Get list of notification configuration 
  scheme
- `GET /schemes/:id`_: Get specified notification scheme
- `POST /schemes`_: Register new notification scheme
- `DELETE /schemes/:id`_: Delete specified notification scheme


JSON scheme
======

Following scheme are used for returns from API and also for new data via POST. 
Marked as `Required` are required for new data via POST, `RO` are readonly 
item which cannot be set in data via POST. 
Data from APIs which is noted to return a list of data will be an array of 
single object listed here. 
Samples are available in `samples <samples/>`_ directory. 

- `notices`_: One notification event
- `targets`_: One notification target
- `schemes`_: One notification configuration scheme

notices
------

This corresponds to database table `notices`.

- id (`RO`): Unique sequential numerical ID of notification event
- sid (`RO`): Event source ID provided from event provider for fired events
- fired (`RO`): Event is already fired (`1`) or not (`0`)
- target (`Required`): Target datetime
- content (`Required`): Text to be sent out for event
- tid (`Required`): Notification target ID, which is `id` in `targets`
- source (`RO`): From where notification event was created (e.g. `web`)
- url: URL related to event, like page of meeting or link of web conference 
  system
- description: Description of the notification event

`source` will be set at server side (or via tools/scripts run at server), and 
are provided just for reference to notice their source who or which registered 
a specified event. 

targets
------

This corresponds to database table `targets`.

- id (`RO`): Unique sequential numerical ID of notification target
- uname: `:username` of notification target belongs to
- category (`Required`): Category of event provider (e.g. `web`, `sms`, `tel`). 
  This field will be used at firing events as target to where event should be 
  fired. 
- pid (`Required`): Target ID at event provider, like telephone no or endpoint 
  URL.
- description: Description of the notification target

schemes
------

This corresponds to database table `schemes`.

- id (`RO`): Unique sequential numerical ID of notification configuration scheme
- user: `:username` of notification configuration scheme targets to
- content (`Required`): Source of text to be sent out for events registered 
  via the notification configuration scheme, some linked values are possible
  (see below). 
- minutes: events will be registered specified minutes before from start time 
  of calendar entries
- description: Description of the notification configuration scheme

By script at server, notification events will be registered following entries 
defined by scheme from calendar entries. Link provided from calendar will be 
used for `url` in `notices` to be displayed. 
In `content`, following special text will be converted into each value:

- `$title$`: Title of calendar entry

