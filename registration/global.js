var api_head = "json.cgi/";

var ret_hash = {};
var cur_n_target = "queued";
var tid_select = ['input_n_tid', 'input_s_tid'];
var targets_cg = ['sms', 'phone', 'email', 'webpush'];
var list_actions = ['notices', 'targets', 'schemes'];

var n_fired_icon = {
  0: { 'title': 'notification queued', 'icon': 'schedule' },
  1: { 'title': 'notification fired', 'icon': 'done' },
  2: { 'title': 'notification deleted', 'icon': 'remove_circle_outline' },
  3: { 'title': 'notification marked as invalid', 'icon': 'pause_circle_outline' },
  4: { 'title': 'notification error after execution', 'icon': 'report_problem' },
  5: { 'title': 'notification in execution', 'icon': 'call' },
};

function ShowError (str) {
  console.log(str);
}
function ValToStr (val) {
  if (val === null) {return "(not supplied)"; }
  return val;
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

function GetJsonForAll (target, show_handler, opt) {
  var url = api_head + target;
  if ((target == 'notices') && (opt != null)) {url += '?state=' + opt; }
  fetch(url, {
    cache: 'no-cache', credentials: 'same-origin',
    method: 'GET', redirect: 'follow' })
  .then(function(response) {
    if (response.ok) {return response.json(); }
    if (response.status == 404) {return {}; }
    throw Error("Returned response " + response.status);
  }).then(function(response) {
    ret_hash[target] = response;
    if (list_actions.includes(target)) {
      document.querySelector('#input_' + target + '_count').innerText = 
        Object.keys(response).length;
    }
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

function ShowNotice(json) {
  document.querySelector("#n_list").innerHTML += GetNoticeLine(json);
  AddFormShow('close');
}
function ShowNoticeList(json) {
  document.querySelector("#n_list").innerHTML = "";
  Object.keys(json).forEach(function(elem) {
    document.querySelector("#n_list").innerHTML += GetNoticeLine(json[elem]);
  }, json);
}
function GetNoticeLine (elem) {
  var cur = "<tr id=\"n_tr_" + elem.id + "\" class=\"fired_" + elem.fired + "\">";
  cur += "<td>";
  cur += "<input type=\"checkbox\" name=\"notices_select\" value=\"" + elem.id + "\" class=\"notices_select\">";
  cur += "<span class=\"mi_inline\" title=\"" + n_fired_icon[elem.fired].title + "\"><i class=\"material-icons\">" + n_fired_icon[elem.fired].icon + "</i></span>";
  cur += "</td>";
  cur += "<td>" + elem.target + "</td>";
  cur += "<td>" + GetTargetShort(elem.tid) + "</td>";
  cur += "<td>" + elem.content + "</td>";
  cur += "<td>" + ValToStr(elem.description) + "</td>";
  cur += "</tr>";
  return cur;
}

function ShowTarget(json) {
  document.querySelector("#t_list").innerHTML += GetTargetLine(json);
  AddFormShow('close');
}
function ShowTargetList (json) {
  document.querySelector("#t_list").innerHTML = "";
  Object.keys(json).forEach(function(elem) {
    document.querySelector("#t_list").innerHTML += GetTargetLine(json[elem]);
  }, json);
  UpdateTidSelectAll();
}

function GetTargetLine (elem) {
  var cur = "<tr id=\"t_tr_" + elem.id + "\">";
  cur += "<td><input type=\"checkbox\" name=\"targets_select\" value=\"" + elem.id + "\" class=\"targets_select\"></td>";
  cur += "<td>" + elem.category + "</td>";
  cur += "<td>" + ValToStr(GetTargetLabel(elem)) + "</td>";
  cur += "<td>" + ValToStr(GetTargetDescription(elem)) + "</td>";
  cur += "</tr>";
  return cur;
}
function GetTargetLabel (elem) {
  if (elem.category == "webpush") {return elem.description; }
  else if (["sms", "phone", "email"].includes(elem.category)) {return elem.pid; }
  return "";
}
function GetTargetDescription (elem) {
  if (elem.category == "webpush") {return "(push notification)"; }
  else if (["sms", "phone", "email"].includes(elem.category)) {return elem.description; }
  return "";
}
function GetTargetShort (id) {
  if (ret_hash['targets'] == null) {return "(loading...)"; }
  var elem = ret_hash['targets'][id];
  if (elem == null) {return ""; }
  return elem.category + ": " + GetTargetLabel(elem);
}
function UpdateTidSelectAll () {
  tid_select.forEach(function (item) {UpdateTidSelect(item); }, false);
}
function UpdateTidSelect (target) {
  var cn;
  var tcn = document.querySelector('#' + target);
  while ((cn = tcn.firstChild) != null) {tcn.removeChild(cn); }
  targets_cg.forEach(function (item) {
    var og = document.createElement('optgroup');
    og.setAttribute('label', item);
    og.setAttribute('id', target + '_og_' + item);
    og.innerHTML = item;
    tcn.appendChild(og);
  }, false);
  Object.keys(ret_hash['targets']).forEach(function (id) {
    var opt = document.createElement('option');
    opt.setAttribute('value', id);
    opt.innerHTML = GetTargetShort(id);
    if (targets_cg.includes(ret_hash['targets'][id]['category'])) {
      document.querySelector('#' + target + '_og_' + ret_hash['targets'][id]['category']).appendChild(opt);
    } else {
      tcn.appendChild(opt);
    }
  }, false);
}

function ShowScheme (json) {
  document.querySelector("#s_list").innerHTML += GetSchemeLine(json);
  AddFormShow('close');
}
function ShowSchemeList (json) {
  document.querySelector("#s_list").innerHTML = "";
  Object.keys(json).forEach(function(elem) {
    document.querySelector("#s_list").innerHTML += GetSchemeLine(json[elem]);
  }, false);
}
function GetSchemeLine (elem) {
  var cur = "<tr id=\"s_tr_" + elem.id + "\">";
  cur += "<td><input type=\"checkbox\" name=\"schemes_select\" value=\"" + elem.id + "\" class=\"schemes_select\"></td>";
  cur += "<td>" + elem.exec_cond + "</td>";
  cur += "<td>" + GetTargetShort(elem.tid) + "</td>";
  cur += "<td>" + elem.minutes + "</td>";
  cur += "<td>" + elem.content + "</td>";
  cur += "<td>" + ValToStr(elem.description) + "</td>";
  cur += "</tr>";
  return cur;
}

function LogDeletedNotice(json) {
  ShowError('Notices ID ' + json.delete_id + ' deleted');
}

function LogDeletedScheme(json) {
  ShowError('Scheme ID ' + json.delete_id + ' deleted');
}

function GetInputNotice () {
  var data = {};
  var list = [ 'content', 'tid', 'source', 'url', 'description' ];
  list.forEach(function(id) {
    var cdata = document.querySelector('#input_n_' + id).value;
    if (cdata != '') {data[id] = cdata; } }, false);
  data['target'] = document.querySelector('#input_n_targets_date').value + 'T' +
    document.querySelector('#input_n_targets_time').value + ':00.000Z';
  return data;
}

function GetInputTarget () {
  var data = {};
  var list = [ 'category', 'pid', 'description' ];
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
  document.querySelector('#return_push').innerText = json.description;
  document.querySelector("#info_push").style.display = "inline";
  document.querySelector('#input_push_enable').value = "update its name";
  document.querySelector("#input_push").value = json.description;
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

function ContentsShow(name) {
  var list = ['list', 'target', 'settings', 'help'];
  list.forEach(function (name) {
    document.querySelector('#content_' + name).style.display = 'none';
  }, false);
  if (list.includes(name)) {
    document.querySelector('#content_' + name).style.display = 'block';
    window.location.hash = name;
  }
}
function AddFormShow(name) {
  var list = ['notices', 'targets', 'schemes'];
  list.forEach(function (name) {
    document.querySelector('#form_' + name).style.display = 'none';
  }, false);
  if (list.includes(name)) {
    document.querySelector('#form_' + name).style.display = 'block';
    document.querySelector('#content_info').style.display = 'block';
  } else if (name == 'close') {
    document.querySelector('#content_info').style.display = 'none';
    document.querySelector('#content_form').reset();
  }
}

function DeleteItems (cat) {
  if (! list_actions.includes(cat)) {return ;}
  var inputs = document.querySelectorAll("." + cat + "_select:checked");
  inputs.forEach(function (elem) {
    DeleteJson(cat, elem.value, LogDeletedNotice);
  }, false);
  document.querySelector("#input_" + cat + "_getall").click();
}
function SwitchNoticesTarget(opt) {
  document.querySelector('#input_n_show_' + cur_n_target).classList.remove("show_on");
  cur_n_target = opt;
  document.querySelector('#input_n_show_' + cur_n_target).classList.add("show_on");
}

function DateTimeLocal () {
  var idt = document.querySelector('#input_n_targets_date').value + 'T' +
    document.querySelector('#input_n_targets_time').value + ':00.000Z';
  var idtd = new Date(idt);
  document.querySelector('#input_n_target').innerText = idtd.toString();
}

window.addEventListener('load', function(event) {
  document.querySelector('#input_notices_post').addEventListener('click',
    function (e) {
      PostJson('notices', GetInputNotice, ShowNotice); }, false);
  document.querySelector('#input_notices_getall').addEventListener('click',
    function (e) {
      GetJsonForAll('notices', ShowNoticeList); }, false);

  document.querySelector('#input_targets_post').addEventListener('click',
    function (e) {
      PostJson('targets', GetInputTarget, ShowTarget); }, false);
  document.querySelector('#input_targets_getall').addEventListener('click',
    function (e) {
      GetJsonForAll('targets', ShowTargetList); }, false);

  document.querySelector('#input_schemes_post').addEventListener('click',
    function (e) {
      PostJson('schemes', GetInputScheme, ShowScheme); }, false);
  document.querySelector('#input_schemes_getall').addEventListener('click',
    function (e) {
      GetJsonForAll('schemes', ShowSchemeList); }, false);

/* showadd/close */
  ['notices', 'targets', 'schemes'].forEach(function(id) {
    document.querySelector('#input_' + id + '_showadd').addEventListener('click',
      function (e) {AddFormShow(id); }, false);
    document.querySelector('#input_' + id + '_close').addEventListener('click',
      function (e) {AddFormShow('close'); }, false);
    document.querySelector('#input_' + id + '_delete').addEventListener('click',
      function (e) {DeleteItems(id); }, false);
  }, false);

  GetJsonForAll('vapid', GotVapidKey);
  document.querySelector('#input_push_enable').addEventListener('click',
    function (e) {EnableNotification(); }, false);

  document.querySelector('#input_n_targets_date').addEventListener('change',
    function (e) {DateTimeLocal(); }, false);
  document.querySelector('#input_n_targets_time').addEventListener('change',
    function (e) {DateTimeLocal(); }, false);

  ['all', 'queued', 'fired', 'deleted', 'invalid', 'error', 'pushed'].forEach(
    function (id) {
      document.querySelector('#input_n_show_' + id).addEventListener('click',
        function (e) {
          GetJsonForAll('notices', ShowNoticeList, id);
          SwitchNoticesTarget(id);
        }, false);
    }, false);

  // init data
  GetJsonForAll('targets', ShowTargetList);
  // menu
  var menu_list = ['list', 'add', 'target', 'settings', 'help'];
  document.querySelector('#menu_list').addEventListener('click',
    function (e) {
      GetJsonForAll('notices', ShowNoticeList);
      ContentsShow('list');
    }, false);
  document.querySelector('#menu_target').addEventListener('click',
    function (e) {
      GetJsonForAll('targets', ShowTargetList);
      GetJsonForAll('schemes', ShowSchemeList);
      ContentsShow('target');
    }, false);
  document.querySelector('#menu_settings').addEventListener('click',
    function (e) {ContentsShow('settings'); }, false);
  document.querySelector('#menu_help').addEventListener('click',
    function (e) {ContentsShow('help'); }, false);
  var url_hash = window.location.hash.substr(1);
  if (menu_list.includes(url_hash)) {
    document.querySelector("#menu_" + url_hash).click();
  } else {
    document.querySelector("#menu_list").click();
  }

  document.querySelector('#info_front').addEventListener('click', 
    function (e) {e.stopPropagation(); }, false);
  document.querySelector('#info_back').addEventListener('click',
    function (e) {AddFormShow('close'); }, false);

});

