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
import CheckIcon from '@mui/icons-material/Check';
import ToggleButton from '@mui/material/ToggleButton';

function SaveNewTemplateDialog(props) {

    const [templateName, setTemplateName] = React.useState(props.workoutProgramName);
    const [templatePublic, setTemplatePublic] = React.useState(false);
    const dbUrl = process.env.REACT_APP_DB_URL;

    const [open, setOpen] = React.useState(false);

    const handleClickOpen = () => {
        setOpen(true);
    };
    const handleClose = () => {
        setOpen(false);
    };

    async function saveTemplate() {
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ "plan": {"days": props.days}, "name": templateName, "public": templatePublic })
        };

        const response = await fetch(`${dbUrl}workout/createNewTemplate/${auth.currentUser.uid.toString()}`, requestOptions);

        if (!response.ok) {
            const message = `An error occurred: ${response.statusText}`;
            window.alert(message);
            return;
        };
        setOpen(false);
    }

    return (
        <React.Fragment>
            <Button fullWidth={true} variant="contained" color="primary" onClick={handleClickOpen}>
                Save as new template
            </Button>

            <Dialog
                onClose={handleClose}
                aria-labelledby="customized-dialog-title"
                open={open}
            >
                <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
                    Save as new template
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
                        <Typography>Template name</Typography>
                        <FormControl key={"inputFormName"} sx={{ m: 1, width: '25ch' }} variant="outlined">
                            <OutlinedInput
                                id="outlined-adornment-weight"
                                aria-describedby="outlined-weight-helper-text"
                                inputProps={{
                                    'aria-label': 'program name',
                                    'type': 'string',
                                }}
                                defaultValue={props.workoutProgramName}
                                onChange={(e) => {
                                    setTemplateName(e.target.value);
                                }}
                            />
                        </FormControl>


                        <Typography>Public</Typography>

                        <ToggleButton
                            color="primary"
                            value="unchecked"
                            selected={templatePublic}
                            onChange={() => {
                                setTemplatePublic(!templatePublic);
                            }}
                        >
                            <CheckIcon />
                        </ToggleButton>

                    </Box>
                    <br></br>
                    <Button variant="contained" onClick={() => saveTemplate()}>Create</Button>




                </DialogContent>
            </Dialog>
        </React.Fragment>
    );
}

export default SaveNewTemplateDialog;

