# Module for backend database connection

package PNAPI::DB;
use strict;
use lib '.';
use DBI;
use base qw(DBI::db);

use PNAPI::Constants;
use PNAPI::Config;

our $db_h;

BEGIN {
  if ($ENV{SERVER_SOFTWARE}) {
    require CGI::Carp;
    CGI::Carp->import('fatalsToBrowser');
  }
}

sub new {
  my ($self) = @_;
  my $config = new PNAPI::Config();
  my $pkg_module = 'PNAPI::DBmysql';
  eval ("require $pkg_module")
    || die ("$pkg_module is not a valid DB module. " . $@);
  $db_h = $pkg_module->new($config->get('db_user'), 
    $config->get('db_pass'), $config->get('db_host'), $config->get('db_name'),
    $config->get('db_port'), $config->get('db_sock'));
  if (! defined($db_h)) {die ("Could not connect to configured database"); }
  return $self;
}

sub db_new_conn {
  my ($class, $dsn, $user, $pass, $attr) = @_;
  $attr = {
    RaiseError => 0,
    AutoCommit => 1,
    PrintError => 0,
    ShowErrorStatement => 1,
    TaintIn => 1,
    FetchHashKeyName => 'NAME',
  } if (! defined($attr));
  my $self = DBI->connect($dsn, $user, $pass, $attr)
    or die "\nCannot connect to DB.\n$DBI::errstr\n";
  $self->{RaiseError} = 1;
  bless($self, $class);
  return $self;
}

sub dbh {return $db_h; }

#------------------------------- private


1;

__END__

