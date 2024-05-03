import React, { useEffect, useState } from "react";
import { useParams } from "react-router";
import TopBar from "./topBar";
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';

export default function Home() {

    // This method fetches the exercises from the database.
    useEffect(() => {
        return;
    });

    // This following section will display the table with the exercises of individuals.
    return (
        <>
            <TopBar />
            <Box sx={{
                marginTop: 2,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
            }}>
                <Stack spacing={2} direction="column">
                    <Typography variant="h3" gutterBottom align="center">Welcome to Hello Gains</Typography>
                    <Typography variant="h5" gutterBottom align="center">This is a workout application that allows you to create and use your own or already made workout programs.</Typography>
                    <Typography variant="h5" gutterBottom align="center">You can also view your workout history and see your progress.</Typography>
                    <Typography variant="h5" gutterBottom align="center">To get started, click on any of the buttons below or in tab above.</Typography>
                    <Button variant="contained" color="primary" href="/exercises">Exercises</Button>
                    <Button variant="contained" color="primary" href="/workout">Workout</Button>
                    <Button variant="contained" color="primary" href="/workout/history">Workout History</Button>
                    <Button variant="contained" color="primary" href="/community">Community</Button>
                </Stack>
            </Box>
        </>
    );
}
