var api_head = "json.cgi/";

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

window.addEventListener('load', function(event) {
  document.querySelector('#input_get').addEventListener('click', function (e) {
    GetJsonForId('notices', document.getElementById('input_id').value, 
      ShowNotice); }, false);
});

