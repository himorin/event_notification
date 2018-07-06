var api_head = "json.cgi/";

var ret_hash = {};

function ShowError (str) {
  document.getElementById('return_error').innerHTML += "<br>" + str;
}

function GetJsonForId (target, id, show_handler) {
  fetch(api_head + target + '/' + String(parseInt(id)), {
    cache: 'no-cache', credentials: 'same-origin',
    method: 'GET', redirect: 'follow' })
  .then(function(response) {
    if (response.ok) {return response.json(); }
    throw Error("Returned response " + response.status);
  }).then(function(response) {
    show_handler(response);
  }).catch(function(error) {
    ShowError("Error ocured: " + error.message);
  });
}

function GetJsonForAll (target, show_handler) {
  fetch(api_head + target, {
    cache: 'no-cache', credentials: 'same-origin',
    method: 'GET', redirect: 'follow' })
  .then(function(response) {
    if (response.ok) {return response.json(); }
    throw Error("Returned response " + response.status);
  }).then(function(response) {
    ret_hash[target] = response;
    show_handler(response);
  }).catch(function(error) {
    ShowError("Error occured: " + error.message);
  });
}

function PostJson (target, obj_handler, show_handler) {
  fetch(api_head + target, {
    body: JSON.stringify(obj_handler()),
    headers: new Headers({
      'Content-Type': 'application/json'
    }),
    cache: 'no-cache', credentials: 'same-origin',
    method: 'POST', redirect: 'follow' })
  .then(function(response) {
    if (response.ok) {return response.json(); }
    throw Error("Returned response " + response.status);
  }).then(function(response) {
    show_handler(response);
  }).catch(function(error) {
    ShowError("Error ocured: " + error.message);
  });
}

function DeleteJson (target, id, show_handler) {
  fetch(api_head + target + '/' + String(parseInt(id)), {
    cache: 'no-cache', credentials: 'same-origin',
    method: 'DELETE', redirect: 'follow' })
  .then(function(response) {
    if (response.ok) {return response.json(); }
    throw Error("Returned response " + response.status);
  }).then(function(response) {
    show_handler(response);
  }).catch(function(error) {
    ShowError("Error ocured: " + error.message);
  });
}

function ShowTarget(json) {
  var list = [ 'id', 'uname', 'category', 'pid', 'param', 'description' ];
  list.forEach(function(elem) {
    document.querySelector('#return_t_' + elem).innerText = json[elem]; }, false);
}

function ShowScheme(json) {
  var list = [ 'id', 'uname', 'content', 'exec_cond', 'minutes', 
    'tid', 'description' ];
  list.forEach(function(elem) {
    document.querySelector('#return_s_' + elem).innerText = json[elem]; }, false);
}

function ShowNotice(json) {
  var list = [ 'id', 'sid', 'fired', 'target', 'content', 'tid', 'source', 
    'url', 'description' ];
  list.forEach(function(elem) {
    document.querySelector('#return_n_' + elem).innerText = json[elem]; }, false);
}

function ShowNoticeList(json) {
  var out = '';
  var elist = [];
  Object.keys(json).forEach(function(elem) {
    var cur = "<a class=\"fired_" + this[elem].fired + "\" ";
    cur += "id=\"notice_list_" + this[elem].id + "\">" + this[elem].id + "</a>";
    if (out != '') {out += ", "; }
    out += cur;
    elist.push(this[elem].id);
  }, json);
  document.querySelector('#ret_notices').innerHTML = out;
  elist.forEach(function(id) {
    document.querySelector('#notice_list_' + id).addEventListener('click', 
      function (e) {ShowNotice(ret_hash.notices[id]); }, false); });
}

function ShowTargetList (json) {
  var out = '';
  var elist = [];
  Object.keys(json).forEach(function(elem) {
    var cur = "<a class=\"tcat_" + this[elem].category + "\" ";
    cur += "id=\"target_list_" + this[elem].id + "\">" + this[elem].id + "</a>";
    if (out != '') {out += ", "; }
    out += cur;
    elist.push(this[elem].id);
  }, json);
  document.querySelector('#ret_targets').innerHTML = out;
  elist.forEach(function(id) {
    document.querySelector('#target_list_' + id).addEventListener('click', 
      function (e) {ShowTarget(ret_hash.targets[id]); }, false); });
}

function ShowSchemeList (json) {
  var out = '';
  var elist = [];
  Object.keys(json).forEach(function(elem) {
    var cur = "<a id=\"scheme_list_" + this[elem].id + "\">" + this[elem].id + "</a>";
    if (out != '') {out += ", "; }
    out += cur;
    elist.push(this[elem].id);
  }, json);
  document.querySelector('#ret_schemes').innerHTML = out;
  elist.forEach(function(id) {
    document.querySelector('#scheme_list_' + id).addEventListener('click', 
      function (e) {ShowScheme(ret_hash.schemes[id]); }, false); });
}

function LogDeletedNotice(json) {
  ShowError('Notices ID ' + json.delete_id + ' deleted');
}

function LogDeletedTarget(json) {
  ShowError('Targets ID ' + json.delete_id + ' deleted');
}

