# Module for 'notices'

package PNAPI::Notices;

use strict;
use lib '.';
use PNAPI::DB;
use base qw(PNAPI::DB);

use PNAPI::Constants;

our $dbh;

sub new {
  my ($class) = @_;
  my $self = $class->SUPER::new();
  $dbh = $self->SUPER::dbh();
  return $self;
}

sub get {
  my ($self, $name) = @_;
  if (! defined($name)) {return undef; }
  my $sth = $dbh->prepare('SELECT * FROM notices WHERE id = ?');
  $sth->execute($name);
  if ($sth->rows != 1) {return undef; }
  return $sth->fetchrow_hashref();
}

sub search {
  my ($self, $state, $uname) = @_;
  if (! defined($uname)) {return undef; }
  my $fired_id = STATE_QUEUED;
  my $fired_sth = 'AND fired = ?';
  if (defined($state)) {
    if ($state eq 'fired') {$fired_id = STATE_FIRED; }
    elsif ($state eq 'deleted') {$fired_id = STATE_DELETED; }
    elsif ($state eq 'queued') {}
    else {$fired_sth = ''; }
  } else {$fired_sth = ''; }
  my $q = "SELECT notices.* FROM notices INNER JOIN targets ON notices.tid = targets.id WHERE targets.uname = ? $fired_sth";
  my $sth = $dbh->prepare($q);
  $sth->execute($uname, $fired_id);
  if ($sth->rows() < 1) {return undef; }
  return $sth->fetchall_hashref('id');
}

sub add {
  my ($self, $uname, $hash) = @_;
  my $add_id = undef;
  return $add_id;
}


sub del {
}


#------------------------------- private


1;

__END__

