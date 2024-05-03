import React, { useEffect, useState } from "react";
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Typography from '@mui/material/Typography';
import auth from '../../auth'
import { onAuthStateChanged } from "firebase/auth";
import { v4 as uuidv4 } from 'uuid';
import Stack from '@mui/material/Stack';

function SwitchProgramDialog({ func }) {

  const [availableTemplates, setAvailableTemplates] = useState([]);
  const [availableTemplatesNames, setAvailableTemplatesNames] = useState([]);
  const [currentUser, setCurrentUser] = useState([]);
  const [open, setOpen] = React.useState(false);
  const [confirmPopupOpen, setConfirmPopupOpen] = React.useState(false);
  const [confirmPopupType, setConfirmPopupType] = React.useState(null);
  const [confirmPopupContent, setConfirmPopupContent] = React.useState(null);
  const dbUrl = process.env.REACT_APP_DB_URL;

  useEffect(() => {
    // eslint-disable-next-line no-unused-vars
    const listen = onAuthStateChanged(auth, (user) => {
      if (user) {
        getAvailableTemplates();
        setCurrentUser(user);
      } else {

      }
    });
  }, []);

  //Requires user to be logged in and login to be verified before being called
  async function getAvailableTemplates() {
    const response = await fetch(`${dbUrl}workout/getAvailableWorkouts/${auth.currentUser.uid.toString()}`);
    if (!response.ok) {
      const message = `An error occurred: ${response.statusText}`;
      window.alert(message);
      return;
    }

    let responseJson = await response.json();

    for (let i = 0; i < responseJson.length; i++) {
      responseJson[i].displayName = responseJson[i].name + " by " + await translateUid(responseJson[i].creatorUid);
    }

    setAvailableTemplates(responseJson);
  }

  async function translateUid(uid) {
    if (uid.toString() === currentUser.uid) {
      return "me";
    }
    else if (uid.toString() === "admin") {
      return "Hello Gains";
    }
    else {
      var username = await getUsernameFromId(uid);
      return username;
    }
  }

  async function getUsernameFromId(uid) {
      const response = await fetch(`${dbUrl}users/getNameById/${uid.toString()}`);
      if (!response.ok) {
        const message = `An error occurred: ${response.statusText}`;
        window.alert(message);
        return;
      }

      return await response.json();
  }

  const handleClickOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };


  function switchWorkoutProgram(newTemplate) {
    func(newTemplate);
    handleCloseConfirmPopup()
  }

  function getDeleteProgramButton(uid, generateTemplate) {
    if (uid.toString() === currentUser.uid) {
      return <Button variant="contained" color="error" onClick={() => handleOpenConfirmPopup("delete", generateTemplate)}>Delete</Button>;
    }
    else {
      <></>
    }
  }

  async function deleteWorkoutProgram(uid, programId) {
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ "_id": programId, "creatorUid": uid })
    };

    const response = await fetch(`${dbUrl}workout/deleteTemplate/${auth.currentUser.uid.toString()}`, requestOptions);

    if (!response.ok) {
      const message = `An error occurred: ${response.statusText}`;
      window.alert(message);
      return;
    };

    //Refresh available templates to show its is deleted
    getAvailableTemplates();
    handleCloseConfirmPopup();
  }

  function getSwitchProgramButton(generateTemplate) {
    return (
      <>
        <Typography>
          {generateTemplate.displayName}
        </Typography>
        <Button variant="contained" onClick={() => handleOpenConfirmPopup("switchProgram", generateTemplate)}>Switch to</Button>
      </>
    )
  }

  function handleOpenConfirmPopup(type, content) {
    setConfirmPopupType(type);
    setConfirmPopupContent(content);
    setConfirmPopupOpen(true);
  }

  function handleCloseConfirmPopup() {
    setConfirmPopupType(null);
    setConfirmPopupContent(null);
    setConfirmPopupOpen(false);
  }

  function getConfirmPopup() {
    if (confirmPopupType === "delete") {
      return (
        <>
          <Dialog
            onClose={handleCloseConfirmPopup}
            aria-labelledby="customized-dialog-title"
            open={confirmPopupOpen}
          >
            <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
              Are you sure?
            </DialogTitle>
            <DialogContent dividers>
              <Stack spacing={2} direction="column">
                <Typography variant="p" gutterBottom>
                  The program "{confirmPopupContent.displayName}" will be permanently deleted
                </Typography>
                <Stack spacing={2} direction="row">
                  <Button variant="contained" onClick={() => deleteWorkoutProgram(currentUser.uid, confirmPopupContent._id)}>Yes</Button>
                  <Button variant="contained" color="error" onClick={() => handleCloseConfirmPopup()}>No</Button>
                </Stack>
              </Stack>
            </DialogContent>
          </Dialog>
        </>
      )
    }
    else if (confirmPopupType === "switchProgram") {
      return (
        <>
          <Dialog
            onClose={handleCloseConfirmPopup}
            aria-labelledby="customized-dialog-title"
            open={confirmPopupOpen}
          >
            <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
              Are you sure?
            </DialogTitle>
            <DialogContent dividers>
              <Stack spacing={2} direction="column">
                <Typography variant="p" gutterBottom>
                  All progress in your current workout will be lost
                </Typography>
                <Stack spacing={2} direction="row">
                  <Button variant="contained" onClick={() => switchWorkoutProgram(confirmPopupContent)}>Yes</Button>
                  <Button variant="contained" color="error" onClick={() => handleCloseConfirmPopup()}>No</Button>
                </Stack>
              </Stack>
            </DialogContent>
          </Dialog>
        </>
      )
    }
  }

  return (
    <React.Fragment>

      <Button fullWidth={true} variant="contained" onClick={handleClickOpen}>
        Switch program
      </Button>

      <Dialog
        onClose={handleClose}
        aria-labelledby="customized-dialog-title"
        open={open}
      >
        <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
          Switch program
        </DialogTitle>

        {getConfirmPopup(confirmPopupOpen, confirmPopupType, confirmPopupContent)}

        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
        <DialogContent dividers>
          {availableTemplates.map(function (generateTemplate) {
            return (
              <React.Fragment key={uuidv4()}>

                <Stack spacing={2} direction="column">
                  {getSwitchProgramButton(generateTemplate)}
                  {getDeleteProgramButton(generateTemplate.creatorUid, generateTemplate)}
                </Stack>

                <br />
                <br />

              </React.Fragment>
            )
          })}
        </DialogContent>
      </Dialog>

    </React.Fragment>
  );
}

export default SwitchProgramDialog;

