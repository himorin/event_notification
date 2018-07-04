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
  my ($self, $id) = @_;
  if (! defined($id)) {return undef; }
  my $sth = $dbh->prepare('SELECT * FROM notices WHERE id = ?');
  $sth->execute($id);
  if ($sth->rows != 1) {return undef; }
  return $sth->fetchrow_hashref();
}

sub search {
  my ($self, $uname, $state) = @_;
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
  if (defined($hash->{target}) && defined($hash->{content}) && 
    defined($hash->{tid}) && defined($hash->{source})) {
    # check specified tid is vaild and under uname
    my $sth = $dbh->prepare('SELECT * FROM targets WHERE uname = ? AND id = ?');
    if ((! $sth->execute($uname, $hash->{tid})) || ($sth->rows() < 1))
      {return undef; }
    my $q = 'INSERT INTO notices (target, content, tid, source';
    my @arr = ($hash->{target}, $hash->{content}, $hash->{tid}, $hash->{source});
    if (defined($hash->{url})) {$q .= ', url'; push(@arr, $hash->{url}); }
    if (defined($hash->{description})) {$q .= ', description'; push(@arr, $hash->{description}); }
    $q .= ') VALUES (' . ('?,' x $#arr) . '?)';
    $sth = $dbh->prepare($q);
    if ($sth->execute(@arr) == 0) {return undef; }
    $add_id = $dbh->db_last_key('notices', 'id');
    return $add_id;
  }
  return undef;
}


sub del {
  my ($self, $uname, $id) = @_;
  if ((! defined($id)) || ($id == 0)) {return undef; }
  # check specified id is valid and under uname
  my $sth = $dbh->prepare('SELECT notices.id FROM notices INNER JOIN targets ON notices.tid = targets.id WHERE notices.id = ? AND targets.uname = ? AND notices.fired = 0');
  if ((! $sth->execute($id, $uname)) || ($sth->rows() < 1)) 
    {return undef; }
  $sth = $dbh->prepare('UPDATE notices SET fired = 2 WHERE id = ? AND fired = 0');
  my $ret = $sth->execute($id);
  if (defined($ret) && ($ret > 0)) {return $id; }
  return undef;
}


#------------------------------- private


1;

__END__

