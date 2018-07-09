#! /usr/bin/env python3

import sys
import json

import time

import EventDB
import Sender

DEF_CONF_NAME = "../common/siteconfig.json"

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


if __name__ == "__main__":
    site_config = LoadConfig()
    dbh = EventDB.EventDB()
    dbh.Connect(site_config)
    notices = dbh.ListNotices(site_config['invoke_interval'])
    send = Sender.Sender()
    notices_ret = {}
    for id in notices.keys():
        target = dbh.GetTargetInfo(notices[id]['tid'])
        if target['category'] == 'webpush':
            ret = send.SendWebPush(notices[id], target, site_config)
        elif target['category'] == 'sms':
            ret = send.SendSMS(notices[id], target, site_config)
        elif target['category'] == 'phone':
            ret = send.SendPhone(notices[id], target, site_config)
        elif target['category'] == 'email':
            ret = send.SendEmail(notices[id], target, site_config)
        else:
            continue
        ret['tid'] = notices[id]['tid']
        notices_ret[id] = ret
        if 'error' in ret and ret['error'] != None:
            dbh.UpdateNoticeError(id, "{} {}".format(ret['error'], ret['status']))
        else:
            if ret['status'].lower() == 'delivered':
                dbh.UpdateNoticeSuccess(id, ret['sid'])
            else:
                dbh.UpdateNoticePushed(id, ret['sid'])
    time.sleep(10)
    for id in notices_ret.keys():
        target = dbh.GetTargetInfo(notices_ret[id]['tid'])
        if target['category'] == 'sms':
            ret = send.GetSMSStatus(notices_ret[id]['sid'], site_config)
            if 'error' in ret and ret['error'] != None:
                dbh.UpdateNoticeError(id,
                    "{} {}".format(ret['error'], ret['status']))
            else:
                if ret['status'] == 'delivered':
                    dbh.UpdateNoticeSuccess(id, ret['sid'])
    dbh.Close()

