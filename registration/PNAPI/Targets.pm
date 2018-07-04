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
  my $sth;
  if (defined($hash->{category}) && defined($hash->{pid})) {
    if ($hash->{category} eq 'webpush') {
      # search and return existing id if the same
      $sth = $dbh->prepare('SELECT * FROM targets WHERE category = "webpush" AND pid = ?');
      $sth->execute($hash->{pid});
      if ($sth->rows() > 0) {
        my $val = $sth->fetchrow_hashref();
        if ((! (defined($val->{param}) && ($val->{param} eq $hash->{param}))) ||
            (! (defined($val->{description}) && ($val->{description} eq $hash->{description})))) {
          # if wrong param or description, update it
          $sth = $dbh->prepare('UPDATE targets SET param = ?, description = ? WHERE id = ?');
          $sth->execute($hash->{param}, $hash->{description}, $val->{id});
        }
        return $val->{id};
      }
      # if not exist add new.
    }
$sth = $dbh->prepare('INSERT INTO targets (uname, category, pid, param, description) VALUES (?, ?, ?, ?, ?)');
    if ($sth->execute($uname, $hash->{category}, $hash->{pid}, $hash->{param}, 
      $hash->{description}) == 0) {return undef; }
    $add_id = $dbh->db_last_key('targets', 'id');
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

