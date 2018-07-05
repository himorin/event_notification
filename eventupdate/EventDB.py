#! /usr/bin/env python3

import sys

import mysql.connector
from mysql.connector import errorcode

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

    def ListSchemes(self, summary):
        cursor = self._get_new_cursor()
        cursor.execute("SELECT * FROM schemes WHERE %s LIKE exec_cond",
            [summary])
        row_ids = cursor.column_names
        ret = {}
        for row_raw in cursor:
            row = dict(zip(row_ids, row_raw))
            ret[row['id']] = row
        cursor.close()
        return ret

    def ListNoticesBySource(self, source):
        cursor = self._get_new_cursor()
        cursor.execute("SELECT * FROM schemes WHERE source = %s AND fired = 0",
            [source])
        row_ids = cursor.column_names
        ret = {}
        for row_raw in cursor:
            row = dict(zip(row_ids, row_raw))
            ret[row['id']] = row
        cursor.close()
        return ret

    def CancelNotice(self, id):
        cursor = self._get_new_cursor()
        cursor.execute("UPDATE notices SET fired = 2 WHERE id = %s", [id])
        self.cnx.commit()
        if cursor.rowcount != 1:
            print("Delete failed {}".format(id))
            cursor.close()
            return None
        cursor.close()
        return id

    def AddNotice(self, val):
        cursor = self._get_new_cursor()
        cursor.execute("INSERT INTO notices (target, content, tid, source, url, description) VALUES (FROM_UNIXTIME(%s), %s, %s, %s, %s, %s)",
            [val['target'], val['content'], val['tid'], val['source'], 
            val['url'], val['description']])
        self.cnx.commit()
        if cursor.rowcount != 1:
            print("Add new notice failed")
            cursor.close()
            return None
        lid = cursor.lastrowid
        cursor.close()
        return lid

