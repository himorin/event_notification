Notification contents distribution site for twilio
======

Once twilio event has invoked from event push daemon via twilio API, service 
will access to specified data distribution endpoint with event parameters. 
This script will get AccountSid and CallSid from POST data, check 
AccountSid is itself, return xml reply using data entry in the database 
for CallSid, and mark an entry for specific CallSid finished. 

CallSid in the database is pushed by event push daemon using return value 
from twilio API. 

Future extention
------

To support similar external service API which requires callback for data 
supply, this script need to check user agent string of accesser, like 
`Twilio...` (currently `TwilioProxy/1.1`) for twilio, and to execute matching 
handler to return output. 
Table schema of the database is capable to store some variety of event 
services. 

