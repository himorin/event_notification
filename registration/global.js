var api_head = "json.cgi/";
var api_target = "notices";

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
  document.getElementById('return_id').innerText = json.id;
  document.getElementById('return_sid').innerText = json.sid;
  document.getElementById('return_fired').innerText = json.fired;
  document.getElementById('return_target').innerText = json.target;
  document.getElementById('return_content').innerText = json.content;
  document.getElementById('return_tid').innerText = json.tid;
  document.getElementById('return_source').innerText = json.source;
  document.getElementById('return_url').innerText = json.url;
  document.getElementById('return_description').innerText = json.description;
}

function LogDeletedNotice(json) {
  ShowError('Notices ID ' + json.delete_id + ' deleted');
}

function GetInputNotice () {
  var data = {};
  var list = [ 'target', 'content', 'tid', 'source', 'url', 'description' ];
  if (document.querySelector('#input_target').value !== null) 
    { data.target = document.querySelector('#input_target').value; }
  if (document.querySelector('#input_content').value !== null) 
    { data.content = document.querySelector('#input_content').value; }
  if (document.querySelector('#input_tid').value !== null) 
    { data.tid = document.querySelector('#input_tid').value; }
  if (document.querySelector('#input_source').value !== null) 
    { data.source = document.querySelector('#input_source').value; }
  if (document.querySelector('#input_url').value !== null) 
    { data.url = document.querySelector('#input_url').value; }
  if (document.querySelector('#input_description').value !== null) 
    { data.description = document.querySelector('#input_description').value; }
  return data;
}

window.addEventListener('load', function(event) {
  document.querySelector('#input_get').addEventListener('click', function (e) {
    GetJsonForId(api_target, document.getElementById('input_id').value, 
      ShowNotice); }, false);
  document.querySelector('#input_post').addEventListener('click', function (e) {
    PostJson(api_target, GetInputNotice, ShowNotice); }, false);
  document.querySelector('#input_delete').addEventListener('click', function (e) {
    DeleteJson(api_target, document.getElementById('input_id').value, 
      LogDeletedNotice); }, false); 
  document.querySelector('#input_clear').addEventListener('click', function (e) {
    document.getElementById('return_error').innerHTML = ""; }, false);
});

