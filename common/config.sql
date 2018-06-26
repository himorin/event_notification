-- CREATE DATABASE noticer DEFAULT CHARACTER SET utf8;

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
  route         int         UNSIGNED NOT NULL                            ,
  source        text                 NOT NULL                            ,
  description   text                     NULL                            
);

CREATE TABLE routes (
  id            int         UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY ,
);

