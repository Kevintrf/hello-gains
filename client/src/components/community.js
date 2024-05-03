import React, { useEffect } from "react";
import TopBar from "./topBar";
import { Box } from '@mui/material';
import { Stack } from '@mui/material';
import { Typography } from '@mui/material';
import { Card } from '@mui/material';
import { Button } from '@mui/material';
import { Avatar } from '@mui/material';
import { Badge } from '@mui/material';
import CommunityPost from "./communityPost";
import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import auth from '../auth'
import { onAuthStateChanged } from "firebase/auth";
import NotLoggedIn from "./notLoggedIn";

export default function Community() {
    const dbUrl = process.env.REACT_APP_DB_URL;

    const [posts, setPosts] = useState(null);
    const [loggedIn, setLoggedIn] = useState(null);

    useEffect(() => {
        // eslint-disable-next-line no-unused-vars
        const listen = onAuthStateChanged(auth, (user) => {
            if (user) {
                getLatestPosts();
                setLoggedIn(true);
            }
            else {
                setLoggedIn(false);
            }
        });
    }, []);

    async function getLatestPosts() {
        const response = await fetch(`${dbUrl}community/getLatestPosts`);
        if (!response.ok) {
            const message = `An error occurred: ${response.statusText}`;
            window.alert(message);
            return;
        }

        let latestPosts = await response.json();
        setPosts(latestPosts);
    }

    async function getPostsAmount() {
        const response = await fetch(`${dbUrl}community/getPostsAmount`);
        if (!response.ok) {
            const message = `An error occurred: ${response.statusText}`;
            window.alert(message);
            return;
        }

        return await response.json();
    }

    async function getPaginatedPosts(start, end) {
        const response = await fetch(`${dbUrl}community/getPaginatedPosts/${start.toString()}/${end.toString()}`);
        if (!response.ok) {
            const message = `An error occurred: ${response.statusText}`;
            window.alert(message);
            return;
        }

        return await response.json();
    }

    function printPosts() {
        if (posts === null) {
            return <Typography variant="h6" gutterBottom align="center">Loading...</Typography>;
        }
        else {
            return (
                <Stack spacing={2}>
                    {posts.toReversed().map(function (post, index) {
                        return (
                            <React.Fragment key={uuidv4()}>
                                <CommunityPost postData={post} />
                            </React.Fragment>
                        )
                    })}
                </Stack>
            )
        }
    }

    // This following section will display the table with the exercises of individuals.
    return (
        <>
            <TopBar />
            {loggedIn === true ? (
                <>
                    <Box sx={{
                        marginTop: 2,
                        marginBottom: 2,
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                    }}>
                        <Stack spacing={2} direction="row">
                            <Typography variant="h3" gutterBottom align="center">Community</Typography>
                        </Stack>
                    </Box>

                    {printPosts()}
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
