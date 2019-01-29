Common tools and configurations
======

This directory contains site-wide common tools and configurations.

- `Database definition`_ 
- `Site-wide configuration`_

Database definition
------

Database definition SQL is placed as `config.sql`, site administrator shall 
create a database and tables using database tools. 

Site-wide configuration
------

In this repository, only skelton named `config-skelton.json` is placed, 
site administrator shall copy it to `config.json` and change values as 
description below. 
Configurations are categorized as target services, like VAPID, twilio, etc. 
and each are wrapped as json object. 

- `database`

  - `db`: Database name to be used
  - `pass`: Password for database connection
  - `user`: Username for database connection

- `twilio`

  - `account`: Account id
  - `api_fromnum`: Caller phone number
  - `token`: Account access token

- `vapid` (paste output txt file contents to values of keys)

  - `private`: server private key for VAPID ECDH
  - `public`: server public key for VAPID ECDH


VAPID key generation
------

Paste contents of output txt files directly into json value for keys.

::

  openssl ecparam -genkey -name prime256v1 -out private_key.pem
  openssl ec -in private_key.pem -outform DER \
    | tail -c +8 | head -c 32 | base64 -w 0 >> private_key.txt 
  openssl ec -in private_key.pem -pubout -outform DER \
    | tail -c 65 | base64 -w 0 >> public_key.txt

