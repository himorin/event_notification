#! /usr/bin/env python3

import sys
from datetime import datetime

import mysql.connector
from mysql.connector import errorcode

DEF_SEC_OVERHEAD = 10

class EventDB(object):

    db_targets = {}

    def Connect(self, conf):
        db_dsn = {
            'user': conf['db_user'], 
            'password': conf['db_pass'], 
            'host': conf['db_host'],
            'database': conf['db_name'],
            'port': conf['db_port'],
        }
        try:
            self.cnx = mysql.connector.connect(**db_dsn)
        except mysql.connector.Error as err:
            if err.errno == errorcode.ER_ACCESS_DENIED_ERROR:
                raise Exception("Database access denied")
            elif err.errno == errorcode.ER_BAD_DB_ERROR:
                raise Exception("Specified database does not exist")
            else:
                raise Exception("An error occured on database connection")
            self.cnx = None

    def _get_new_cursor(self):
        if self.cnx == None:
            raise Exception("Database is not connected")
        return self.cnx.cursor()

    def Close(self):
        if self.cnx != None:
            self.cnx.close()

    def ListNotices(self, minutes):
        if int(minutes) < 1:
            return None
        ssec = int(minutes) * 60
        t_now = datetime.utcnow().timestamp() - DEF_SEC_OVERHEAD
        cursor = self._get_new_cursor()
        cursor.execute("SELECT * FROM notices WHERE target > FROM_UNIXTIME(%s) AND target < FROM_UNIXTIME(%s) AND fired = 0",
            [t_now, t_now + ssec])
        row_ids = cursor.column_names
        ret = {}
        for row_raw in cursor:
            row = dict(zip(row_ids, row_raw))
            ret[row['id']] = row
        cursor.close()
        return ret

    def UpdateNotice(self, id, sid, fired):
        cursor = self._get_new_cursor()
        cursor.execute("UPDATE notices SET sid = %s, fired = %s WHERE id = %s", 
            [sid, fired, id])
        self.cnx.commit()
        if cursor.rowcount != 1:
            print("Not updated")
            return None
        cursor.close()
        return id

    def UpdateNoticeSuccess(self, id, sid):
        return self.UpdateNotice(id, sid, 1)

    def UpdateNoticeError(self, id, error):
        return self.UpdateNotice(id, error, 4)

    def UpdateNoticePushed(self, id, sid):
        return self.UpdateNotice(id, sid, 5)

    def GetTargetInfo(self, id):
        if id in self.db_targets:
            return self.db_targets[id]
        cursor = self._get_new_cursor()
        cursor.execute("SELECT * FROM targets WHERE id = %s", [id])
        row_ids = cursor.column_names
        row_raw = cursor.fetchone()
        if row_raw == None:
            return None
        row = dict(zip(row_ids, row_raw))
        self.db_targets[id] = row
        cursor.close()
        return self.db_targets[id]

