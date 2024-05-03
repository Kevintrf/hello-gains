import React, { useEffect } from "react";
import TopBar from "./topBar";
import { Box } from '@mui/material';
import { Stack } from '@mui/material';
import { Typography } from '@mui/material';
import { Card } from '@mui/material';
import { Button } from '@mui/material';
import { Avatar } from '@mui/material';
import { Badge } from '@mui/material';
import { useState } from 'react';
import auth from '../auth'
import { onAuthStateChanged } from "firebase/auth";
import { Unstable_Popup as Popup } from '@mui/base/Unstable_Popup';
import { styled } from '@mui/system';
import { v4 as uuidv4 } from 'uuid';

export default function CommunityPost(props) {
    const dbUrl = process.env.REACT_APP_DB_URL;

    const [title, setTitle] = useState(null);
    const [subtitle, setSubtitle] = useState(null);
    const [likes, setLikes] = useState(null);
    const [liked, setLiked] = useState(null);
    const [username, setUsername] = useState("Unknown");
    const [myPost, setMyPost] = useState(false);
    const [timestamp, setTimestamp] = useState(null);
    const [anchor, setAnchor] = React.useState(null);
    const [likedUsers, setLikedUsers] = useState([]);

    const handleClick = (event) => {
        setAnchor(anchor ? null : event.currentTarget);
    };

    const open = Boolean(anchor);
    const id = open ? 'simple-popper' : undefined;

    useEffect(() => {
        // eslint-disable-next-line no-unused-vars
        const listen = onAuthStateChanged(auth, (user) => {
            if (user) {
                getPostUsername(props.postData.userAuthId);
                checkIfLiked();
                checkIfMyPost();
                getLikes();
                getLikedUsers(props.postData.likedBy);
            }
        });
    }, []);

    async function getPostUsername(userAuthId) {
        const response = await fetch(`${dbUrl}users/getNameById/${userAuthId.toString()}`);
        if (!response.ok) {
            const message = `An error occurred: ${response.statusText}`;
            window.alert(message);
            return;
        }

        let username = await response.json();
        setUsername(username);
    }

    async function getUsername(userAuthId) {
        const response = await fetch(`${dbUrl}users/getNameById/${userAuthId.toString()}`);
        if (!response.ok) {
            const message = `An error occurred: ${response.statusText}`;
            window.alert(message);
            return;
        }

        let username = await response.json();
        return username;
    }

    function getLikes() {
        let likes = props.postData.likedBy ? props.postData.likedBy.length : 0;
        setLikes(likes);
    }

    function checkIfLiked() {
        if (props.postData.likedBy === null || !props.postData.likedBy.includes(auth.currentUser.uid)) {
            setLiked(false);
        }
        else {
            setLiked(true);
        }
    }

    function checkIfMyPost() {
        if (props.postData.userAuthId === auth.currentUser.uid) {
            setMyPost(true);
        }
        else {
            setMyPost(false);
        }
    }

    async function changeLikeStatus(like) {
        if (like) {
            const response = await fetch(`${dbUrl}community/likePost/${props.postData._id.toString()}/${auth.currentUser.uid.toString()}`, { method: 'POST', headers: { 'Content-Type': 'application/json' } });
            if (!response.ok) {
                const message = `An error occurred: ${response.statusText}`;
                window.alert(message);
                return;
            }
            else {
                setLiked(true);
                setLikes(likes + 1);
                updateLikesFromDb();
            }
        }
        else {
            const response = await fetch(`${dbUrl}community/unlikePost/${props.postData._id.toString()}/${auth.currentUser.uid.toString()}`, { method: 'POST', headers: { 'Content-Type': 'application/json' } });
            if (!response.ok) {
                const message = `An error occurred: ${response.statusText}`;
                window.alert(message);
                return;
            }
            else {
                setLiked(false);
                setLikes(likes - 1);
                updateLikesFromDb();
            }
        }
    }

    function getCongratulateButton() {
        if (myPost) {
            return (
                <>
                </>
            )
        }
        else if (liked) {
            return (
                <Box sx={{ display: "flex", justifyContent: "center", alignItems: "flex-end", marginTop: 2, marginBottom: 2 }}>
                    <Button align="center" variant="outlined" onClick={() => changeLikeStatus(false)}>Stop congratulating</Button>
                </Box>
            )
        }
        else {
            return (
                <Box sx={{ display: "flex", justifyContent: "center", alignItems: "flex-end", marginTop: 2, marginBottom: 2 }}>
                    <Button align="center" variant="contained" onClick={() => changeLikeStatus(true)}>💪 Congratulate</Button>
                </Box>
            )
        }
    }

    async function updateLikesFromDb() {
        const response = await fetch(`${dbUrl}community/getPost/${props.postData._id.toString()}`);
        if (!response.ok) {
            const message = `An error occurred: ${response.statusText}`;
            window.alert(message);
            return;
        }

        let post = await response.json();
        setAnchor(null);
        getLikedUsers(post[0].likedBy);
    }

    const grey = {
        50: '#F3F6F9',
        100: '#E5EAF2',
        200: '#DAE2ED',
        300: '#C7D0DD',
        400: '#B0B8C4',
        500: '#9DA8B7',
        600: '#6B7A90',
        700: '#434D5B',
        800: '#303740',
        900: '#1C2025',
    };

    const blue = {
        200: '#99CCFF',
        300: '#66B2FF',
        400: '#3399FF',
        500: '#007FFF',
        600: '#0072E5',
        700: '#0066CC',
    };

    const PopupBody = styled('div')(
        ({ theme }) => `
        width: max-content;
        padding: 12px 16px;
        margin: 8px;
        border-radius: 8px;
        border: 1px solid ${theme.palette.mode === 'dark' ? grey[700] : grey[200]};
        background-color: ${theme.palette.mode === 'dark' ? grey[900] : '#fff'};
        box-shadow: ${theme.palette.mode === 'dark'
                ? `0px 4px 8px rgb(0 0 0 / 0.7)`
                : `0px 4px 8px rgb(0 0 0 / 0.1)`
            };
        font-family: 'IBM Plex Sans', sans-serif;
        font-size: 0.875rem;
        z-index: 1;
      `,
    );

    async function getLikedUsers(likedUsers) {
        if (likedUsers !== null && likedUsers.length > 0) {
            let likedUsernames = [];

            likedUsers.map(async function (user) {
                likedUsernames.push(await getUsername(user));
            });

            setLikedUsers(likedUsernames);
        }
        else {
            setLikedUsers([]);
        }
    }

    function printLikedUsers() {
        if (likedUsers === null) {
            return <Typography variant="h6" gutterBottom align="center">Loading...</Typography>;
        }
        else if (likedUsers.length === 0) {
            return <Typography variant="h6" gutterBottom align="center">No one has congratulated this post yet</Typography>;
        }
        else {
            return (
                <Stack spacing={2}>
                    {likedUsers.map(function (user) {
                        return (
                            <React.Fragment key={uuidv4()}>
                                <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                                    <Avatar sx={{ bgcolor: blue[500], marginRight: 2 }}>{user.charAt(0).toUpperCase()}</Avatar>
                                    <Typography variant="h6" gutterBottom align="center">{user}</Typography>
                                </Box>
                            </React.Fragment>
                        )
                    })}
                </Stack>
            )
        }
    }

    return (
        <Box sx={{
            marginTop: 2,
            marginLeft: "auto",
            marginRight: "auto",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
        }}>
            <Card sx={{
                width: 500,
                height: "auto",
                justifyContent: "center",
            }}>

                <Box sx={{
                    marginTop: 2,
                    marginBottom: 2,
                    marginLeft: "auto",
                    marginRight: "auto",
                    justifyContent: "center",
                    alignItems: "center",
                }}>
                    <Typography variant="h5" gutterBottom align="center">{username} {props.postData.title}</Typography>
                    <Typography variant="h6" gutterBottom align="center">{props.postData.subtitle}</Typography>

                    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", userSelect: "none", marginTop: 2 }}>
                        <Badge color="secondary" overlap="circular" badgeContent={String(likes)} sx={{ cursor: 'pointer' }} onClick={handleClick} aria-describedby={id} >
                            <Box component="span" sx={{ bgcolor: 'primary.main', width: 40, height: 40, borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>💪</Box>
                        </Badge>
                        <Popup id={id} open={open} anchor={anchor} placement="right">
                            <PopupBody>{printLikedUsers()}</PopupBody>
                        </Popup>
                    </Box>


                    {getCongratulateButton()}

                </Box>
            </Card>
        </Box>
    );
}
