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
import { v4 as uuidv4 } from 'uuid';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import HistoryIcon from '@mui/icons-material/History';

function ExerciseHistoryDialog(props) {
    const [exerciseHistory, setExerciseHistory] = useState([]);
    const [exerciseName, setExerciseName] = useState([]);
    const [open, setOpen] = React.useState(false);
    const dbUrl = process.env.REACT_APP_DB_URL;

    const handleClickOpen = () => {
        setOpen(true);
    };
    const handleClose = () => {
        setOpen(false);
    };

    useEffect(() => {
        getExerciseName();
        getExerciseHistory();
        return;
    }, []);

    function convertTimestampToDate(timestamp) {
        return new Date(timestamp).toLocaleString("sv-SE").toString();
    }

    async function getExerciseName() {
        const response = await fetch(`${dbUrl}exercises/getNameById/${props.exerciseId.toString()}`);
        if (!response.ok) {
            const message = `An error occurred: ${response.statusText}`;
            window.alert(message);
            return;
        }

        let exerciseName = await response.json();
        setExerciseName(exerciseName);


    }

    async function getExerciseHistory() {
        const response = await fetch(`${dbUrl}workout/getExerciseHistory/${props.authUserId.toString()}/${props.exerciseId.toString()}`);
        if (!response.ok) {
            const message = `An error occurred: ${response.statusText}`;
            window.alert(message);
            return;
        }

        const exerciseHistoryDb = await response.json();
        setExerciseHistory(exerciseHistoryDb);
    }

    function parsePlanToExerciseHistory(week) {
        let newPlan = JSON.parse(week.plan);
        let days = [[]]; // days[[day1set1, day1set2, ...], [day2set1, day2set2, ...], ...]

        //Loop through days starting with the latest
        for (let i = 0; i < newPlan.days.length; i++) {
            days[i] = []; //Behövs annars krash
            //Loop through each exercise
            for (let j = 0; j < newPlan.days[i].exercises.length; j++) {
                //If correct exercise id
                if (newPlan.days[i].exercises[j].exerciseId === props.exerciseId) {
                    for (let k = 0; k < newPlan.days[i].exercises[j].sets.length; k++) {
                        if (newPlan.days[i].exercises[j].sets[k].finished === true) {
                            days[i][k] = { "reps": newPlan.days[i].exercises[j].sets[k].reps, "weight": newPlan.days[i].exercises[j].sets[k].weight, "time": convertTimestampToDate(newPlan.days[i].exercises[j].sets[k].timeFinished) };
                        }
                    }
                }
            }
        }

        //Remove empty days
        let newDays = [];
        for (let i = 0; i < days.length; i++) {
            if (days[i].toString() !== [].toString()) {
                newDays.push(days[i]);
            }
        }
        days = newDays;

        return (
            <>
                {days.map(function (generateDays, index) {
                    return (
                        <React.Fragment key={uuidv4()}>
                            <Typography component={'span'}> {/* component={'span'} is used to avoid the error: "Warning: validateDOMNesting(...): <table> cannot appear as a descendant of <p>." */}
                                Session {week.iteration} <br /><br />
                                <TableContainer component={Paper}>
                                    <Table sx={{ minWidth: 50 }} aria-label="simple table">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Weight</TableCell>
                                                <TableCell>Reps</TableCell>
                                                <TableCell>Time</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {generateDays.map(function (generateSets) {
                                                return (
                                                    <React.Fragment key={uuidv4()}>
                                                        <TableRow
                                                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                                        >
                                                            <TableCell align="right">{generateSets.weight} kg</TableCell>
                                                            <TableCell align="right">{generateSets.reps}</TableCell>
                                                            <TableCell align="right">{generateSets.time}</TableCell>
                                                        </TableRow>
                                                    </React.Fragment>
                                                )
                                            })}

                                        </TableBody>
                                    </Table>
                                </TableContainer>
                                <br></br>
                            </Typography>
                        </React.Fragment>
                    )
                })}
            </>
        );
    }

    return (
        <React.Fragment>
            <Button variant="contained" onClick={handleClickOpen}>
                <HistoryIcon /> Exercise history
            </Button>
            <Dialog
                onClose={handleClose}
                aria-labelledby="customized-dialog-title"
                open={open}
            >
                <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
                    Exercise history
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
                    <h1>{exerciseName}</h1>
                    {exerciseHistory.toReversed().map(function (generateMapping) {
                        return (
                            <React.Fragment key={uuidv4()}>
                                <Typography component={'span'}> {/* component={'span'} is used to avoid the error: "Warning: validateDOMNesting(...): <table> cannot appear as a descendant of <p>." */}
                                    {parsePlanToExerciseHistory(generateMapping)}
                                </Typography>
                            </React.Fragment>
                        )
                    })}

                    <br />
                </DialogContent>
            </Dialog>
        </React.Fragment>
    );
}

export default ExerciseHistoryDialog;

