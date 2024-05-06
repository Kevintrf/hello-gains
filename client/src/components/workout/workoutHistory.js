import React, { useEffect, useState, useRef } from "react";
import TopBar from "../topBar";
import auth from '../../auth'
import { onAuthStateChanged } from "firebase/auth";
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import { v4 as uuidv4 } from 'uuid';
import Card from '@mui/material/Card';

import { Typography } from "@mui/material";

import WorkoutHistoryExercise from "./workoutHistoryExercise";

import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import NotLoggedIn from "../notLoggedIn";

function WorkoutHistory() {
    const [loggedIn, setLoggedIn] = useState(null);
    const [workouts, setWorkouts] = useState(undefined);
    const [state, setState] = useState(null);
    const dbUrl = process.env.REACT_APP_DB_URL;
    const [selectedWeek, setSelectedWeek] = useState(0);


    useEffect(() => {
        // eslint-disable-next-line no-unused-vars
        const listen = onAuthStateChanged(auth, (user) => {
            if (user) {
                setLoggedIn(true);
                getPreviousWorkouts();
            } else {
                setLoggedIn(false);
            }
        });
    }, []);

    async function getPreviousWorkouts() {
        const response = await fetch(`${dbUrl}workout/getExerciseHistory/${auth.currentUser.uid.toString()}`);
        if (!response.ok) {
            const message = `An error occurred: ${response.statusText}`;
            window.alert(message);
            return;
        }
        const collectedWorkouts = await response.json();

        setWorkouts(collectedWorkouts);
        setSelectedWeek(collectedWorkouts.length - 1);
    }

    function convertTimestampToDate(timestamp) {
        return new Date(timestamp).toLocaleString("sv-SE").toString();
    }

    function getSelectedSessionIteration() {
        if (workouts === undefined) {
            return ("Loading...")
        }
        else if (workouts === undefined || workouts.length === 0) {
            return ("");
        }
        else {
            return (workouts[selectedWeek].iteration)
        }
    }

    function printWeek() {
        if (selectedWeek === undefined) {
            return (
                <Typography variant="h5" gutterBottom>{"No workouts found for this week"}</Typography>
            )
        }

        else if (workouts === undefined) {
            return (
                <div>
                    <h1>Loading...</h1>
                </div>
            )
        }

        else if (workouts === undefined || workouts.length === 0) {
            return (
                <Box sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    marginTop: 5,
                }}>
                    <>
                        <Typography variant="h4" gutterBottom>No workout history found</Typography>
                    </>
                </Box>
            )
        }

        else if (workouts[selectedWeek].plan !== undefined && auth.currentUser.uid !== undefined) {
            return (
                <React.Fragment key={uuidv4()}>
                    <Box sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                    }}>
                        <Typography variant="h5" gutterBottom>Finished {convertTimestampToDate(workouts[selectedWeek].timeFinished)}</Typography>
                    </Box>

                    {JSON.parse(workouts[selectedWeek].plan.toString()).days.map(function (generateDay, index) {
                        return (
                            <React.Fragment key={uuidv4()}>
                                <Card sx={{ margin: 2 }}>
                                    <Box sx={{ margin: 2 }} >
                                        <Stack spacing={2}>
                                            <Typography variant="h5" gutterBottom>Day {generateDay.day} - {convertTimestampToDate(generateDay.timeFinished)}</Typography>
                                            {generateDay.exercises.map(function (generateExercise, index) {
                                                return (
                                                    <React.Fragment key={uuidv4()}>
                                                        <WorkoutHistoryExercise exerciseId={generateExercise.exerciseId} sets={generateExercise.sets} />
                                                    </React.Fragment>
                                                )

                                            })}

                                        </Stack>
                                    </Box>
                                </Card>
                            </React.Fragment>
                        )
                    })}

                    <br /><br /><br />
                </React.Fragment>
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

    function getChangeWeekButtons() {
        if (workouts === undefined || workouts.length === 0) {
            return (
                <></>
            )
        }
        else if (selectedWeek === 0 && workouts.length === 1) {
            return (
                <>
                    <Button disabled>
                        <ArrowBackIosNewIcon />
                    </Button>
                    <Typography variant="h4" component="h4" margin="2px">Session {getSelectedSessionIteration()}</Typography>
                    <Button disabled>
                        <ArrowForwardIosIcon />
                    </Button>
                </>
            )
        }
        else if (selectedWeek === 0) {
            return (
                <>
                    <Button disabled>
                        <ArrowBackIosNewIcon />
                    </Button>
                    <Typography variant="h4" component="h4" margin="2px">Session {getSelectedSessionIteration()}</Typography>
                    <Button onClick={() => changeWeek(1)}>
                        <ArrowForwardIosIcon />
                    </Button>
                </>
            )
        }
        else if (selectedWeek === workouts.length - 1) {
            return (
                <>
                    <Button onClick={() => changeWeek(-1)}>
                        <ArrowBackIosNewIcon />
                    </Button>
                    <Typography variant="h4" component="h4" margin="2px">Session {getSelectedSessionIteration()}</Typography>
                    <Button disabled>
                        <ArrowForwardIosIcon />
                    </Button>
                </>
            )
        }
        else {
            return (
                <>
                    <Button onClick={() => changeWeek(-1)}>
                        <ArrowBackIosNewIcon />
                    </Button>
                    <Typography variant="h4" component="h4" margin="2px">Session {getSelectedSessionIteration()}</Typography>
                    <Button onClick={() => changeWeek(1)}>
                        <ArrowForwardIosIcon />
                    </Button>
                </>
            )
        }
    }

    function changeWeek(change) {
        setSelectedWeek(selectedWeek + change);
    }

    // This following section will display the table with the exercises of individuals.
    return (
        <>
            <TopBar />
            {loggedIn === true ? (
                <>
                    <Box sx={{
                        marginTop: 2,
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                    }}>
                        <Stack spacing={2} direction="row">
                            <Typography variant="h3" gutterBottom>Workout History</Typography>
                        </Stack>
                    </Box>

                    <Box sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                    }}>
                        {getChangeWeekButtons()}
                    </Box>

                    <Box sx={{}} >
                        {printWeek()}
                    </Box>
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

export default WorkoutHistory;
