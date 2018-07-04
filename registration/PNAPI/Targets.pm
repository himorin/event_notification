# Module for 'targets'

package PNAPI::Targets;

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
  my $sth = $dbh->prepare('SELECT * FROM targets WHERE id = ?');
  $sth->execute($name);
  if ($sth->rows != 1) {return undef; }
  return $sth->fetchrow_hashref();
}

sub search {
  my ($self, $uname) = @_;
  if (! defined($uname)) {return undef; }
  my $sth = $dbh->prepare('SELECT * FROM targets WHERE uname = ?');
  $sth->execute($uname);
  if ($sth->rows() < 1) {return undef; }
  return $sth->fetchall_hashref('id');
}

sub add {
  my ($self, $uname, $hash) = @_;
  my $add_id = undef;
  if (defined($hash->{category}) && defined($hash->{pid})) {
    my $sth = $dbh->prepare('INSERT INTO targets (uname, category, pid, param, description) VALUES (?, ?, ?, ?, ?)');
    if ($sth->execute($uname, $hash->{category}, $hash->{pid}, $hash->{param}, 
      $hash->{description}) == 0) {return undef; }
    $add_id = $dbh->db_last_key('notices', 'id');
    return $add_id;
  }
  return undef;
}

sub del {
  my ($self, $uname, $id) = @_;
  if ((! defined($id)) || ($id == 0)) {return undef; }
  my $sth = $dbh->prepare('DELETE FROM targets WHERE ID = ? AND uname = ?');
  my $ret = $sth->execute($id, $uname);
  if (defined($ret) && ($ret > 0)) {
    # mark all notices with this id as invalid (3)
    $sth = $dbh->prepare('UPDATE notices SET fired = 3 WHERE tid = ? AND fired = 0');
    $sth->execute($id);
    return $id;
  }
  return undef;
}


#------------------------------- private


1;

__END__

