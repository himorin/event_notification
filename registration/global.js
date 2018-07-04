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
    show_handler(response);
    ret_hash[target] = response;
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
  document.querySelector('#return_t_id').innerText = json.id;
  document.querySelector('#return_t_uname').innerText = json.uname;
  document.querySelector('#return_t_category').innerText = json.category;
  document.querySelector('#return_t_pid').innerText = json.pid;
  document.querySelector('#return_t_param').innerText = json.param;
  document.querySelector('#return_t_description').innerText = json.description;
}

function ShowNotice(json) {
  document.getElementById('return_n_id').innerText = json.id;
  document.getElementById('return_n_sid').innerText = json.sid;
  document.getElementById('return_n_fired').innerText = json.fired;
  document.getElementById('return_n_target').innerText = json.target;
  document.getElementById('return_n_content').innerText = json.content;
  document.getElementById('return_n_tid').innerText = json.tid;
  document.getElementById('return_n_source').innerText = json.source;
  document.getElementById('return_n_url').innerText = json.url;
  document.getElementById('return_n_description').innerText = json.description;
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

function LogDeletedNotice(json) {
  ShowError('Notices ID ' + json.delete_id + ' deleted');
}

function LogDeletedTarget(json) {
  ShowError('Targets ID ' + json.delete_id + ' deleted');
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

  document.querySelector('#input_clear').addEventListener('click',
    function (e) {
      document.getElementById('return_error').innerHTML = ""; }, false);

  navigator.serviceWorker.register('sw.js').then(() => {});
  Notification.requestPermission(state => {
    if (state === 'granted') {
    }
  });
  navigator.serviceWorker.ready.then(registration => {
    return registration.pushManager.subscribe({
      userVisibleOnly: true
    }).then(subscription => {
      console.log(subscription.endpoint);
      console.log(subscription.getKey('p256dh'));
      console.log(subscription.getKey('auth'));
      if ('supportedContentEncodings' in PushManager) {
        console.log(PushManager.supportedContentEncodings.includes('aes128gcm') ? 'aes128gcm' : 'aesgcm');
      }
    });
  });
});

