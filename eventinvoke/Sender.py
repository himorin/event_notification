#! /usr/bin/env python3

from twilio.rest import Client
from pywebpush import webpush, WebPushException
import json

class Sender:

    twilio_client = None

    def InitTwilio(self, conf):
        if self.twilio_client != None:
            return self.twilio_client
        self.twilio_client = Client(conf['twilio_account'], 
            conf['twilio_token'])

    def SendSMS(self, notice, target, conf):
        ret = {}
        self.InitTwilio(conf)
        call = self.twilio_client.messages.create(to = target['pid'], 
            from_ = conf['twilio_num'], 
            body = "{} {}".format(conf['twilio_smshead'], notice['content']))
        ret['sid'] = call.sid
        ret['error'] = call.error_code
        ret['status'] = call.status
        return ret
    
    def SendPhone(self, notice, target, conf):
        ret = {}
        self.InitTwilio(conf)
        call = self.twilio_client.calls.create(to = target['pid'], 
            from_ = conf['twilio_num'], url = conf['twilio_url'])
        ret['sid'] = call.sid
        ret['error'] = call.error_code
        ret['status'] = call.status
        return ret

    def GetStatus(self, sid, conf):
        self.InitTwilio(conf)
        ret = {}
        mess = self.twilio_client.messages(sid).fetch()
        ret['sid'] = sid
        ret['error'] = mess.error_code
        ret['status'] = mess.status
        return ret

    def SendWebPush(self, notice, target, conf):
        vapid = target['param'].split(" / ")
        send_dat = {
            'title': conf['webpush_title'],
            'icon': conf['webpush_icon'],
            'body': notice['content'],
            'url': notice['url'],
            'tag': "notification-{}".format(notice['id']),
            'vibrate': [200, 100, 200],
        }
        ret = {}
        try:
            webpush(
                subscription_info = {
                    "endpoint": target['pid'],
                    "keys": {
                        "p256dh": vapid[0],
                        "auth": vapid[1]
                    }},
                data = json.dumps(send_dat),
                vapid_private_key = conf['vapid_private'],
                vapid_claims = {
                    "sub": conf['vapid_mailto'],
                }
            )
            ret['sid'] = send_dat['tag']
            ret['status'] = "ok"
        except WebPushException as e:
            print("WebPush Error: {}", repr(e))
            if e.response and e.response.json():
                err_ext = e.response.json()
                print("Error details: {}:{} {}".format(err_ext.code, 
                    err_ext.errno, err_ext.message))
            ret['error'] = err_ext.code
            ret['status'] = 'error'
        return ret

