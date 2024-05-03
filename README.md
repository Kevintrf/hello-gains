# Hello Gains
Hello Gains is a workout helper webapp where users can create and track their own workouts. It also has an online functionality that helps users share their workours and encourage each other through a simple social media tab.

# Technology
Hello Gains is built as a MERN stack meaning that it uses MongoDB, ExpressJS, ReactJS and NodeJS. It also uses firebase for authorization, you will need to create your own firebase project in order for the application to work properly.

# Deployment
Install all required frameworks and software

Host a MongoDB server and configure /server/config.env as well as the name of your database in /server/db/conn.js

(Optional) Upload exercise files to database

Point /client/.env to point to your database server

Enter your firebase configuration in /client/src/firebase.js

In order for SSL to work you need to configure the paths to your .pem files in server/server.js

Change the homepage in /client/package.json

Install npm modules for client and server

Host client and server locally using start_dev.sh or deploy to a server of your choice

# Acknowledgements
The database of exercises included in this project is directly taken from the great project free-exercise-db https://github.com/yuhonas/free-exercise-db