import React, { useEffect, useState } from "react";
import Stack from '@mui/material/Stack';
import WorkoutExercise from "./workoutExercise";
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import { v4 as uuidv4 } from 'uuid';
import { Button, Container } from "@mui/material";
import auth from '../../auth'
import AddExerciseDialog from "./addExerciseDialog";
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

function Day(props) {

    const [day, setDay] = useState([]);
    const [exercises, setExercises] = useState([]);
    const [index, setIndex] = useState([]);
    const [dayFinished, setDayFinished] = useState(false);
    const [editMode, setEditMode] = useState(false);

    useEffect(() => {
        setDay(props.day);
        setExercises(props.exercises);
        setIndex(props.index);
        setEditMode(props.editMode);
        if (props.finished === undefined) {
            setDayFinished(false);
        }
        else {
            setDayFinished(props.finished);
        }
    }, []);

    function updateDayFromChildExercise(exercise, exerciseIndex, finishSet) {
        let newExercises = exercises;
        newExercises[exerciseIndex] = exercise;
        updateDayToParent(newExercises, finishSet);
    }

    function updateDayToParent(newExercises, finishSet) {
        let newDay = { "day": day, exercises: newExercises };
        props.updateDaysFromChildDay(newDay, index, finishSet);
    }

    function changeDayFinished() {
        let markFinished = false;

        if (dayFinished === false) {
            markFinished = true;
            setDayFinished(true);
        }
        else {
            markFinished = false;
            setDayFinished(false);
        }

        let newDay = { "day": day, exercises: exercises, finished: markFinished, timeFinished: Date.now() };
        props.updateDaysFromChildDay(newDay, index);
    }

    function getChangeDayButton() {
        if (editMode) {
            return (
                <>
                    <AddExerciseDialog addExerciseFromDialog={addExerciseFromDialog}>hej</AddExerciseDialog>
                </>
            )
        }
        else if (dayFinished) {
            return (
                <Button variant="contained" color="error" onClick={() => changeDayFinished()}>Unfinish day</Button>
            )
        }
        else {
            return (
                <Button variant="contained" color="success" onClick={() => changeDayFinished()}>Finish day</Button>
            )
        }
    }

    function addExerciseFromDialog(exerciseId) {
        let newExercises = exercises;
        newExercises.push({ exerciseId: exerciseId, sets: [] });
        props.addExerciseFromDialog(newExercises);
    }

    function getRemoveExerciseButton(exerciseIndex) {
        if (editMode) {
            return (
                <Button variant="contained" color="error" onClick={() => props.removeExerciseFromEditInDay(exerciseIndex)}>Remove exercise</Button>
            )
        }
        else {
            return <></>
        }
    }

    function moveExercisePosition(change, index) {
        let newExercises = [];

        if (change === 1) {
            for (let i = 0; i < exercises.length; i++) {
                if (i === index - 1) {
                    newExercises.push(exercises[index]);
                }
                else if (i === index) {
                    newExercises.push(exercises[index - 1]);
                }
                else {
                    newExercises.push(exercises[i]);
                }
            }
        }
        else if (change === -1) {
            for (let i = 0; i < exercises.length; i++) {
                if (i === index) {
                    newExercises.push(exercises[index + 1]);
                }
                else if (i === index + 1) {
                    newExercises.push(exercises[index]);
                }
                else {
                    newExercises.push(exercises[i]);
                }
            }
        }

        setExercises(newExercises);
        updateDayToParent(newExercises, false);
    }

    function getMoveButtons(generateExercises, index) {
        //If the exercise is the first exercise in the list
        if (generateExercises === exercises[0]) {
            return (
                <>
                    <Button disabled sx={{ maxHeight: 50 }} variant="contained" onClick={() => moveExercisePosition(1, index)}><ArrowDropUpIcon /></Button>
                    <Button sx={{ maxHeight: 50 }} variant="contained" onClick={() => moveExercisePosition(-1, index)}><ArrowDropDownIcon /></Button>
                </>
            )
        }
        //If the exercise is the last exercise in the list
        else if (generateExercises === exercises[exercises.length - 1]) {
            return (
                <>
                    <Button sx={{ maxHeight: 50 }} variant="contained" onClick={() => moveExercisePosition(1, index)}><ArrowDropUpIcon /></Button>
                    <Button disabled sx={{ maxHeight: 50 }} variant="contained" onClick={() => moveExercisePosition(-1, index)}><ArrowDropDownIcon /></Button>
                </>
            )
        }
        else {
            return (
                <>
                    <Button sx={{ maxHeight: 50 }} variant="contained" onClick={() => moveExercisePosition(1, index)}><ArrowDropUpIcon /></Button>
                    <Button sx={{ maxHeight: 50 }} variant="contained" onClick={() => moveExercisePosition(-1, index)}><ArrowDropDownIcon /></Button>
                </>
            )
        }
    }

    function getWorkouts(generateExercises, index) {
        if (editMode) {
            return <>
                <Stack spacing={2} direction="row">
                    <Stack sx={{ width: '100%' }}>
                        <WorkoutExercise key={uuidv4()} index={index} authUserId={props.authUserId} exerciseId={generateExercises.exerciseId} sets={generateExercises.sets} updateDayFromChildExercise={updateDayFromChildExercise} editMode={editMode} />
                    </Stack>
                        {getMoveButtons(generateExercises, index)}
                </Stack>
            </>
        }
        else {
            return (
                <>
                    <WorkoutExercise key={uuidv4()} index={index} authUserId={props.authUserId} exerciseId={generateExercises.exerciseId} sets={generateExercises.sets} updateDayFromChildExercise={updateDayFromChildExercise} editMode={editMode} />
                </>
            )
        }
    }

    return (
        <>
            <Card sx={{ margin: 2 }}>
                <Box sx={{ margin: 2 }} >
                    <Stack spacing={2}>
                        {exercises.map(function (generateExercises, index) {
                            return (
                                <React.Fragment key={uuidv4()}>
                                    {getWorkouts(generateExercises, index)}
                                    {getRemoveExerciseButton(index)}
                                </React.Fragment>
                            )
                        })}
                        {getChangeDayButton()}
                    </Stack>
                </Box>
            </Card>
        </>
    );
}

export default Day;