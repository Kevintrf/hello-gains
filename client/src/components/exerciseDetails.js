import React, { useEffect, useState } from "react";
import { useParams } from "react-router";
import TopBar from "./topBar";
import Stack from '@mui/material/Stack';

export default function ExerciseDetails(props) {
    const params = useParams();
    const [exercises, setExercises] = useState([]);
    const [imageUrl1, setImageUrl1] = useState("");
    const [imageUrl2, setImageUrl2] = useState("");
    const dbUrl = process.env.REACT_APP_DB_URL;
    
    // This method fetches the exercises from the database.
    useEffect(() => {
        getExercises();
        return;
    });

    async function getExercises() {
        if (params.id !== undefined) {
            const response = await fetch(`${dbUrl}exercises/${params.id.toString()}`);
            if (!response.ok) {
                const message = `An error occurred: ${response.statusText}`;
                window.alert(message);
                return;
            }
            const exercises = await response.json();
            setExercises(exercises);
            setImageUrl1("https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/" + exercises.images[0]);
            setImageUrl2("https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/" + exercises.images[1]);
        }
        else if (props.exerciseId !== undefined) {
            const response = await fetch(`${dbUrl}exercises/${props.exerciseId.toString()}`);
            if (!response.ok) {
                const message = `An error occurred: ${response.statusText}`;
                window.alert(message);
                return;
            }
            const exercises = await response.json();
            setExercises(exercises);
            setImageUrl1("https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/" + exercises.images[0]);
            setImageUrl2("https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/" + exercises.images[1]);
        }
    }

    function getTopBar() {
        if (props.noTopbar === true) {
            return;
        }
        return <TopBar />;
    }

    // This following section will display the table with the exercises of individuals.
    return (
        <>
            {getTopBar()}
            <h1>{exercises.name}</h1>
            <h4>Force: {exercises.force ? exercises.force.charAt(0).toUpperCase() + exercises.force.slice(1) : ""}</h4>
            <h4>Level: {exercises.level ? exercises.level.charAt(0).toUpperCase() + exercises.level.slice(1) : ""}</h4>
            <h4>Mechanic: {exercises.mechanic ? exercises.mechanic.charAt(0).toUpperCase() + exercises.mechanic.slice(1) : ""}</h4>
            <h4>Category: {exercises.category ? exercises.category.charAt(0).toUpperCase() + exercises.category.slice(1) : ""}</h4>
            <h4>Equipment: {exercises.equipment ? exercises.equipment.charAt(0).toUpperCase() + exercises.equipment.slice(1) : ""}</h4>
            <h4>Primary muscles: {exercises.primaryMuscles ? exercises.primaryMuscles.map(muscle => muscle.charAt(0).toUpperCase() + muscle.slice(1)).join(', ') : ""}</h4>
            <h4>Secondary muscles: {exercises.secondaryMuscles ? exercises.secondaryMuscles.map(muscle => muscle.charAt(0).toUpperCase() + muscle.slice(1)).join(', ') : ""}</h4>
            <h4>Instructions:</h4>
            {exercises.instructions}

            <br />
            <br />

            <Stack spacing={2} direction="column">
                <img src={imageUrl1} alt="exercise1" width="500px" />
                <img src={imageUrl2} alt="exercise2" width="500px" />
            </Stack>

        </>
    );
}
