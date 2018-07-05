pfs_notice
******

This repository is built as a collection of tools for notification to PFS 
members via web or physical ways (like telephony) on events such as regular 
teleconferences or meetings. This collection contains: 

- registration control panel
- notification contents distribution site for twilio
- daemon script set for event to Web Push, twilio, etc.
- tool to update registration from calendar

and also required backends are:

- database to store event targets, notification registrations

ToC and links to separated documents:

- `Overview`_

- `Tools`_

  - `common tools and configurations`_
  - `registration control panel`_
  - `notification contents distribution site for twilio`_
  - `daemon script set for event to Web Push, twilio, etc.`_
  - `tool to update registration from calendar`_

- `Dependencies`_

Overview
======

This is an upgrade of quick hack toolset for notification currently used 
within PFS project. 

Four sites or tool sets are defined, and each need to be configured properly. 
Tools has dependency within root directory of repository, it is encouraged to 
configure services with keeping unused ones. 

- Clone from github
- Edit and place configuration files
- Configure web site location or daemon/cron job

Tools
=====

common tools and configurations
------

In `common <common/>`_ directory, system-wide used tools and configurations 
(skelton of them) are placed. 

Refer `document in detail <docs/common.rst>`_. 
Code in `common <common/>`_ directory. 

registration control panel
------

This is the main (or the only?) web interface for usrs. 
Registration for 

- single event on specified date/time to specified user
- continuous registration by matching calendar title for user themself

shall be possible. 
Also, this control panel shall introduce Service Worker for Web Push, if 
requested. 

Refer `document in detail <docs/registration.rst>`_. 
Code in `registration <registration/>`_ directory. 

notification contents distribution site for twilio
------

This is content server for `twilio <https://www.twilio.com/>`_ integration, 
which returns XML for outgoing connection from twilio. 
Returning content will be retrieved from the database with passed process id 
as a key (TBC). 

Refer `document in detail <docs/notification.rst>`_. 
Code in `notification <notification/>`_ directory. 

daemon script set for event to Web Push, twilio, etc.
------

Either running continuously or periodically does not matter, this (set of) 
script will read registration database to load outgoing events to be fired, 
and execute to a specified event target. 

Refer `document in detail <docs/eventinvoke.rst>`_. 
Code in `eventinvoke <eventinvoke/>`_ directory. 

tool to update registration from calendar
------

This is a script periodically lunched to load new or modified source from 
external calendar system as specified through registration web site. 
Script will add new registration(s) into database following predefined regexp 
by user, or will cancel existing registration(s) which is marked as cancelled 
in retrieved calendar data. 

Refer `document in detail <docs/eventupdate.rst>`_. 
Code in `eventupdate <eventupdate/>`_ directory. 

Dependencies
======

- mysql (for overall database backend)
- pywebpush (for daemon script)
- py-vapid (for VAPID configuration)
- python oauth2client
- python google-api-python-client
- perl JSON

