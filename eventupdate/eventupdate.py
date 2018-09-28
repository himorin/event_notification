#! /usr/bin/env python3

from apiclient.discovery import build
from httplib2 import Http
from oauth2client import file, client, tools
import datetime
import json

import EventDB

DEF_CONF_NAME = "../common/siteconfig.json"
DEF_SCOPES = 'https://www.googleapis.com/auth/calendar.readonly'

site_config = {}

def LoadConfig():
    try:
        fjson = open(DEF_CONF_NAME, 'r')
    except IOError as e:
        raise Exception("File '%s' open error: %s" % (DEF_CONF_NAME, e))
    try:
        site_config = json.load(fjson)
    except:
        raise Exception("json format parse error for '%s'" % (DEF_CONF_NAME))
    return site_config

def ListUpdatedEvents(site_config):
    store = file.Storage("../common/{}".format(site_config['googleapi_cred']))
    creds = store.get()
    if not creds or creds.invalid:
        flow = client.flow_from_clientsecrets(
            "../common/{}".format(site_config['googleapi_secret']), DEF_SCOPES)
        creds = tools.run_flow(flow, store)
    service = build('calendar', 'v3', http=creds.authorize(Http()))

    now = datetime.datetime.utcnow().isoformat() + 'Z'
    res = service.events().list(calendarId = site_config['googleapi_calid'],
        timeMin = now, singleEvents = True, orderBy = 'startTime').execute()
    events = res.get('items', [])
    founds = {}
    ev_from = datetime.datetime.utcnow() - datetime.timedelta(
        hours = site_config['update_interval'])
    if not events:
        return None
    for event in events:
        start = event['start'].get('dateTime', event['start'].get('date'))
        found = {}
        found['start'] = start
        found['url'] = event.get('location', '')
        found['id'] = event.get('id', 'nullid@ical')
        found['summary'] = event.get('summary', '')
        found['icaluid'] = event.get('iCalUID', 'nulluuid@ical')
        found['updated'] = event['updated']
        ev_update = datetime.datetime.strptime(found['updated'], 
            '%Y-%m-%dT%H:%M:%S.%fZ')
        if ev_update > ev_from:
            founds[found['id']] = found
    return founds

def StringDT(str, minus):
    ret = datetime.datetime.utcnow()
    fmt = '%Y-%m-%dT%H:%M:%S'
    if str[19] == '.':
      fmt += '.%f'
    if str[-1] == 'Z':
        ret = datetime.datetime.strptime(str, fmt + 'Z')
    elif str[-5] == '+' or str[-5] == '-':
        ret = datetime.datetime.strptime(str, fmt + '%z')
    elif (str[-6] == '+' or str[-6] == '-') and (str[-3] == ':'):
        val = str[0:-3] + str[-2:]
        ret = datetime.datetime.strptime(val, fmt + '%z')
    ret -= datetime.timedelta(minutes = minus)
    return (ret - ret.utcoffset())

if __name__ == "__main__":
    site_config = LoadConfig()
    events = ListUpdatedEvents(site_config)
    if events == None:
        print("No upcoming event found")
        exit
    dbh = EventDB.EventDB()
    dbh.Connect(site_config)
    for id in events.keys():
        event = events[id]
        if event['summary'].find('cancel') > -1:
            notices = dbh.ListNoticesBySource(event['icaluid'])
            for notice in notices.keys():
                dbh.CancelNotice(notice)
        else:
            add_new = dbh.ListSchemes(event['summary'])
            for add in add_new.keys():
                fire = StringDT(event['start'], add_new[add]['minutes'])
                val = {
                    'target': fire.timestamp(),
                    'content': add_new[add]['content'],
                    'tid': add_new[add]['tid'],
                    'source': event['icaluid'],
                    'url': event['url'],
                    'description': event['summary']
                }
                print("Added {}".format(dbh.AddNotice(val)))
    dbh.Close()


