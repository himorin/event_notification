-- CREATE DATABASE notice DEFAULT CHARACTER SET utf8mb4;

/* Update history summary
 *
 *
 *   */

CREATE TABLE notices (
  id            int         UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY ,
  sid           text                     NULL                            ,
  fired         tinyint     UNSIGNED NOT NULL DEFAULT 0                  ,
  target        datetime             NOT NULL                            ,
  content       text                 NOT NULL                            ,
  tid           int         UNSIGNED NOT NULL                            ,
  source        text                 NOT NULL                            ,
  url           text                     NULL                            ,
  description   text                     NULL                            
);

CREATE TABLE targets (
  id            int         UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY ,
  uname         text                 NOT NULL                            ,
  category      text                 NOT NULL                            ,
  pid           text                 NOT NULL                            ,
  param         text                     NULL                            ,
  description   text                     NULL                            
);

CREATE TABLE schemes (
  id            int         UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY ,
  uname         text                 NOT NULL                            ,
  content       text                 NOT NULL                            ,
  exec_cond     text                 NOT NULL                            ,
  minutes       int         UNSIGNED NOT NULL                            ,
  tid           int         UNSIGNED NOT NULL                            ,
  description   text                     NULL                            
);

