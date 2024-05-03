// FirebaseUI
import firebase from 'firebase/compat/app';
import * as firebaseui from 'firebaseui'
import 'firebaseui/dist/firebaseui.css'

// React stuff
import { useEffect } from 'react';

// Auth service
import auth from '../auth'

const dbUrl = process.env.REACT_APP_DB_URL;

async function checkUserCreated() {
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ "name": auth.currentUser.displayName })
    };

    const response = await fetch(`${dbUrl}loginSuccess/${auth.currentUser.uid.toString()}`, requestOptions);

    if (!response.ok) {
        const message = `An error occurred: ${response.statusText}`;
        window.alert(message);
        return;
    };
}

const LoginPopup = () => {
    useEffect(() => {
        const ui = firebaseui.auth.AuthUI.getInstance() || new firebaseui.auth.AuthUI(auth);

        ui.start('#firebaseui-auth-container', {
            callbacks: {
                signInSuccessWithAuthResult: function (authResult, redirectUrl) {
                    // Action if the user is authenticated successfully
                    //console.log(auth.currentUser.email)
                    //console.log(auth.currentUser.uid)

                    //Call backend to create user if it does not exist
                    checkUserCreated(auth.currentUser.uid);

                    return false;
                },
                uiShown: function () {
                    // This is what should happen when the form is full loaded. In this example, I hide the loader element.
                    //document.getElementById('loader')!.style.display = 'none';
                }
            },
            signInFlow: 'popup',
            //signInSuccessUrl: '../auth', // This is where should redirect if the sign in is successful.
            signInOptions: [ // This array contains all the ways an user can authenticate in your application. For this example, is only by email.
                firebase.auth.GoogleAuthProvider.PROVIDER_ID,
                {
                    provider: 'microsoft.com',
                    providerName: 'Microsoft',
                },
                {
                    provider: firebase.auth.EmailAuthProvider.PROVIDER_ID,
                    requireDisplayName: true,
                    disableSignUp: {
                        status: false
                    }
                },
            ]
            /*
            tosUrl: 'httpss://www.example.com/terms-conditions', // URL to you terms and conditions.
            privacyPolicyUrl: function() { // URL to your privacy policy
                window.location.assign('httpss://www.example.com/privacy-policy');
            }
            */
        });
    }, []);

    return (
        <>
            <center>
                {/*<h1 className="text-center my-3 title">Sign in</h1>*/}
                <div id="firebaseui-auth-container"></div>
            </center>
        </>
    )
}

export default LoginPopup;