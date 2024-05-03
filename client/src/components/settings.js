import React, { useEffect, useState } from "react";
import { useParams } from "react-router";
import TopBar from "./topBar";
import auth from '../auth'
import NotLoggedIn from "./notLoggedIn";
import { onAuthStateChanged } from "firebase/auth";
import { Box, Stack, Typography } from "@mui/material";
import { TextField, Button } from "@mui/material";

export default function Settings() {
    const dbUrl = process.env.REACT_APP_DB_URL;
    const [loggedIn, setLoggedIn] = useState(null);
    const [username, setUsername] = useState("");
    const [topBarState, setTopBarState] = useState(username);

    useEffect(() => {
        // eslint-disable-next-line no-unused-vars
        const listen = onAuthStateChanged(auth, (user) => {
            if (user) {
                setLoggedIn(true);
                setUsername(user.displayName);
            } else {
                setLoggedIn(false);
            }
        });
    }, []);

    async function handleUsernameChange() {
        if (username === "" || username === null || username === undefined) {
            window.alert("Your new username cannot be empty!");
        }
        else {
            const requestOptions = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ "username": username })
            };

            const response = await fetch(`${dbUrl}users/changeUsername/${auth.currentUser.uid.toString()}`, requestOptions);

            if (!response.ok) {
                const message = `An error occurred: ${response.statusText}`;
                window.alert(message);
                return;
            };

            setTopBarState(username);
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
                            <Typography variant="h3" gutterBottom>Settings</Typography>
                        </Stack>
                    </Box>

                    <Box sx={{
                        marginTop: 2,
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                    }}>
                        <Stack spacing={2} direction="column">
                            <Typography variant="h5" gutterBottom>Change username</Typography>
                            <TextField
                                label="Username"
                                variant="outlined"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />

                            <Button variant="contained" onClick={() => handleUsernameChange()}>
                                Change username
                            </Button>
                        </Stack>
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
