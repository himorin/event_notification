#! /usr/bin/perl

use strict;
use lib '.';

use JSON;

use PNAPI::Constants;
use PNAPI::Config;
use PNAPI::CGI;

use PNAPI::Notices;
#use PNAPI::Targets;
#use PNAPI::Schemes;

my $obj_cgi = new PNAPI::CGI();
my $obj_config = new PNAPI::Config();

my $input_method = uc($ENV{'REQUEST_METHOD'});
my $input_cmd = $obj_cgi->path_info();
my $input_data = $obj_cgi->param('POSTDATA');

if (substr($input_cmd, 0, 1) eq '/') {$input_cmd = substr($input_cmd, 1); }
my @input_cmds = split(/\//, $input_cmd);
if ($#input_cmds < 0) {&_error_invarg('Target missing'); }
my %input_hash;
if ($input_method eq 'POST') {
  %input_hash = to_json($input_data);
}

# start processing
my $outdata = {};

# TEST
$outdata->{cmd} = $input_cmd;
$outdata->{data} = $input_data;

# just do nothing if argument not match with predefined
my $is_done = FALSE;
my $is_id = 0;
my $cuser = $ENV{'REMOTE_USER'};
my $obj_handler;
if ($input_cmds[0] eq 'notices') {
  $obj_handler = new PNAPI::Notices();
  if ($input_method eq 'GET') {
    if ($#input_cmds == 1) {
      $outdata = $obj_handler->get($input_cmds[1]);
      $is_done = TRUE;
    } elsif ($#input_cmds == 0) {
      if (defined(my $uname = &_param('username', $cuser))) {
        $outdata = $obj_handler->search(&_param('state', 'queued'), $uname);
        if (defined($outdata)) {$is_done = TRUE; }
        else {&_error_invarg("No item found"); }
      }
    }
  } elsif ($input_method eq 'POST') {
    $is_id = $obj_handler->add($cuser, \%input_hash);
    if (defined($is_id)) {&_return_redirect($input_cmds[0], $is_id); }
  } elsif ($input_method eq 'DELETE') {
    $is_id = $obj_handler->del($cuser, \%input_hash);
    if (defined($is_id)) {
      $is_done = TRUE;
      $outdata->{delete_id} = $is_id;
    }
  }
} elsif ($input_cmds[0] eq 'targets') {
} elsif ($input_cmds[0] eq 'schemes') {
} else {
  &_error_invarg("Target \"$input_cmds[0]\" not defined");
}
if (! $is_done) {
  &_error_invarg("Invalid arguments were supplied for target \"$input_cmds[0]\".");
}
if (! defined($outdata)) {
  &_error_invarg("Target ID not found \"$input_cmds[1]\"");
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
  print $obj_cgi->redirect("$0/$target/$id");
  exit;
}

sub _param {
  my ($id, $def) = @_;
  return defined($obj_cgi->param($id)) ? $obj_cgi->param($id) : $def;
}

__END__
/notices
------

List and manipulate notification events.
One notification event represents one notification to be fired (not for all 
notification targets of user), which has configuration of event and ID of 
notification target to be used. 

- `GET /notices?state=queued&username=:username`_: Get list of registered 
  notification events
- `GET /notices/:id`_: Get specified registered notification event
- `POST /notices`_: Register new notification event for current logged in 
  user.
- `DELETE /notices/:id`_: Delete specified registered notification event

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

