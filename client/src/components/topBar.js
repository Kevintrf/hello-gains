import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import { useNavigate } from 'react-router-dom';
import LoginIcon from '@mui/icons-material/Login';
import PersonIcon from '@mui/icons-material/Person';

import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import auth from '../auth'

import LoginPopup from "./loginpopup";
import 'reactjs-popup/dist/index.css';

import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';
import PropTypes from 'prop-types';

import { Link } from "react-router-dom";

//Text that will be displayed next to logo
const appName = "Hello Gains";

function LoginDialog(props) {
    const { onClose, selectedValue, open } = props;

    const handleCloseLoginDialog = () => {
        onClose(selectedValue);
    };

    return (
        <Dialog onClose={handleCloseLoginDialog} open={open}>
            <DialogTitle style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                Sign in
            </DialogTitle>
            <LoginPopup />
        </Dialog>
    );
}

LoginDialog.propTypes = {
    onClose: PropTypes.func.isRequired,
    open: PropTypes.bool.isRequired
};

function ResponsiveAppBar() {
    const [anchorElNav, setAnchorElNav] = React.useState(null);
    const [anchorElUser, setAnchorElUser] = React.useState(null);
    const [username, setUsername] = useState("");
    const [loggedIn, setLoggedIn] = useState(null);
    const navigate = useNavigate();
    const dbUrl = process.env.REACT_APP_DB_URL;

    //Check if logged in
    const [authUser, setAuthUser] = useState(null);

    const [open, setOpenLoginDialog] = React.useState(false);

    const handleClickOpenLoginDialog = () => {
        setOpenLoginDialog(true);
    };

    const handleCloseLoginDialog = (value) => {
        setOpenLoginDialog(false);
    };

    useEffect(() => {
        // eslint-disable-next-line no-unused-vars
        const listen = onAuthStateChanged(auth, (user) => {
            if (user) {
                setAuthUser(user);
                getUsernameFromId(user.uid);
                handleCloseLoginDialog();
                setLoggedIn(true);
            } else {
                setAuthUser(null);
                setLoggedIn(false);
            }
        });
    }, []);

    const handleOpenNavMenu = (event) => {
        setAnchorElNav(event.currentTarget);
    };
    const handleOpenUserMenu = (event) => {
        setAnchorElUser(event.currentTarget);
    };

    const handleCloseNavMenu = () => {
        setAnchorElNav(null);
    };

    const handleCloseUserMenu = () => {
        setAnchorElUser(null);
    };

    const handleClickProfile = () => {
        navigate(`/profile`);
        handleCloseUserMenu();
    };

    const handleClickSettings = () => {
        navigate(`/settings`);
        handleCloseUserMenu();
    };

    const handleClickLogin = () => {
        handleClickOpenLoginDialog();
        handleCloseUserMenu();
    };

    const handleClickLogout = () => {
        signOut(auth)
            .then(() => {
                handleCloseUserMenu();
            })
            .catch((error) => console.log(error));
    };

    async function getUsernameFromId(uid) {
        const response = await fetch(`${dbUrl}users/getNameById/${uid.toString()}`);
        if (!response.ok) {
          const message = `An error occurred: ${response.statusText}`;
          window.alert(message);
          return;
        }
  
        let collectedUsername = await response.json();
        setUsername(collectedUsername);
    }

    function LoginGreetings() {
        if (loggedIn) {
            var greetings = "";
            if (username !== null){
                greetings = "Hello, " + username + "!";
            }
            else {
                greetings = "Hello!";
            }
            return greetings;
        } 
        else if (loggedIn === null) {
            return <></>
        }
        else {
            return "Hello, stranger! Why don't you sign in?"
        }
    }

    function LoginLogoutMenuItem() {
        if (authUser) {
            return <MenuItem onClick={handleClickLogout}>Log out</MenuItem>;
        } else {
            return <MenuItem onClick={handleClickLogin}>Log in</MenuItem>;
        }
    }

    function LoggedInIcon() {
        if (loggedIn) {
            return <PersonIcon sx={{ display: { color: "black" } }} />
        } else if (loggedIn === null) {
            return <></>
        } else {
            return <LoginIcon sx={{ display: { color: "black" } }} />
        }
    }

    return (
        <AppBar position="static">
            <Container maxWidth="xl">
                <Toolbar disableGutters>
                    <FitnessCenterIcon sx={{ display: { xs: 'none', md: 'flex', color: "black" }, mr: 1 }} />
                    <Typography
                        variant="h6"
                        noWrap
                        component="a"
                        href="/"
                        sx={{
                            mr: 2,
                            display: { xs: 'none', md: 'flex' },
                            fontFamily: 'monospace',
                            fontWeight: 700,
                            letterSpacing: '.3rem',
                            color: 'inherit',
                            textDecoration: 'none',
                        }}
                    >
                        {appName}
                    </Typography>

                    <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
                        <IconButton
                            size="large"
                            aria-label="account of current user"
                            aria-controls="menu-appbar"
                            aria-haspopup="true"
                            onClick={handleOpenNavMenu}
                            color="inherit"
                        >
                            <MenuIcon />
                        </IconButton>
                        <Menu
                            id="menu-appbar"
                            anchorEl={anchorElNav}
                            anchorOrigin={{
                                vertical: 'bottom',
                                horizontal: 'left',
                            }}
                            keepMounted
                            transformOrigin={{
                                vertical: 'top',
                                horizontal: 'left',
                            }}
                            open={Boolean(anchorElNav)}
                            onClose={handleCloseNavMenu}
                            sx={{
                                display: { xs: 'block', md: 'none' },
                            }}
                        >
                            <Link to="/exercises" style={{ textDecoration: 'none', color: "black" }}>
                                <MenuItem key="exercises" onClick={handleCloseNavMenu}>
                                    <Typography textAlign="center">Exercises</Typography>
                                </MenuItem>
                            </Link>

                            <Link to="/workout" style={{ textDecoration: 'none', color: "black" }}>
                                <MenuItem key="workout" onClick={handleCloseNavMenu}>
                                    <Typography textAlign="center">Workout</Typography>
                                </MenuItem>
                            </Link>

                            <Link to="/workout/history" style={{ textDecoration: 'none', color: "black" }}>
                                <MenuItem key="workout" onClick={handleCloseNavMenu}>
                                    <Typography textAlign="center">Workout History</Typography>
                                </MenuItem>
                            </Link>

                            <Link to="/community" style={{ textDecoration: 'none', color: "black" }}>
                                <MenuItem key="community" onClick={handleCloseNavMenu}>
                                    <Typography textAlign="center">Community</Typography>
                                </MenuItem>
                            </Link>

                        </Menu>
                    </Box>
                    <FitnessCenterIcon sx={{ display: { xs: 'flex', md: 'none', color: "black" }, mr: 1 }} />
                    <Typography
                        variant="h5"
                        noWrap
                        component="a"
                        href="/"
                        sx={{
                            mr: 2,
                            display: { xs: 'flex', md: 'none' },
                            flexGrow: 1,
                            fontFamily: 'monospace',
                            fontWeight: 700,
                            letterSpacing: '.3rem',
                            color: 'inherit',
                            textDecoration: 'none',
                        }}
                    >
                        {appName}
                    </Typography>
                    <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
                            <Link to="/exercises" style={{ textDecoration: 'none' }}>
                                <Button
                                    key="exercises"
                                    onClick={handleCloseNavMenu}
                                    sx={{ my: 2, color: 'white', display: 'block' }}
                                >
                                    Exercises
                                </Button>
                            </Link>
                            <Link to="/workout" style={{ textDecoration: 'none' }}>
                                <Button
                                    key="workout"
                                    onClick={handleCloseNavMenu}
                                    sx={{ my: 2, color: 'white', display: 'block' }}
                                >
                                    Workout
                                </Button>
                            </Link>
                            <Link to="/workout/history" style={{ textDecoration: 'none' }}>
                                <Button
                                    key="workout"
                                    onClick={handleCloseNavMenu}
                                    sx={{ my: 2, color: 'white', display: 'block' }}
                                >
                                    Workout History
                                </Button>
                            </Link>
                            <Link to="/community" style={{ textDecoration: 'none' }}>
                                <Button
                                    key="community"
                                    onClick={handleCloseNavMenu}
                                    sx={{ my: 2, color: 'white', display: 'block' }}
                                >
                                    Community
                                </Button>
                            </Link>
                    </Box>
                    <Typography
                        variant="h6"
                        noWrap
                        sx={{
                            mr: 2,
                            display: { xs: 'none', md: 'flex' },
                            fontFamily: 'monospace',
                            fontWeight: 600,
                            letterSpacing: '.0005rem',
                            color: 'inherit',
                            textDecoration: 'none',
                        }}>
                        {LoginGreetings()}
                    </Typography>
                    <Box sx={{ flexGrow: 0 }}>
                        <Tooltip title="My profile">
                            <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                                {LoggedInIcon()}
                            </IconButton>
                        </Tooltip>
                        <Menu
                            sx={{ mt: '45px' }}
                            id="menu-appbar"
                            anchorEl={anchorElUser}
                            anchorOrigin={{
                                vertical: 'top',
                                horizontal: 'right',
                            }}
                            keepMounted
                            transformOrigin={{
                                vertical: 'top',
                                horizontal: 'right',
                            }}
                            open={Boolean(anchorElUser)}
                            onClose={handleCloseUserMenu}
                        >
                            <MenuItem onClick={handleClickProfile}>Profile</MenuItem>
                            <MenuItem onClick={handleClickSettings}>Settings</MenuItem>
                            {LoginLogoutMenuItem()}
                            <LoginDialog
                                open={open}
                                onClose={handleCloseLoginDialog}
                            />

                        </Menu>
                    </Box>
                </Toolbar>
            </Container>
        </AppBar>
    );
}
export default ResponsiveAppBar;