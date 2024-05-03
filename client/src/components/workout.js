import React, { useEffect, useState, useRef } from "react";
import TopBar from "./topBar";
import auth from '../auth'
import { onAuthStateChanged } from "firebase/auth";
import Day from "./workout/day";
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import { v4 as uuidv4 } from 'uuid';

import SwitchProgramDialog from "./workout/switchProgramDialog";
import { Typography } from "@mui/material";

import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import Alert from '@mui/material/Alert';

import FormControl from '@mui/material/FormControl';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';
import FormHelperText from '@mui/material/FormHelperText';
import InputLabel from '@mui/material/InputLabel';

import SaveNewTemplateDialog from "./workout/saveNewTemplateDialog";
import NotLoggedIn from "./notLoggedIn";

function Workout() {
    const [loggedIn, setLoggedIn] = useState(null);
    const [days, setDays] = useState([]);
    const [workoutProgramName, setWorkoutProgramName] = useState("");
    const [state, setState] = useState(null);
    const [selectedDay, setSelectedDay] = useState(0);
    const [editMode, setEditMode] = useState(false);
    const [editModeUnsavedChanges, setEditModeUnsavedChanges] = useState(false);
    const dbUrl = process.env.REACT_APP_DB_URL;

    useEffect(() => {
        // eslint-disable-next-line no-unused-vars
        const listen = onAuthStateChanged(auth, (user) => {
            if (user) {
                setLoggedIn(true);
                getWorkoutPlan();
            } else {
                setLoggedIn(false);
            }
        });
    }, []);

    //Requires user to be logged in and login to be verified before being called
    async function getWorkoutPlan() {
        const response = await fetch(`${dbUrl}workout/getMyCurrentPlan/${auth.currentUser.uid.toString()}`);
        if (!response.ok) {
            const message = `An error occurred: ${response.statusText}`;
            window.alert(message);
            return;
        }

        //Parse json to array with exercises and return that
        const workoutJSON = JSON.parse(await response.json());
        const newDays = workoutJSON.days;
        setDays(newDays);
        switchSelectedDayToFirstUnfinishedDay(newDays);
        setWorkoutProgramName(workoutJSON.name);
    }

    function switchSelectedDayToFirstUnfinishedDay(newDays) {
        for (let i = 0; i < newDays.length; i++) {
            if (newDays[i].finished === false || newDays[i].finished === undefined) {
                setSelectedDay(i);
                break;
            }
            if (i === newDays.length - 1) {
                setSelectedDay(newDays.length - 1);
            }
        }
    }

    //This is called from switchProgramDialog.js when the user switches workout template
    function switchWorkoutProgram(newTemplate) {
        let newTemplateJSON = JSON.parse(newTemplate.plan)
        setDays(newTemplateJSON.days);
        setWorkoutProgramName(newTemplate.name);
        updateUserWorkoutPlanInDatabase(newTemplateJSON.days, newTemplate.name);
        setSelectedDay(0);
    }

    async function finishWeek() {
        //Removes all days that has no finished exercises
        let finishDays = JSON.parse(JSON.stringify(days));

        for (let i = finishDays.length - 1; i >= 0; i--) {
            let hasFinishedExercises = false;
            for (let j = finishDays[i].exercises.length - 1; j >= 0; j--) {
                let hasFinishedSets = false;

                for (let k = finishDays[i].exercises[j].sets.length - 1; k >= 0; k--) {
                    if (!finishDays[i].exercises[j].sets[k].finished) {
                        finishDays[i].exercises[j].sets.splice(k, 1);
                    } else {
                        hasFinishedSets = true;
                    }
                }
                if (!hasFinishedSets) {
                    finishDays[i].exercises.splice(j, 1);
                } else {
                    hasFinishedExercises = true;
                }
            }
            if (!hasFinishedExercises) {
                finishDays.splice(i, 1);
            }
        }

        if (finishDays.length !== 0) {
            const requestOptions = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ "days": finishDays })
            };

            const response = await fetch(`${dbUrl}workout/finishWeek/${auth.currentUser.uid.toString()}`, requestOptions);

            if (!response.ok) {
                const message = `An error occurred: ${response.statusText}`;
                window.alert(message);
                return;
            };

            //Create new local week with all days marked as not finished
            let newDays = days;

            //Marks all days and sets as not finished in newDays
            for (let i = 0; i < newDays.length; i++) {
                newDays[i].finished = false;
                for (let j = 0; j < newDays[i].exercises.length; j++) {
                    for (let k = 0; k < newDays[i].exercises[j].sets.length; k++) {
                        newDays[i].exercises[j].sets[k].finished = false;
                    }
                }
            }

            setDays(newDays);
            //Collapse all exercises
            setState(uuidv4());
            //Upload new blank week to db
            updateUserWorkoutPlanInDatabase(newDays, workoutProgramName);
            setSelectedDay(0);

            //Send each exercise to historical data
            let historicalData = JSON.parse(JSON.stringify(finishDays));
            let historicalSets = [];

            //Day
            for (let i = historicalData.length - 1; i >= 0; i--) {

                //Exercise
                for (let j = historicalData[i].exercises.length - 1; j >= 0; j--) {
                    let highestWeight = 0;

                    //Set
                    for (let k = historicalData[i].exercises[j].sets.length - 1; k >= 0; k--) {

                        if (historicalData[i].exercises[j].sets[k].weight > highestWeight) {
                            highestWeight = historicalData[i].exercises[j].sets[k].weight;
                        }
                    }

                    let pushExcercise = true;

                    //Handle duplicate exercises
                    for (let l = 0; l < historicalSets.length; l++) {
                        if (historicalSets[l].exerciseId === historicalData[i].exercises[j].exerciseId) {
                            let newSets = historicalSets[l].sets.concat(historicalData[i].exercises[j].sets);
                            historicalSets[l].sets = newSets;
                            if (highestWeight > historicalSets[l].highestWeight) {
                                historicalSets[l].highestWeight = highestWeight;
                            }
                            pushExcercise = false;
                        }
                    }

                    if (pushExcercise) {
                        historicalSets.push({ "exerciseId": historicalData[i].exercises[j].exerciseId, "sets": historicalData[i].exercises[j].sets, "highestWeight": highestWeight });
                    }
                }
            }

            //Check if new personal bests
            checkNewPersonalBests(historicalSets);

            //Send historical data to db
            const requestOptions2 = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(historicalSets)
            };

            const response2 = await fetch(`${dbUrl}workout/postHistoricalData/${auth.currentUser.uid.toString()}`, requestOptions2);

            if (!response2.ok) {
                const message = `An error occurred: ${response2.statusText}`;
                window.alert(message);
                return;
            };
        }

        else {
            console.log("empty results");
            //add popup or something
        }
    }

    async function checkNewPersonalBests(sets) {
        //Collect historical data for user
        const response = await fetch(`${dbUrl}profile/getAllHistoricalData/${auth.currentUser.uid.toString()}`);
        if (!response.ok) {
            const message = `An error occurred: ${response.statusText}`;
            window.alert(message);
            return;
        }

        const historicalDataJSON = await response.json();

        //Compare historical data with new sets
        let newPersonalBests = [];
        sets.forEach((exercise) => {
            let exerciseId = exercise.exerciseId;
            let highestWeight = exercise.highestWeight;

            let newPersonalBest = true;

            historicalDataJSON.forEach((historicalExercise) => {
                if (historicalExercise.exerciseId === exerciseId) {
                    if (parseInt(historicalExercise.highestWeight) >= parseInt(highestWeight)) {
                        newPersonalBest = false;
                    }
                }
            });

            if (newPersonalBest) {
                newPersonalBests.push({ "exerciseId": exerciseId, "highestWeight": highestWeight });
            }
        });

        if (newPersonalBests.length !== 0) {
            newPersonalBests.forEach(async (personalBest) => {
                const response = await fetch(`${dbUrl}exercises/getNameById/${personalBest.exerciseId}`);

                if (!response.ok) {
                    const message = `An error occurred: ${response.statusText}`;
                    window.alert(message);
                    return;
                };

                let exerciseName = await response.json();

                let communityPost = { "title": "achieved a new personal best", "subtitle": personalBest.highestWeight + "kg " + exerciseName, timestamp: Date.now() };

                const requestOptions = {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(communityPost)
                };

                const response2 = await fetch(`${dbUrl}community/newPost/${auth.currentUser.uid.toString()}`, requestOptions);

                if (!response2.ok) {
                    const message = `An error occurred: ${response2.statusText}`;
                    window.alert(message);
                    return;
                };
            });
            //Popup new personal bests
        }
    }

    function updateDaysFromChildDay(childDay, dayIndex, finishSet) {
        var newDays = days;
        newDays[dayIndex] = childDay;
        setDays(newDays);
        if (editMode === false) {
            if (finishSet === true) {
                newDays[dayIndex].timeFinished = Date.now();
                setDays(newDays);
            }
            updateUserWorkoutPlanInDatabase(newDays, workoutProgramName);
        }
        else if (editMode === true) {
            setEditModeUnsavedChanges(true);
        }
    }

    async function updateUserWorkoutPlanInDatabase(newDays, newWorkoutName) {
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ "days": newDays, "name": newWorkoutName })
        };

        const response = await fetch(`${dbUrl}workout/updateUserWorkoutPlans/${auth.currentUser.uid.toString()}`, requestOptions);

        if (!response.ok) {
            const message = `An error occurred: ${response.statusText}`;
            window.alert(message);
            return;
        };
    }

    function printDay() {
        if (days[selectedDay] !== undefined && days[selectedDay] !== undefined && auth.currentUser.uid !== undefined) {
            return (
                <>
                    <Day key={uuidv4()} index={selectedDay} authUserId={auth.currentUser.uid} day={days[selectedDay].day} exercises={days[selectedDay].exercises} finished={days[selectedDay].finished} updateDaysFromChildDay={updateDaysFromChildDay} editMode={editMode} addExerciseFromDialog={addExerciseFromDialog} removeExerciseFromEditInDay={removeExerciseFromEditInDay} />
                </>
            )
        }
        else {
            return (
                <div>
                    <h1>Loading...</h1>
                </div>
            )
        }
    }

    function changeDay(change) {
        let newSelectedDay = selectedDay + change;
        if (newSelectedDay < 0) {
            newSelectedDay = 0;
        }
        setSelectedDay(newSelectedDay);
    }

    function getChangeDayButtons() {
        if (editMode === true) {
            if (selectedDay === 0 && days.length === 1) {
                return (
                    <>
                        <Button disabled>
                            <ArrowBackIosNewIcon />
                        </Button>
                        <Typography variant="h4" component="h4" margin="2px">Day {selectedDay + 1}</Typography>
                        <Button disabled>
                            <ArrowForwardIosIcon />
                        </Button>
                    </>
                )
            }
            else if (selectedDay === 0) {
                return (
                    <>
                        <Button disabled>
                            <ArrowBackIosNewIcon />
                        </Button>
                        <Typography variant="h4" component="h4" margin="2px">Day {selectedDay + 1}</Typography>
                        <Button onClick={() => changeDay(1)}>
                            <ArrowForwardIosIcon />
                        </Button>
                    </>
                )
            }
            else if (selectedDay > days.length - 2) {
                return (
                    <>
                        <Button onClick={() => changeDay(-1)}>
                            <ArrowBackIosNewIcon />
                        </Button>
                        <Typography variant="h4" component="h4" margin="2px">Day {selectedDay + 1}</Typography>
                        <Button disabled>
                            <ArrowForwardIosIcon />
                        </Button>
                    </>
                )
            }
            else {
                return (
                    <>
                        <Button onClick={() => changeDay(-1)}>
                            <ArrowBackIosNewIcon />
                        </Button>
                        <Typography variant="h4" component="h4" margin="2px">Day {selectedDay + 1}</Typography>
                        <Button onClick={() => changeDay(1)}>
                            <ArrowForwardIosIcon />
                        </Button>
                    </>
                )
            }
        }

        else {
            if (selectedDay === 0 && days.length === 1) {
                return (
                    <>
                        <Button disabled>
                            <ArrowBackIosNewIcon />
                        </Button>
                        <Typography variant="h4" component="h4" margin="2px">Day {selectedDay + 1}</Typography>
                        <Button disabled>
                            <ArrowForwardIosIcon />
                        </Button>
                    </>
                )
            }
            else if (selectedDay === 0) {
                return (
                    <>
                        <Button disabled>
                            <ArrowBackIosNewIcon />
                        </Button>
                        <Typography variant="h4" component="h4" margin="2px">Day {selectedDay + 1}</Typography>
                        <Button onClick={() => changeDay(1)}>
                            <ArrowForwardIosIcon />
                        </Button>
                    </>
                )
            }
            else if (selectedDay > days.length - 2) {
                return (
                    <>
                        <Button onClick={() => changeDay(-1)}>
                            <ArrowBackIosNewIcon />
                        </Button>
                        <Typography variant="h4" component="h4" margin="2px">Day {selectedDay + 1}</Typography>
                        <Button disabled>
                            <ArrowForwardIosIcon />
                        </Button>
                    </>
                )
            }
            else {
                return (
                    <>
                        <Button onClick={() => changeDay(-1)}>
                            <ArrowBackIosNewIcon />
                        </Button>
                        <Typography variant="h4" component="h4" margin="2px">Day {selectedDay + 1}</Typography>
                        <Button onClick={() => changeDay(1)}>
                            <ArrowForwardIosIcon />
                        </Button>
                    </>
                )
            }
        }
    }

    function enterEditMode() {
        setEditMode(true);
        setEditModeUnsavedChanges(false);
    }

    function exitEditMode() {
        setEditMode(false);
        getWorkoutPlan();
    }

    async function saveChangesEditMode() {
        await updateUserWorkoutPlanInDatabase(days, workoutProgramName);
        setEditModeUnsavedChanges(false);
    }

    function getTopButtons() {
        if (editMode === true) {
            return (
                <Box sx={{ marginTop: 2, marginLeft: 2, marginBottom: -2, marginRight: 2 }}>
                    <Stack spacing={2} direction="column">
                        <Alert variant="filled" severity="warning">
                            You are currently in edit mode! Don't forget to save your changes!
                        </Alert>
                        <SaveNewTemplateDialog days={days} workoutProgramName={workoutProgramName} />
                        <Button fullWidth={true} variant="contained" color="success" disabled={!editModeUnsavedChanges} onClick={() => saveChangesEditMode()}>
                            Save changes
                        </Button>
                        <Button fullWidth={true} variant="contained" color="error" onClick={() => exitEditMode()}>
                            Exit edit mode
                        </Button>
                    </Stack>
                </Box>
            )
        }
        else {
            return (
                <Box sx={{ marginTop: 2, marginLeft: 2, marginBottom: -2, marginRight: 2 }}>
                    <Stack spacing={2} direction="row">
                        <SwitchProgramDialog key={uuidv4()} func={switchWorkoutProgram} />
                        <Button fullWidth={true} variant="contained" onClick={() => enterEditMode()}>
                            Edit program
                        </Button>
                    </Stack>
                </Box>
            )
        }
    }

    function getBottomButtons() {
        if (editMode === true) {
            return (
                <>
                </>
            )
        }
        else {
            return (
                <Box sx={{ marginTop: 2, marginLeft: 2, marginBottom: -2, marginRight: 2 }}>
                    <Stack spacing={2} direction="row">
                        <Button variant="contained" fullWidth={true} onClick={() => finishWeek()}>
                            Finish session
                        </Button>
                    </Stack>
                </Box>
            )
        }
    }

    function addDay() {
        let newDay = { "day": days.length + 1, exercises: [], finished: false };
        let newDays = days;
        newDays.push(newDay);
        setDays(newDays);
        setSelectedDay(newDays.length - 1);
        setEditModeUnsavedChanges(true);
    }

    function removeDay() {
        if (days.length === 1) {
            console.log("cannot remove last day");
            //Popup warning here
            //Make last day exercise list empty
        }
        else {
            let newDays = days;
            newDays.splice(selectedDay, 1);

            for (let i = 0; i < newDays.length; i++) {
                newDays[i].day = i + 1;
            }

            setDays(newDays);
            let newSelectedDay = selectedDay - 1;
            if (newSelectedDay < 0) {
                newSelectedDay = 0;
            }
            setSelectedDay(newSelectedDay);
            setEditModeUnsavedChanges(true);
            setState(uuidv4());
        }
    }

    function getAddRemoveDay() {
        if (editMode === true) {
            return (
                <Box sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                }}>
                    <Stack spacing={2} direction="row">
                        <Button variant="contained" color="success" onClick={() => addDay()}>Add day</Button>
                        <Button variant="contained" color="error" onClick={() => removeDay()}>Remove day</Button>
                    </Stack>
                </Box>
            )
        }
        else {
            return (
                <></>
            )
        }
    }

    function addExerciseFromDialog(newExercises) {
        let newDays = days;
        newDays[selectedDay].exercises = newExercises;
        setDays(newDays);
        setEditModeUnsavedChanges(true);
        setState(uuidv4());
    }

    function removeExerciseFromEditInDay(exerciseIndex) {
        let newDays = days;
        newDays[selectedDay].exercises.splice(exerciseIndex, 1);
        setDays(newDays);
        setEditModeUnsavedChanges(true);
        setState(uuidv4());
    }

    function getWorkoutProgramName() {
        if (editMode === true) {
            return (
                <>
                    <FormControl sx={{ m: 1, width: '50ch' }} variant="outlined">
                        <InputLabel htmlFor="outlined-adornment-amount">Workout name</InputLabel>
                        <OutlinedInput
                            id="outlined-adornment-weight"
                            aria-describedby="outlined-weight-helper-text"
                            label="Workout name"
                            inputProps={{
                                'aria-label': 'Workout name',
                                'type': 'string'
                            }}
                            defaultValue={workoutProgramName}
                            onChange={(e) => {
                                setWorkoutProgramName(e.target.value);
                                setEditModeUnsavedChanges(true);
                            }}
                        />
                    </FormControl>
                </>
            )
        }
        else {
            return (
                <Typography variant="h3" gutterBottom>{workoutProgramName}</Typography>
            )
        }
    }

    //Display current users workout program
    return (
        <>
            <TopBar />
            {loggedIn === true ? (
                <>
                    {getTopButtons()}

                    <br />
                    <br />

                    <Box sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                    }}>
                        {getWorkoutProgramName()}
                    </Box>

                    <Box sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                    }}>
                        {getChangeDayButtons()}
                    </Box>

                    {getAddRemoveDay()}

                    <Box sx={{}} >
                        {printDay()}
                    </Box>

                    {getBottomButtons()}
                </>
            ) : (
                <></>
            )}
            {loggedIn === false ? (
                <NotLoggedIn />
            ) : (
                <></>
            )}
        </>
    );
}

export default Workout;