function LogDeletedScheme(json) {
  ShowError('Scheme ID ' + json.delete_id + ' deleted');
}

function GetInputNotice () {
  var data = {};
  var list = [ 'target', 'content', 'tid', 'source', 'url', 'description' ];
  list.forEach(function(id) {
    var cdata = document.querySelector('#input_n_' + id).value;
    if (cdata != '') {data[id] = cdata; } }, false);
  return data;
}

function GetInputTarget () {
  var data = {};
  var list = [ 'category', 'pid', 'param', 'description' ];
  list.forEach(function(id) {
    var cdata = document.querySelector('#input_t_' + id).value;
    if (cdata != '') {data[id] = cdata; } }, false);
  return data;
}

function GetInputScheme () {
  var data = {};
  var list = [ 'content', 'exec_cond', 'minutes', 'tid', 'description' ];
  list.forEach(function(id) {
    var cdata = document.querySelector('#input_s_' + id).value;
    if (cdata != '') {data[id] = cdata; } }, false);
  return data;
}

function B64URL (data) {
  return btoa(String.fromCharCode.apply(null, new Uint8Array(data)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function ShowNotification(json) {
  document.querySelector('#return_push').innerHTML = 
    "Target ID: " + json.id + " as \"" + json.description + "\"";
  document.querySelector('#input_push_enable').value = "WebPush Enabled, click to update description of this browser";
}

function GotVapidKey() {
  if (Notification.permission == 'granted') {
    // already granted, show notification configuration
    EnableNotification();
  }
}

function EnableNotification() {
  Notification.requestPermission(state => {
    if (state === 'granted') {
      navigator.serviceWorker.register('sw.js').then(() => {});
      navigator.serviceWorker.ready.then(registration => {
        var pmopt = { userVisibleOnly: true };
        if ('supportedContentEncodings' in PushManager) {
          pmopt.applicationServerKey = 
            Uint8Array.from(atob(ret_hash.vapid.vapid_public), 
              c => c.charCodeAt(0));
        }
        return registration.pushManager.subscribe(pmopt).then(subscription => {
          var data = {};
          data.category = 'webpush';
          data.pid = subscription.endpoint;
          data.param = B64URL(subscription.getKey('p256dh')) 
            + ' / ' + B64URL(subscription.getKey('auth')) + ' / ';
          if ('supportedContentEncodings' in PushManager) {
            data.param += PushManager.supportedContentEncodings.includes(
              'aes128gcm') ? 'aes128gcm' : 'aesgcm';
          } else {data.param += 'aesgcm'}; 
          data.description = document.querySelector('#input_push').value;
          PostJson('targets', function (e) {return data}, ShowNotification);
        });
      });
    }
  });
}

window.addEventListener('load', function(event) {
  document.querySelector('#input_n_get').addEventListener('click',
    function (e) {
      GetJsonForId('notices', document.getElementById('input_n_id').value, 
        ShowNotice); }, false);
  document.querySelector('#input_n_post').addEventListener('click',
    function (e) {
      PostJson('notices', GetInputNotice, ShowNotice); }, false);
  document.querySelector('#input_n_delete').addEventListener('click',
    function (e) {
      DeleteJson('notices', document.getElementById('input_n_id').value, 
        LogDeletedNotice); }, false); 
  document.querySelector('#input_n_getall').addEventListener('click',
    function (e) {
      GetJsonForAll('notices', ShowNoticeList); }, false);

  document.querySelector('#input_t_get').addEventListener('click',
    function (e) {
      GetJsonForId('targets', document.getElementById('input_t_id').value, 
        ShowTarget); }, false);
  document.querySelector('#input_t_post').addEventListener('click',
    function (e) {
      PostJson('targets', GetInputTarget, ShowTarget); }, false);
  document.querySelector('#input_t_delete').addEventListener('click',
    function (e) {
      DeleteJson('targets', document.getElementById('input_t_id').value, 
        LogDeletedTarget); }, false); 
  document.querySelector('#input_t_getall').addEventListener('click',
    function (e) {
      GetJsonForAll('targets', ShowTargetList); }, false);

  document.querySelector('#input_s_get').addEventListener('click',
    function (e) {
      GetJsonForId('schemes', document.getElementById('input_s_id').value, 
        ShowScheme); }, false);
  document.querySelector('#input_s_post').addEventListener('click',
    function (e) {
      PostJson('schemes', GetInputScheme, ShowScheme); }, false);
  document.querySelector('#input_s_delete').addEventListener('click',
    function (e) {
      DeleteJson('schemes', document.getElementById('input_s_id').value, 
        LogDeletedScheme); }, false); 
  document.querySelector('#input_s_getall').addEventListener('click',
    function (e) {
      GetJsonForAll('schemes', ShowSchemeList); }, false);

  document.querySelector('#input_clear').addEventListener('click',
    function (e) {
      document.getElementById('return_error').innerHTML = ""; }, false);

  GetJsonForAll('vapid', GotVapidKey);
  document.querySelector('#input_push_enable').addEventListener('click',
    function (e) {EnableNotification(); }, false);

});

