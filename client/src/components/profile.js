import React, { useEffect, useState } from "react";
import { useParams } from "react-router";
import TopBar from "./topBar";
import auth from '../auth'
import NotLoggedIn from "./notLoggedIn";
import { onAuthStateChanged } from "firebase/auth";
import { Box, Stack, Typography } from "@mui/material";
import { TextField, Button } from "@mui/material";
import { SparkLineChart } from '@mui/x-charts';
import { LineChart } from '@mui/x-charts/LineChart';
import { BarChart } from '@mui/x-charts/BarChart';

import PlotLineChart from "./plotLineChart";
import { Autocomplete } from "@mui/material";
import { matchSorter } from 'match-sorter';

export default function Settings() {
    const dbUrl = process.env.REACT_APP_DB_URL;
    const [loggedIn, setLoggedIn] = useState(null);
    const [username, setUsername] = useState("");
    const [topBarState, setTopBarState] = useState(username);
    const [historicalData, setHistoricalData] = useState([]);

    const [totalLiftedDates, setTotalLiftedDates] = useState([]);
    const [totalLiftedWeight, setTotalLiftedWeight] = useState([]);
    const [totalLiftedWeightTimeseries, setTotalLiftedWeightTimeseries] = useState([]);

    const [totalWorkoutsDates, setTotalWorkoutsDates] = useState([]);
    const [totalWorkoutsAmount, setTotalWorkoutsAmount] = useState([]);
    const [totalWorkoutsAmountTimeseries, setTotalWorkoutsAmountTimeseries] = useState([]);

    const [selectedExercise, setSelectedExercise] = useState(0);
    const [exerciseStatistics, setExerciseStatistics] = useState([]);
    const [exerciseAutoCompleteList, setExerciseAutoCompleteList] = useState([]);

    useEffect(() => {
        // eslint-disable-next-line no-unused-vars
        const listen = onAuthStateChanged(auth, (user) => {
            if (user) {
                setLoggedIn(true);
                setUsername(user.displayName);
                getAllHistoricalData();
            } else {
                setLoggedIn(false);
            }
        });
    }, []);

    const filterOptions = (options, { inputValue }) => {
        const optionsForSearch = options.map((o) => o.label)
        const terms = inputValue.split(' ')
        const result = terms.reduceRight(
            (accu, term) => matchSorter(accu, term),
            optionsForSearch
        )
        return result
    }

    function timestampToDate(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleDateString("en-SE");
    }

    async function getExerciseNameFromId(exerciseId) {
        const response = await fetch(`${dbUrl}exercises/getNameById/${exerciseId}`);
        if (!response.ok) {
            const message = `An error occurred: ${response.statusText}`;
            window.alert(message);
            return;
        }

        const exerciseName = await response.json();
        return exerciseName;
    }

    async function getAllHistoricalData() {
        const response = await fetch(`${dbUrl}profile/getAllHistoricalData/${auth.currentUser.uid.toString()}`);
        if (!response.ok) {
            const message = `An error occurred: ${response.statusText}`;
            window.alert(message);
            return;
        }

        const historicalDataJSON = await response.json();
        setHistoricalData(historicalDataJSON);

        calculateHistoricalWeight(historicalDataJSON);
        calculateWorkouts();
        getExerciseHistoricalData(historicalDataJSON);
    }

    async function getExerciseHistoricalData(historicalData) {
        //Sum up all weight from each day
        let exercisesStatisticsList = [];

        historicalData.forEach((exercise) => {

            let exerciseWithSets = {};
            exerciseWithSets.exerciseId = exercise.exerciseId;
            exerciseWithSets.name = "";
            exerciseWithSets.dates = [];
            exerciseWithSets.dataTotal = [];
            exerciseWithSets.dataTimeseries = [];

            let sets = [];

            //In every foreach loop. Get dates. Get total weight lifted with dates. Get total weight lifted with timeseries

            //Go through each set
            for (let i = 0; i < exercise.sets.length; i++) {
                var dateExists = false;

                //Go through each entry in historicalWeightList
                for (let j = 0; j < sets.length; j++) {
                    if (sets[j].date === timestampToDate(exercise.sets[i].timeFinished)) {
                        dateExists = true;
                        sets[j].weight = parseInt(sets[j].weight) + parseInt(exercise.sets[i].weight) * parseInt(exercise.sets[i].reps);
                        break;
                    }
                }

                if (!dateExists) {
                    sets.push({
                        date: timestampToDate(exercise.sets[i].timeFinished),
                        weight: parseInt(exercise.sets[i].weight) * parseInt(exercise.sets[i].reps),
                        timestamp: new Date(timestampToDate(exercise.sets[i].timeFinished)).valueOf()
                    });
                }
            }

            //Magically sort by date
            sets.sort((a, b) => (new Date(a.date).valueOf() > new Date(b.date).valueOf()) ? 1 : ((new Date(b.date).valueOf() > new Date(a.date).valueOf()) ? -1 : 0))

            //Now collect dates, total weight lifted and timeseries weight lifted
            for (let i = 0; i < sets.length; i++) {
                if (i === 0) {
                    exerciseWithSets.dates.push(sets[i].date);
                    exerciseWithSets.dataTimeseries.push(sets[i].weight);
                    exerciseWithSets.dataTotal.push(sets[i].weight);
                } else {
                    exerciseWithSets.dates.push(sets[i].date);
                    exerciseWithSets.dataTimeseries.push(sets[i].weight);
                    exerciseWithSets.dataTotal.push(exerciseWithSets.dataTotal[i - 1] + sets[i].weight);
                }
            }

            exercisesStatisticsList.push(exerciseWithSets);

        });

        //Sort by most sets
        exercisesStatisticsList.sort((b, a) => (a.dates.length > b.dates.length ? 1 : b.dates.length > a.dates.length ? -1 : 0));

        let exerciseAutoCompleteList = [];

        //Get name for each exercise
        for (let i = 0; i < exercisesStatisticsList.length; i++) {
            exercisesStatisticsList[i].name = await getExerciseNameFromId(exercisesStatisticsList[i].exerciseId);
            exerciseAutoCompleteList.push({
                label: exercisesStatisticsList[i].name
            });

            if (exercisesStatisticsList[i].dates.length === 1) {
                let date = new Date(exercisesStatisticsList[i].dates[0]);
                date.setDate(date.getDate() - 1);
                exercisesStatisticsList[i].dates.unshift(date.toLocaleDateString("en-SE"));
                exercisesStatisticsList[i].dataTimeseries.unshift(0);
                exercisesStatisticsList[i].dataTotal.unshift(0);
            }   
        }

        setExerciseAutoCompleteList(exerciseAutoCompleteList);
        setExerciseStatistics(exercisesStatisticsList);
    }

    function calculateHistoricalWeight(historicalData) {
        //Sum up all weight from each day
        let historicalWeightList = [];

        historicalData.forEach((exercise) => {

            //Go through each set
            for (let i = 0; i < exercise.sets.length; i++) {
                var dateExists = false;

                //Go through each entry in historicalWeightList
                for (let j = 0; j < historicalWeightList.length; j++) {
                    if (historicalWeightList[j].date === timestampToDate(exercise.sets[i].timeFinished)) {
                        dateExists = true;
                        historicalWeightList[j].weight = parseInt(historicalWeightList[j].weight) + parseInt(exercise.sets[i].weight) * parseInt(exercise.sets[i].reps);
                        break;
                    }
                }

                if (!dateExists) {
                    historicalWeightList.push({
                        date: timestampToDate(exercise.sets[i].timeFinished),
                        weight: parseInt(exercise.sets[i].weight) * parseInt(exercise.sets[i].reps),
                        timestamp: new Date(timestampToDate(exercise.sets[i].timeFinished)).valueOf()
                    });
                }
            }

        });

        //Magically sort by date
        historicalWeightList.sort((a, b) => (new Date(a.date).valueOf() > new Date(b.date).valueOf()) ? 1 : ((new Date(b.date).valueOf() > new Date(a.date).valueOf()) ? -1 : 0))

        let historicalWeightListDates = [];
        let historicalWeightListWeight = [];
        let historicalWeightListWeightTimeseries = [];

        for (let i = 0; i < historicalWeightList.length; i++) {
            if (i === 0) {
                historicalWeightListDates.push(historicalWeightList[i].date);
                historicalWeightListWeight.push(historicalWeightList[i].weight);
                historicalWeightListWeightTimeseries.push(historicalWeightList[i].weight);
            } else {
                historicalWeightListDates.push(historicalWeightList[i].date);
                historicalWeightListWeightTimeseries.push(historicalWeightList[i].weight);
                historicalWeightListWeight.push(historicalWeightListWeight[i - 1] + historicalWeightList[i].weight);
            }
        }

        setTotalLiftedDates(historicalWeightListDates);
        setTotalLiftedWeight(historicalWeightListWeight);
        setTotalLiftedWeightTimeseries(historicalWeightListWeightTimeseries);
    }

    async function calculateWorkouts() {
        const response = await fetch(`${dbUrl}workout/getExerciseHistory/${auth.currentUser.uid.toString()}`);
        if (!response.ok) {
            const message = `An error occurred: ${response.statusText}`;
            window.alert(message);
            return;
        }

        const exerciseHistoryJSON = await response.json();

        let workoutList = [];

        exerciseHistoryJSON.forEach((session) => {
            let sessionDays = JSON.parse(session.plan);
            sessionDays.days.forEach((day) => {

                //Check if date exists
                let dateExists = false;
                for (let i = 0; i < workoutList.length; i++) {
                    if (workoutList[i].date === timestampToDate(day.timeFinished)) {
                        dateExists = true;
                        workoutList[i].amount++;
                        break;
                    }
                }

                if (!dateExists) {
                    workoutList.push({
                        date: timestampToDate(day.timeFinished),
                        amount: 1,
                        timestamp: new Date(timestampToDate(day.timeFinished)).valueOf()
                    });
                }

            });
        });

        //Magically sort by date
        workoutList.sort((a, b) => (new Date(a.date).valueOf() > new Date(b.date).valueOf()) ? 1 : ((new Date(b.date).valueOf() > new Date(a.date).valueOf()) ? -1 : 0))

        let workoutListDates = [];
        let workoutListAmount = [];
        let workoutListAmountTimeseries = [];

        for (let i = 0; i < workoutList.length; i++) {
            if (i === 0) {
                workoutListDates.push(workoutList[i].date);
                workoutListAmount.push(workoutList[i].amount);
                workoutListAmountTimeseries.push(workoutList[i].amount);
            } else {
                workoutListDates.push(workoutList[i].date);
                workoutListAmountTimeseries.push(workoutList[i].amount);
                workoutListAmount.push(workoutListAmount[i - 1] + workoutList[i].amount);
            }
        }

        setTotalWorkoutsDates(workoutListDates);
        setTotalWorkoutsAmount(workoutListAmount);
        setTotalWorkoutsAmountTimeseries(workoutListAmountTimeseries);
    }

    function getPlotComponent(data1Axis, data1Series, data2Axis, data2Series, title, button1name, button2name) {
        if (data1Axis.length !== 0 && data1Series.length !== 0 && data2Axis === null && data2Series == null) {
            return (
                <PlotLineChart data1={[data1Axis, data1Series]} data2={null} title={title} button1name={null} button2name={null} />
            )
        }
        else if (data1Axis.length !== 0 && data1Series.length !== 0 && data2Axis.length !== 0 && data2Series.length !== 0) {
            return (
                <PlotLineChart data1={[data1Axis, data1Series]} data2={[data2Axis, data2Series]} title={title} button1name={button1name} button2name={button2name} />
            )
        }
        else {
            return (
                <></>
            )
        }
    }

    function getExerciseStatistics() {
        if (exerciseStatistics.length === 0) {
            return (
                <>
                </>
            )
        }
        else {
            return (
                <>
                    <Box sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                    }}>
                        <Stack direction={"row"} spacing={"auto"}>
                            {getPlotComponent(exerciseStatistics[selectedExercise].dates, exerciseStatistics[selectedExercise].dataTimeseries, exerciseStatistics[selectedExercise].dates, exerciseStatistics[selectedExercise].dataTotal, exerciseStatistics[selectedExercise].name + " - Weight lifted", "Timeseries", "Total")}
                        </Stack>
                    </Box>
                </>
            )
        }
    }

    function changeSelectedExercise(exerciseName) {
        for (let i = 0; i < exerciseStatistics.length; i++) {
            if (exerciseStatistics[i].name === exerciseName) {
                setSelectedExercise(i);
                break;
            }
        }
    }

    return (
        <>
            <TopBar key={topBarState} />
            {loggedIn === true ? (
                <>
                    <Box sx={{
                        marginTop: 2,
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                    }}>
                        <Stack spacing={2} direction="row">
                            <Typography variant="h3" gutterBottom align="center">Profile</Typography>
                        </Stack>
                    </Box>

                    <Box sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                    }}>
                        <Stack direction={"row"} spacing={"auto"}>
                            {getPlotComponent(totalLiftedDates, totalLiftedWeightTimeseries, totalLiftedDates, totalLiftedWeight, "Weight lifted", "Timeseries", "Total")}
                            {getPlotComponent(totalWorkoutsDates, totalWorkoutsAmountTimeseries, totalWorkoutsDates, totalWorkoutsAmount, "Finished workouts", "Timeseries", "Total")}

                        </Stack>
                    </Box>

                    <Box sx={{
                        marginTop: 2,
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                    }}>
                        <Stack spacing={2} direction="row">
                            <Typography variant="h3" gutterBottom align="center">Exercises</Typography>
                        </Stack>
                    </Box>

                    <Box sx={{
                        marginTop: 2,
                        marginBottom: 4,
                        marginLeft: "auto",
                        marginRight: "auto",
                        justifyContent: "center",
                        alignItems: "center",
                        flexShrink: 0,
                        maxWidth: "30%",
                        textAlign: "center",
                    }}>
                        <Stack spacing={2} direction="column">
                            <Typography>Pick exercise</Typography>
                            <Autocomplete
                                disablePortal
                                id="combo-box-demo"
                                options={exerciseAutoCompleteList}
                                filterOptions={filterOptions}
                                renderInput={(params) => <TextField {...params} label="Exercise" />}
                                isOptionEqualToValue={(option, value) => option.value === value.value}
                                onChange={(_, data) => {
                                    if (data !== null) {
                                        changeSelectedExercise(data);
                                    }
                                }
                                }
                            />
                        </Stack>
                    </Box>

                    {getExerciseStatistics()}

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
