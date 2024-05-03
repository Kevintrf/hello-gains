import React from 'react';
import Typography from '@mui/material/Typography';

const NotLoggedIn = () => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '75vh' }}>
            <Typography variant="h1" align="center">You are not logged in</Typography>
            <Typography variant="body1" align="center">Please log in to access this page.</Typography>
        </div>
    );
};

export default NotLoggedIn;
