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

import CalculateIcon from '@mui/icons-material/Calculate';
import { v4 as uuidv4 } from 'uuid';
import FormControl from '@mui/material/FormControl';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';
import FormHelperText from '@mui/material/FormHelperText';

import Box from '@mui/material/Box';

function CreateCustomExerciseDialog(props) {

    const [exerciseName, setExerciseName] = React.useState("My new exercise");
    const [exerciseDescription, setExerciseDescription] = React.useState("This is a new exercise");
    const dbUrl = process.env.REACT_APP_DB_URL;

    const [open, setOpen] = React.useState(false);

    const handleClickOpen = () => {
        setOpen(true);
    };
    const handleClose = () => {
        setOpen(false);
    };

    async function createNewExercise() {
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ "name": exerciseName, "description": exerciseDescription})
        };

        const response = await fetch(`${dbUrl}exercise/addCustomExercise/${auth.currentUser.uid.toString()}`, requestOptions);

        if (!response.ok) {
            const message = `An error occurred: ${response.statusText}`;
            window.alert(message);
            return;
        };

        props.getExercises();
        setOpen(false);
    }

    return (
        <React.Fragment>
            <Button onClick={handleClickOpen}>
                Create custom exercise
            </Button>

            <Dialog
                onClose={handleClose}
                aria-labelledby="customized-dialog-title"
                open={open}
            >
                <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
                    Create new exercise
                </DialogTitle>
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

                    <Box>
                        <Typography>Exercise name</Typography>
                    <FormControl key={"inputFormName"} sx={{ m: 1, width: '25ch' }} variant="outlined">
                      <OutlinedInput
                        id="outlined-adornment-weight"
                        aria-describedby="outlined-weight-helper-text"
                        inputProps={{
                          'aria-label': 'exercise name',
                          'type': 'string',
                        }}
                        defaultValue="My new exercise"
                        onChange={(e) => {
                            setExerciseName(e.target.value);
                          }}
                      />
                    </FormControl>
                    <Typography>Exercise description</Typography>
                    <FormControl key={"inputFormDescription"} sx={{ m: 1, width: '25ch' }} variant="outlined">
                      <OutlinedInput
                        id="outlined-adornment-weight"
                        aria-describedby="outlined-weight-helper-text"
                        inputProps={{
                          'aria-label': 'exercise description',
                          'type': 'string'
                        }}
                        defaultValue="This is a new exercise"
                        onChange={(e) => {
                            setExerciseDescription(e.target.value);
                          }}
                      />
                    </FormControl>

                    </Box>
                    <Button variant="contained" onClick={() => createNewExercise()}>Create</Button>




                </DialogContent>
            </Dialog>
        </React.Fragment>
    );
}

export default CreateCustomExerciseDialog;

