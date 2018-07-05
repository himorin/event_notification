#! /usr/bin/perl

use strict;
use lib '.';

use JSON;

use PNAPI::Constants;
use PNAPI::Config;
use PNAPI::CGI;
use PNAPI::DB;

my $obj_cgi = new PNAPI::CGI();
my $obj_config = new PNAPI::Config();

my $input_method = uc($ENV{'REQUEST_METHOD'});

if ($input_method ne 'POST') {
  &ReturnError("Not allowed");
  exit;
}

my $twilio_aid = $obj_cgi->param("AccountSid");
my $twilio_cid = $obj_cgi->param("CallSid");

if ($twilio_aid ne $obj_config->get("twilio_account")) {
  &ReturnError("SID mismatch");
  exit;
}

$obj_cgi->set_type('text/xml');
my $obj_db = new PNAPI::DB();
my $dbh = $obj_db->dbh();
my $sth = $dbh->prepare("SELECT * FROM notices WHERE sid = ?");
$sth->execute($twilio_cid);
if ($sth->rows() != 1) {
  &ReturnError("CallSid mismatch");
  exit;
}

my $val = $sth->fetchrow_hashref();

$obj_cgi->set_type('text/xml');
print $obj_cgi->header(200);
print <<"__EOF";
<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="man">$val->{content}</Say>
</Response>
__EOF

exit;

sub ReturnError {
  my ($code) = @_;
  print $obj_cgi->header(404);
  print to_json( {"error" => $code} );
}

