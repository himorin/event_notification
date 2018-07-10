# Module for 'schemes'

package PNAPI::Schemes;

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
  my $sth = $dbh->prepare('SELECT * FROM schemes WHERE id = ?');
  $sth->execute($name);
  if ($sth->rows != 1) {return undef; }
  my $ret = $sth->fetchrow_hashref();
  $ret->{exec_cond} =~ s/^%?([^%]+)%?$/$1/;
  return $ret;
}

sub search {
  my ($self, $uname) = @_;
  if (! defined($uname)) {return undef; }
  my $sth = $dbh->prepare('SELECT * FROM schemes WHERE uname = ?');
  $sth->execute($uname);
  if ($sth->rows() < 1) {return undef; }
  my $ret = $sth->fetchall_hashref('id');
  foreach my $id (keys(%$ret)) {
    $ret->{$id}->{exec_cond} =~ s/^%?([^%]+)%?$/$1/;
  }
  return $ret;
}

sub add {
  my ($self, $uname, $hash) = @_;
  my $add_id = undef;
  if (defined($hash->{content}) && defined($hash->{minutes}) && 
    defined($hash->{tid}) && defined($hash->{exec_cond})) {
    if (index($hash->{exec_cond}, '%') > -1) {return undef; }
    my $sth = $dbh->prepare('INSERT INTO schemes (uname, content, exec_cond, minutes, tid, description) VALUES (?, ?, ?, ?, ?, ?)');
    if ($sth->execute($uname, $hash->{content}, '%' . $hash->{exec_cond} . '%',
      $hash->{minutes}, $hash->{tid}, $hash->{description}) == 0)
      {return undef; }
    $add_id = $dbh->db_last_key('schemes', 'id');
    return $add_id;
  }
  return undef;
}

sub del {
  my ($self, $uname, $id) = @_;
  if ((! defined($id)) || ($id == 0)) {return undef; }
  my $sth = $dbh->prepare('DELETE FROM schemes WHERE ID = ? AND uname = ?');
  my $ret = $sth->execute($id, $uname);
  if (defined($ret) && ($ret > 0)) {return $id; }
  return undef;
}


#------------------------------- private


1;

__END__

