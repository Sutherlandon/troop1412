// TODO: add expading animation to opening an event.
// TODO: add notistack for form feedback
// TODO: add loading icons to buttons that trigger request (ie submit) for immediate feedback

import { Fragment, useEffect, useState } from 'react';
import Link from 'next/link';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import {
  Box,
  Button,
  Grid,
  Paper,
  Slide,
  Table,
  TableRow,
  TableCell,
  TableBody,
  TableHead,
  Typography,
  LinearProgress,
} from '@mui/material';

import AttendanceFormDialog from '../components/AttendanceFormDialog';
import EventDetails from '../components/EventDetails';
import NewEventDialog from '../components/NewEventDialog';
import Tag from '../components/Tag';
import * as ScheduleAPI from '../api/ScheduleAPI';
import * as MembersAPI from '../api/MembersAPI';
import { BRANCH_COLORS } from '../config/constants';

function SchedulePage() {
  const [attInfo, setAttInfo] = useState({ open: false });
  const [editInfo, setEditInfo] = useState({ open: false });
  const [loading, setLoading] = useState(true);
  const [newOpen, setNewOpen] = useState(false);
  const [schedule, setSchedule] = useState([]);
  const [members, setMembers] = useState([]);
  const [showDetails, setShowDetails] = useState();

  useEffect(() => {
    async function loadSchedule() {
      const { data: schedule, error: scheduleErr } = await ScheduleAPI.get();
      const { data: members, error: memberErr } = await MembersAPI.get();

      if (scheduleErr || memberErr) {
        return console.error(error);
      }

      setMembers(members)
      setSchedule(schedule);
      setLoading(false);
    }

    loadSchedule();
  }, []);

  // open the edit form loaded with the event
  function openEdit(event) {
    setEditInfo({ event, open: true });
  }

  // open the attendance form loaded with the event
  function openAttendance(event) {
    setAttInfo({ event, open: true });
  }

  // Handle removing a member from the list
  async function handleRemove(event) {
    if (confirm(`Are you sure you want to delete ${event.name}`)) {
      const { data, error } = await ScheduleAPI.remove(event);

      if (error) {
        return console.error(error);
      }

      setSchedule(data);
    }
  }

  console.log({ schedule });

  return (
    <div>
      <Grid container sx={{ marginBottom: 2 }}>
        <Grid item sx={{ flexGrow: 1 }}>
          <Typography variant='h5'>
            Troop Schedule 2022
          </Typography>
        </Grid>
        <Grid item>
          <Button
            color='primary'
            onClick={() => setNewOpen(true)}
            startIcon={<AddIcon />}
            variant='outlined'
            sx={{ fontWeight: 'bold' }}
          >
            Add
          </Button>
        </Grid>
      </Grid>
      <NewEventDialog
        handleClose={() => setNewOpen(false)}
        open={newOpen}
        onUpdate={(updatedSchedule) => setSchedule(updatedSchedule)}
      />
      <NewEventDialog
        {...editInfo}
        handleClose={() => setEditInfo({ open: false })}
        onUpdate={(updatedSchedule) => setSchedule(updatedSchedule)}
      />
      <AttendanceFormDialog
        {...attInfo}
        handleClose={() => setAttInfo({ open: false })}
        members={members}
        onSubmit={(data) => {
          setSchedule(data);
          setAttInfo({ open: false });
        }}
        schedule={schedule}
      />
      {loading ? (
        <LinearProgress />
      ) : (
        <Paper sx={{ mb: 2 }}>
          <Table size='small'>
            <TableHead>
              <TableRow>
                <TableCell sx={{ textAlign: 'left'}}>Date</TableCell>
                <TableCell>Name</TableCell>
                <TableCell></TableCell>
              </TableRow >
            </TableHead >
            <TableBody>
              {schedule.map((event, index) => {
                const expanded = showDetails === index;
                const highlight = event.type === 'HTT' ||
                  ['Camp', 'Day Hike', 'Award', 'Fundraiser'].includes(event.branch);

                const branchColor = BRANCH_COLORS[event.branch]?.b;
                const branchText = BRANCH_COLORS[event.branch]?.t;
                const borderColor = '#464646';

                return (
                  <Fragment key={event.name + event.date}>
                    <TableRow
                      onClick={() => setShowDetails(index === showDetails ? 'close' : index)}
                      sx={{
                        '& td': {
                          backgroundColor: (expanded || highlight) && branchColor,
                          borderTop: expanded && `2px solid ${borderColor}`,
                          color: (expanded || highlight) && branchText,
                        },
                        '& td:first-of-type': {
                          borderLeft: expanded && `2px solid ${borderColor}`,
                          borderTop: expanded && `2px solid ${borderColor}`,
                        },
                        '& td:last-of-type': {
                          borderRight: expanded && `2px solid ${borderColor}`,
                          borderTopWidth: expanded && `2px solid ${borderColor}`,
                        },
                      }}
                    >
                      <TableCell sx={{ textAlign: 'left' }}>
                        {highlight || expanded
                          ? <Box sx={{ pl: 2 }}>{event.date}</Box>
                          : <Tag text={event.date} variant={event.branch} />
                        }
                      </TableCell>
                      <TableCell>{event.name}</TableCell>
                      <TableCell sx={{ textAlign: 'right' }}>
                        {showDetails === index
                          ? <CloseIcon />
                          : <MoreHorizIcon />
                        }
                      </TableCell>
                    </TableRow>
                    {expanded &&
                      <TableRow>
                        <TableCell
                          colSpan={3}
                          sx={{
                            borderWidth: '0 2px 2px',
                            borderStyle: 'solid',
                            borderColor: borderColor,
                          }}
                        >
                          <EventDetails
                            event={event}
                            onAttendance={() => openAttendance(event)}
                            onEdit={() => openEdit(event)}
                            onDelete={() => handleRemove(event)}
                          />
                        </TableCell>
                      </TableRow>
                    }
                  </Fragment>
                );
              })}
            </TableBody>
          </Table >
        </Paper >
      )}
      <Grid container justifyContent='space-around' sx={{ marginBottom: 2 }}>
        <Grid item sx={{ marginBottom: 1 }}>
          <Link href='/members' passHref>
            <Button
              color='secondary'
              variant='contained'
            >
              Members List
            </Button>
          </Link>
        </Grid>
      </Grid>
    </div >
  );
}

export default SchedulePage;
