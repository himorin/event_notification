#! /usr/bin/perl

use strict;
use lib '.';

use JSON;

use PNAPI::Constants;
use PNAPI::Config;
use PNAPI::CGI;

use PNAPI::Notices;
use PNAPI::Targets;
use PNAPI::Schemes;

my $obj_cgi = new PNAPI::CGI();
my $obj_config = new PNAPI::Config();

my $input_method = uc($ENV{'REQUEST_METHOD'});
my $input_cmd = $obj_cgi->path_info();
my $input_data = $obj_cgi->param('POSTDATA');

if (substr($input_cmd, 0, 1) eq '/') {$input_cmd = substr($input_cmd, 1); }
my @input_cmds = split(/\//, $input_cmd);
if ($#input_cmds < 0) {&_error_invarg('Target missing'); }
my $input_hash;
if ($input_method eq 'POST') {
  $input_hash = from_json($input_data);
}

# start processing
my $outdata = {};

# TEST
$outdata->{cmd} = $input_cmd;
$outdata->{data} = $input_data;

# just do nothing if argument not match with predefined
my $cuser = $ENV{'REMOTE_USER'};
my $obj_handler;
my $cmd_opt = {};
if ($input_cmds[0] eq 'notices') {
  $obj_handler = new PNAPI::Notices();
  if (($input_method eq 'GET') && ($#input_cmds == 0)) {
    $cmd_opt->{state} = &_param('state', 'queued');
  }
} elsif ($input_cmds[0] eq 'targets') {
  $obj_handler = new PNAPI::Targets();
} elsif ($input_cmds[0] eq 'schemes') {
  $obj_handler = new PNAPI::Schemes();
} elsif ($input_cmds[0] eq 'vapid') {
  $outdata->{vapid_public} = $obj_config->get('vapid_public');
  print $obj_cgi->header(200);
  print to_json( $outdata );
  exit;
} else {
  &_error_invarg("Target \"$input_cmds[0]\" not defined");
}

my $is_done = FALSE;
my $ret_err = undef;
my $is_id = 0;
if ($input_method eq 'GET') {
  if ($#input_cmds == 1) {
    $outdata = $obj_handler->get($input_cmds[1]);
    if (defined($outdata)) {$is_done = TRUE; }
    else {$ret_err = "ID not found"; }
} elsif ($#input_cmds == 0) {
    if (defined(my $uname = &_param('username', $cuser))) {
      $outdata = $obj_handler->search($uname, $cmd_opt);
      if (defined($outdata)) {$is_done = TRUE; }
      else {&_error_invarg("No item found"); }
    }
  }
} elsif ($input_method eq 'POST') {
  $is_id = $obj_handler->add($cuser, $input_hash);
  if (defined($is_id)) {&_return_redirect($input_cmds[0], $is_id); }
} elsif ($input_method eq 'DELETE') {
  if ($#input_cmds == 1) {
    $is_id = $obj_handler->del($cuser, $input_cmds[1]);
    if (defined($is_id)) {
      $is_done = TRUE;
      $outdata->{delete_id} = $is_id;
    }
  }
}



if (! $is_done) {
  if (defined($ret_err)) {&_error_invarg($ret_err); }
  &_error_invarg("Invalid arguments were supplied for target \"$input_cmds[0]\".");
}

# start reply
print $obj_cgi->header(200);
print to_json( $outdata );

exit;

sub _error_invarg {
  my ($desc) = @_;
  print $obj_cgi->header(404);
  print to_json( { 'error' => 'Invalid argument',
                   'description' => $desc } );
  exit;
}

sub _return_redirect {
  my ($target, $id) = @_;
  print $obj_cgi->redirect(
    $obj_config->get('api_base') . "/$target/$id"
#    -uri => $obj_config->get('api_base') . "/$target/$id",
#    -status => '302 Found'
  );
  exit;
}

sub _param {
  my ($id, $def) = @_;
  return defined($obj_cgi->param($id)) ? $obj_cgi->param($id) : $def;
}

__END__
/targets
------

List and manipulate notification targets.
Multiple notification targets could be defined for one user, and user can 
select target per each notification event on registration. If user selects 
multiple notification targets, the same number of new notification events are 
registered for one notification source. 

- `GET /targets?username=:username`_: Get list of notification targets
- `GET /targets/:id`_: Get specified notification target
- `POST /targets`_: Register new notification target
- `DELETE /targets/:id`_: Delete specified notification target

/schemes
------

List and manipulate notification configuration scheme, which will be used by 
cron-like job to register new notification events from external calendar 
resource. 

- `GET /schemes?username=:username`_: Get list of notification configuration 
  scheme
- `GET /schemes/:id`_: Get specified notification scheme
- `POST /schemes`_: Register new notification scheme
- `DELETE /schemes/:id`_: Delete specified notification scheme


