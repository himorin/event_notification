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

  - `registration control panel`_
  - `notification contents distribution site for twilio`_
  - `daemon script set for event to Web Push, twilio, etc.`_
  - `tool to update registration from calendar`_

- `Dependencies`_

Overview
======



Tools
=====

registration control panel
------

This is the main (or the only?) web interface for usrs. 
Registration for 

- single event on specified date/time to specified user
- continuous registration by matching calendar title for user themself

shall be possible. 
Also, this control panel shall introduce Service Worker for Web Push, if 
requested. 

notification contents distribution site for twilio
------

This is content server for `twilio <https://www.twilio.com/>`_ integration, 
which returns XML for outgoing connection from twilio. 
Returning content will be retrieved from the database with passed process id 
as a key (TBC). 

daemon script set for event to Web Push, twilio, etc.
------

Either running continuously or periodically does not matter, this (set of) 
script will read registration database to load outgoing events to be fired, 
and execute to a specified event target. 

tool to update registration from calendar
------

This is a script periodically lunched to load new or modified source from 
external calendar system as specified through registration web site. 
Script will add new registration(s) into database following predefined regexp 
by user, or will cancel existing registration(s) which is marked as cancelled 
in retrieved calendar data. 

Dependencies
======

- mysql (for overall database backend)
- pywebpush (for daemon script)
- py-vapid (for VAPID configuration)

