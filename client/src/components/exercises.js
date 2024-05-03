import React, { useEffect, useState } from "react";
import { v4 as uuidv4 } from 'uuid';
import 'reactjs-popup/dist/index.css';
import TopBar from "./topBar";
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { Typography } from "@mui/material";
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import { matchSorter } from 'match-sorter';

import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import ExerciseDetails from './exerciseDetails';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';

export default function ExerciseList() {
    const dbUrl = process.env.REACT_APP_DB_URL;
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(25);
    const [exercisesAmount, setExercisesAmount] = useState(0);
    const [rows, setRows] = useState([]);

    const [open, setOpen] = React.useState(false);
    const [selectedExercise, setSelectedExercise] = React.useState("");

    const handleClose = () => {
        setOpen(false);
        setSelectedExercise("");
    };

    const exerciseAutoCompleteList = [
        { label: "3/4 Sit-Up" },
        { label: "90/90 Hamstring" },
        { label: "Ab Crunch Machine" },
        { label: "Ab Roller" },
        { label: "Adductor" },
        { label: "Adductor/Groin" },
        { label: "Advanced Kettlebell Windmill" },
        { label: "Air Bike" },
        { label: "All Fours Quad Stretch" },
        { label: "Alternate Hammer Curl" },
        { label: "Alternate Heel Touchers" },
        { label: "Alternate Incline Dumbbell Curl" },
        { label: "Alternate Leg Diagonal Bound" },
        { label: "Alternating Cable Shoulder Press" },
        { label: "Alternating Deltoid Raise" },
        { label: "Alternating Floor Press" },
        { label: "Alternating Hang Clean" },
        { label: "Alternating Kettlebell Press" },
        { label: "Alternating Kettlebell Row" },
        { label: "Alternating Renegade Row" },
        { label: "Ankle Circles" },
        { label: "Ankle On The Knee" },
        { label: "Anterior Tibialis-SMR" },
        { label: "Anti-Gravity Press" },
        { label: "Arm Circles" },
        { label: "Arnold Dumbbell Press" },
        { label: "Around The Worlds" },
        { label: "Atlas Stone Trainer" },
        { label: "Atlas Stones" },
        { label: "Axle Deadlift" },
        { label: "Back Flyes - With Bands" },
        { label: "Backward Drag" },
        { label: "Backward Medicine Ball Throw" },
        { label: "Balance Board" },
        { label: "Ball Leg Curl" },
        { label: "Band Assisted Pull-Up" },
        { label: "Band Good Morning" },
        { label: "Band Good Morning (Pull Through)" },
        { label: "Band Hip Adductions" },
        { label: "Band Pull Apart" },
        { label: "Band Skull Crusher" },
        { label: "Barbell Ab Rollout" },
        { label: "Barbell Ab Rollout - On Knees" },
        { label: "Barbell Bench Press - Medium Grip" },
        { label: "Barbell Curl" },
        { label: "Barbell Curls Lying Against An Incline" },
        { label: "Barbell Deadlift" },
        { label: "Barbell Full Squat" },
        { label: "Barbell Glute Bridge" },
        { label: "Barbell Guillotine Bench Press" },
        { label: "Barbell Hack Squat" },
        { label: "Barbell Hip Thrust" },
        { label: "Barbell Incline Bench Press - Medium Grip" },
        { label: "Barbell Incline Shoulder Raise" },
        { label: "Barbell Lunge" },
        { label: "Barbell Rear Delt Row" },
        { label: "Barbell Rollout from Bench" },
        { label: "Barbell Seated Calf Raise" },
        { label: "Barbell Shoulder Press" },
        { label: "Barbell Shrug" },
        { label: "Barbell Shrug Behind The Back" },
        { label: "Barbell Side Bend" },
        { label: "Barbell Side Split Squat" },
        { label: "Barbell Squat" },
        { label: "Barbell Squat To A Bench" },
        { label: "Barbell Step Ups" },
        { label: "Barbell Walking Lunge" },
        { label: "Battling Ropes" },
        { label: "Bear Crawl Sled Drags" },
        { label: "Behind Head Chest Stretch" },
        { label: "Bench Dips" },
        { label: "Bench Jump" },
        { label: "Bench Press - Powerlifting" },
        { label: "Bench Press - With Bands" },
        { label: "Bench Press with Chains" },
        { label: "Bench Sprint" },
        { label: "Bent-Arm Barbell Pullover" },
        { label: "Bent-Arm Dumbbell Pullover" },
        { label: "Bent-Knee Hip Raise" },
        { label: "Bent Over Barbell Row" },
        { label: "Bent Over Dumbbell Rear Delt Raise With Head On Bench" },
        { label: "Bent Over Low-Pulley Side Lateral" },
        { label: "Bent Over One-Arm Long Bar Row" },
        { label: "Bent Over Two-Arm Long Bar Row" },
        { label: "Bent Over Two-Dumbbell Row" },
        { label: "Bent Over Two-Dumbbell Row With Palms In" },
        { label: "Bent Press" },
        { label: "Bicycling" },
        { label: "Bicycling, Stationary" },
        { label: "Board Press" },
        { label: "Body-Up" },
        { label: "Body Tricep Press" },
        { label: "Bodyweight Flyes" },
        { label: "Bodyweight Mid Row" },
        { label: "Bodyweight Squat" },
        { label: "Bodyweight Walking Lunge" },
        { label: "Bosu Ball Cable Crunch With Side Bends" },
        { label: "Bottoms-Up Clean From The Hang Position" },
        { label: "Bottoms Up" },
        { label: "Box Jump (Multiple Response)" },
        { label: "Box Skip" },
        { label: "Box Squat" },
        { label: "Box Squat with Bands" },
        { label: "Box Squat with Chains" },
        { label: "Brachialis-SMR" },
        { label: "Bradford/Rocky Presses" },
        { label: "Butt-Ups" },
        { label: "Butt Lift (Bridge)" },
        { label: "Butterfly" },
        { label: "Cable Chest Press" },
        { label: "Cable Crossover" },
        { label: "Cable Crunch" },
        { label: "Cable Deadlifts" },
        { label: "Cable Hammer Curls - Rope Attachment" },
        { label: "Cable Hip Adduction" },
        { label: "Cable Incline Pushdown" },
        { label: "Cable Incline Triceps Extension" },
        { label: "Cable Internal Rotation" },
        { label: "Cable Iron Cross" },
        { label: "Cable Judo Flip" },
        { label: "Cable Lying Triceps Extension" },
        { label: "Cable One Arm Tricep Extension" },
        { label: "Cable Preacher Curl" },
        { label: "Cable Rear Delt Fly" },
        { label: "Cable Reverse Crunch" },
        { label: "Cable Rope Overhead Triceps Extension" },
        { label: "Cable Rope Rear-Delt Rows" },
        { label: "Cable Russian Twists" },
        { label: "Cable Seated Crunch" },
        { label: "Cable Seated Lateral Raise" },
        { label: "Cable Shoulder Press" },
        { label: "Cable Shrugs" },
        { label: "Cable Wrist Curl" },
        { label: "Calf-Machine Shoulder Shrug" },
        { label: "Calf Press" },
        { label: "Calf Press On The Leg Press Machine" },
        { label: "Calf Raise On A Dumbbell" },
        { label: "Calf Raises - With Bands" },
        { label: "Calf Stretch Elbows Against Wall" },
        { label: "Calf Stretch Hands Against Wall" },
        { label: "Calves-SMR" },
        { label: "Car Deadlift" },
        { label: "Car Drivers" },
        { label: "Carioca Quick Step" },
        { label: "Cat Stretch" },
        { label: "Catch and Overhead Throw" },
        { label: "Chain Handle Extension" },
        { label: "Chain Press" },
        { label: "Chair Leg Extended Stretch" },
        { label: "Chair Lower Back Stretch" },
        { label: "Chair Squat" },
        { label: "Chair Upper Body Stretch" },
        { label: "Chest And Front Of Shoulder Stretch" },
        { label: "Chest Push from 3 point stance" },
        { label: "Chest Push (multiple response)" },
        { label: "Chest Push (single response)" },
        { label: "Chest Push with Run Release" },
        { label: "Chest Stretch on Stability Ball" },
        { label: "Child's Pose" },
        { label: "Chin-Up" },
        { label: "Chin To Chest Stretch" },
        { label: "Circus Bell" },
        { label: "Clean" },
        { label: "Clean Deadlift" },
        { label: "Clean Pull" },
        { label: "Clean Shrug" },
        { label: "Clean and Jerk" },
        { label: "Clean and Press" },
        { label: "Clean from Blocks" },
        { label: "Clock Push-Up" },
        { label: "Close-Grip Barbell Bench Press" },
        { label: "Close-Grip Dumbbell Press" },
        { label: "Close-Grip EZ-Bar Curl with Band" },
        { label: "Close-Grip EZ-Bar Press" },
        { label: "Close-Grip EZ Bar Curl" },
        { label: "Close-Grip Front Lat Pulldown" },
        { label: "Close-Grip Push-Up off of a Dumbbell" },
        { label: "Close-Grip Standing Barbell Curl" },
        { label: "Cocoons" },
        { label: "Conan's Wheel" },
        { label: "Concentration Curls" },
        { label: "Cross-Body Crunch" },
        { label: "Cross Body Hammer Curl" },
        { label: "Cross Over - With Bands" },
        { label: "Crossover Reverse Lunge" },
        { label: "Crucifix" },
        { label: "Crunch - Hands Overhead" },
        { label: "Crunch - Legs On Exercise Ball" },
        { label: "Crunches" },
        { label: "Cuban Press" },
        { label: "Dancer's Stretch" },
        { label: "Dead Bug" },
        { label: "Deadlift with Bands" },
        { label: "Deadlift with Chains" },
        { label: "Decline Barbell Bench Press" },
        { label: "Decline Close-Grip Bench To Skull Crusher" },
        { label: "Decline Crunch" },
        { label: "Decline Dumbbell Bench Press" },
        { label: "Decline Dumbbell Flyes" },
        { label: "Decline Dumbbell Triceps Extension" },
        { label: "Decline EZ Bar Triceps Extension" },
        { label: "Decline Oblique Crunch" },
        { label: "Decline Push-Up" },
        { label: "Decline Reverse Crunch" },
        { label: "Decline Smith Press" },
        { label: "Deficit Deadlift" },
        { label: "Depth Jump Leap" },
        { label: "Dip Machine" },
        { label: "Dips - Chest Version" },
        { label: "Dips - Triceps Version" },
        { label: "Donkey Calf Raises" },
        { label: "Double Kettlebell Alternating Hang Clean" },
        { label: "Double Kettlebell Jerk" },
        { label: "Double Kettlebell Push Press" },
        { label: "Double Kettlebell Snatch" },
        { label: "Double Kettlebell Windmill" },
        { label: "Double Leg Butt Kick" },
        { label: "Downward Facing Balance" },
        { label: "Drag Curl" },
        { label: "Drop Push" },
        { label: "Dumbbell Alternate Bicep Curl" },
        { label: "Dumbbell Bench Press" },
        { label: "Dumbbell Bench Press with Neutral Grip" },
        { label: "Dumbbell Bicep Curl" },
        { label: "Dumbbell Clean" },
        { label: "Dumbbell Floor Press" },
        { label: "Dumbbell Flyes" },
        { label: "Dumbbell Incline Row" },
        { label: "Dumbbell Incline Shoulder Raise" },
        { label: "Dumbbell Lunges" },
        { label: "Dumbbell Lying One-Arm Rear Lateral Raise" },
        { label: "Dumbbell Lying Pronation" },
        { label: "Dumbbell Lying Rear Lateral Raise" },
        { label: "Dumbbell Lying Supination" },
        { label: "Dumbbell One-Arm Shoulder Press" },
        { label: "Dumbbell One-Arm Triceps Extension" },
        { label: "Dumbbell One-Arm Upright Row" },
        { label: "Dumbbell Prone Incline Curl" },
        { label: "Dumbbell Raise" },
        { label: "Dumbbell Rear Lunge" },
        { label: "Dumbbell Scaption" },
        { label: "Dumbbell Seated Box Jump" },
        { label: "Dumbbell Seated One-Leg Calf Raise" },
        { label: "Dumbbell Shoulder Press" },
        { label: "Dumbbell Shrug" },
        { label: "Dumbbell Side Bend" },
        { label: "Dumbbell Squat" },
        { label: "Dumbbell Squat To A Bench" },
        { label: "Dumbbell Step Ups" },
        { label: "Dumbbell Tricep Extension -Pronated Grip" },
        { label: "Dynamic Back Stretch" },
        { label: "Dynamic Chest Stretch" },
        { label: "EZ-Bar Curl" },
        { label: "EZ-Bar Skullcrusher" },
        { label: "Elbow Circles" },
        { label: "Elbow to Knee" },
        { label: "Elbows Back" },
        { label: "Elevated Back Lunge" },
        { label: "Elevated Cable Rows" },
        { label: "Elliptical Trainer" },
        { label: "Exercise Ball Crunch" },
        { label: "Exercise Ball Pull-In" },
        { label: "Extended Range One-Arm Kettlebell Floor Press" },
        { label: "External Rotation" },
        { label: "External Rotation with Band" },
        { label: "External Rotation with Cable" },
        { label: "Face Pull" },
        { label: "Farmer's Walk" },
        { label: "Fast Skipping" },
        { label: "Finger Curls" },
        { label: "Flat Bench Cable Flyes" },
        { label: "Flat Bench Leg Pull-In" },
        { label: "Flat Bench Lying Leg Raise" },
        { label: "Flexor Incline Dumbbell Curls" },
        { label: "Floor Glute-Ham Raise" },
        { label: "Floor Press" },
        { label: "Floor Press with Chains" },
        { label: "Flutter Kicks" },
        { label: "Foot-SMR" },
        { label: "Forward Drag with Press" },
        { label: "Frankenstein Squat" },
        { label: "Freehand Jump Squat" },
        { label: "Frog Hops" },
        { label: "Frog Sit-Ups" },
        { label: "Front Barbell Squat" },
        { label: "Front Barbell Squat To A Bench" },
        { label: "Front Box Jump" },
        { label: "Front Cable Raise" },
        { label: "Front Cone Hops (or hurdle hops)" },
        { label: "Front Dumbbell Raise" },
        { label: "Front Incline Dumbbell Raise" },
        { label: "Front Leg Raises" },
        { label: "Front Plate Raise" },
        { label: "Front Raise And Pullover" },
        { label: "Front Squat (Clean Grip)" },
        { label: "Front Squats With Two Kettlebells" },
        { label: "Front Two-Dumbbell Raise" },
        { label: "Full Range-Of-Motion Lat Pulldown" },
        { label: "Gironda Sternum Chins" },
        { label: "Glute Ham Raise" },
        { label: "Glute Kickback" },
        { label: "Goblet Squat" },
        { label: "Good Morning" },
        { label: "Good Morning off Pins" },
        { label: "Gorilla Chin/Crunch" },
        { label: "Groin and Back Stretch" },
        { label: "Groiners" },
        { label: "Hack Squat" },
        { label: "Hammer Curls" },
        { label: "Hammer Grip Incline DB Bench Press" },
        { label: "Hamstring-SMR" },
        { label: "Hamstring Stretch" },
        { label: "Handstand Push-Ups" },
        { label: "Hang Clean" },
        { label: "Hang Clean - Below the Knees" },
        { label: "Hang Snatch" },
        { label: "Hang Snatch - Below Knees" },
        { label: "Hanging Bar Good Morning" },
        { label: "Hanging Leg Raise" },
        { label: "Hanging Pike" },
        { label: "Heaving Snatch Balance" },
        { label: "Heavy Bag Thrust" },
        { label: "High Cable Curls" },
        { label: "Hip Circles (prone)" },
        { label: "Hip Extension with Bands" },
        { label: "Hip Flexion with Band" },
        { label: "Hip Lift with Band" },
        { label: "Hug A Ball" },
        { label: "Hug Knees To Chest" },
        { label: "Hurdle Hops" },
        { label: "Hyperextensions (Back Extensions)" },
        { label: "Hyperextensions With No Hyperextension Bench" },
        { label: "IT Band and Glute Stretch" },
        { label: "Iliotibial Tract-SMR" },
        { label: "Inchworm" },
        { label: "Incline Barbell Triceps Extension" },
        { label: "Incline Bench Pull" },
        { label: "Incline Cable Chest Press" },
        { label: "Incline Cable Flye" },
        { label: "Incline Dumbbell Bench With Palms Facing In" },
        { label: "Incline Dumbbell Curl" },
        { label: "Incline Dumbbell Flyes" },
        { label: "Incline Dumbbell Flyes - With A Twist" },
        { label: "Incline Dumbbell Press" },
        { label: "Incline Hammer Curls" },
        { label: "Incline Inner Biceps Curl" },
        { label: "Incline Push-Up" },
        { label: "Incline Push-Up Close-Grip" },
        { label: "Incline Push-Up Depth Jump" },
        { label: "Incline Push-Up Medium" },
        { label: "Incline Push-Up Reverse Grip" },
        { label: "Incline Push-Up Wide" },
        { label: "Intermediate Groin Stretch" },
        { label: "Intermediate Hip Flexor and Quad Stretch" },
        { label: "Internal Rotation with Band" },
        { label: "Inverted Row" },
        { label: "Inverted Row with Straps" },
        { label: "Iron Cross" },
        { label: "Iron Crosses (stretch)" },
        { label: "Isometric Chest Squeezes" },
        { label: "Isometric Neck Exercise - Front And Back" },
        { label: "Isometric Neck Exercise - Sides" },
        { label: "Isometric Wipers" },
        { label: "JM Press" },
        { label: "Jackknife Sit-Up" },
        { label: "Janda Sit-Up" },
        { label: "Jefferson Squats" },
        { label: "Jerk Balance" },
        { label: "Jerk Dip Squat" },
        { label: "Jogging, Treadmill" },
        { label: "Keg Load" },
        { label: "Kettlebell Arnold Press" },
        { label: "Kettlebell Dead Clean" },
        { label: "Kettlebell Figure 8" },
        { label: "Kettlebell Hang Clean" },
        { label: "Kettlebell One-Legged Deadlift" },
        { label: "Kettlebell Pass Between The Legs" },
        { label: "Kettlebell Pirate Ships" },
        { label: "Kettlebell Pistol Squat" },
        { label: "Kettlebell Seated Press" },
        { label: "Kettlebell Seesaw Press" },
        { label: "Kettlebell Sumo High Pull" },
        { label: "Kettlebell Thruster" },
        { label: "Kettlebell Turkish Get-Up (Lunge style)" },
        { label: "Kettlebell Turkish Get-Up (Squat style)" },
        { label: "Kettlebell Windmill" },
        { label: "Kipping Muscle Up" },
        { label: "Knee Across The Body" },
        { label: "Knee Circles" },
        { label: "Knee/Hip Raise On Parallel Bars" },
        { label: "Knee Tuck Jump" },
        { label: "Kneeling Arm Drill" },
        { label: "Kneeling Cable Crunch With Alternating Oblique Twists" },
        { label: "Kneeling Cable Triceps Extension" },
        { label: "Kneeling Forearm Stretch" },
        { label: "Kneeling High Pulley Row" },
        { label: "Kneeling Hip Flexor" },
        { label: "Kneeling Jump Squat" },
        { label: "Kneeling Single-Arm High Pulley Row" },
        { label: "Kneeling Squat" },
        { label: "Landmine 180's" },
        { label: "Landmine Linear Jammer" },
        { label: "Lateral Bound" },
        { label: "Lateral Box Jump" },
        { label: "Lateral Cone Hops" },
        { label: "Lateral Raise - With Bands" },
        { label: "Latissimus Dorsi-SMR" },
        { label: "Leg-Over Floor Press" },
        { label: "Leg-Up Hamstring Stretch" },
        { label: "Leg Extensions" },
        { label: "Leg Lift" },
        { label: "Leg Press" },
        { label: "Leg Pull-In" },
        { label: "Leverage Chest Press" },
        { label: "Leverage Deadlift" },
        { label: "Leverage Decline Chest Press" },
        { label: "Leverage High Row" },
        { label: "Leverage Incline Chest Press" },
        { label: "Leverage Iso Row" },
        { label: "Leverage Shoulder Press" },
        { label: "Leverage Shrug" },
        { label: "Linear 3-Part Start Technique" },
        { label: "Linear Acceleration Wall Drill" },
        { label: "Linear Depth Jump" },
        { label: "Log Lift" },
        { label: "London Bridges" },
        { label: "Looking At Ceiling" },
        { label: "Low Cable Crossover" },
        { label: "Low Cable Triceps Extension" },
        { label: "Low Pulley Row To Neck" },
        { label: "Lower Back-SMR" },
        { label: "Lower Back Curl" },
        { label: "Lunge Pass Through" },
        { label: "Lunge Sprint" },
        { label: "Lying Bent Leg Groin" },
        { label: "Lying Cable Curl" },
        { label: "Lying Cambered Barbell Row" },
        { label: "Lying Close-Grip Bar Curl On High Pulley" },
        { label: "Lying Close-Grip Barbell Triceps Extension Behind The Head" },
        { label: "Lying Close-Grip Barbell Triceps Press To Chin" },
        { label: "Lying Crossover" },
        { label: "Lying Dumbbell Tricep Extension" },
        { label: "Lying Face Down Plate Neck Resistance" },
        { label: "Lying Face Up Plate Neck Resistance" },
        { label: "Lying Glute" },
        { label: "Lying Hamstring" },
        { label: "Lying High Bench Barbell Curl" },
        { label: "Lying Leg Curls" },
        { label: "Lying Machine Squat" },
        { label: "Lying One-Arm Lateral Raise" },
        { label: "Lying Prone Quadriceps" },
        { label: "Lying Rear Delt Raise" },
        { label: "Lying Supine Dumbbell Curl" },
        { label: "Lying T-Bar Row" },
        { label: "Lying Triceps Press" },
        { label: "Machine Bench Press" },
        { label: "Machine Bicep Curl" },
        { label: "Machine Preacher Curls" },
        { label: "Machine Shoulder (Military) Press" },
        { label: "Machine Triceps Extension" },
        { label: "Medicine Ball Chest Pass" },
        { label: "Medicine Ball Full Twist" },
        { label: "Medicine Ball Scoop Throw" },
        { label: "Middle Back Shrug" },
        { label: "Middle Back Stretch" },
        { label: "Mixed Grip Chin" },
        { label: "Monster Walk" },
        { label: "Mountain Climbers" },
        { label: "Moving Claw Series" },
        { label: "Muscle Snatch" },
        { label: "Muscle Up" },
        { label: "Narrow Stance Hack Squats" },
        { label: "Narrow Stance Leg Press" },
        { label: "Narrow Stance Squats" },
        { label: "Natural Glute Ham Raise" },
        { label: "Neck-SMR" },
        { label: "Neck Press" },
        { label: "Oblique Crunches" },
        { label: "Oblique Crunches - On The Floor" },
        { label: "Olympic Squat" },
        { label: "On-Your-Back Quad Stretch" },
        { label: "On Your Side Quad Stretch" },
        { label: "One-Arm Dumbbell Row" },
        { label: "One-Arm Flat Bench Dumbbell Flye" },
        { label: "One-Arm High-Pulley Cable Side Bends" },
        { label: "One-Arm Incline Lateral Raise" },
        { label: "One-Arm Kettlebell Clean" },
        { label: "One-Arm Kettlebell Clean and Jerk" },
        { label: "One-Arm Kettlebell Floor Press" },
        { label: "One-Arm Kettlebell Jerk" },
        { label: "One-Arm Kettlebell Military Press To The Side" },
        { label: "One-Arm Kettlebell Para Press" },
        { label: "One-Arm Kettlebell Push Press" },
        { label: "One-Arm Kettlebell Row" },
        { label: "One-Arm Kettlebell Snatch" },
        { label: "One-Arm Kettlebell Split Jerk" },
        { label: "One-Arm Kettlebell Split Snatch" },
        { label: "One-Arm Kettlebell Swings" },
        { label: "One-Arm Long Bar Row" },
        { label: "One-Arm Medicine Ball Slam" },
        { label: "One-Arm Open Palm Kettlebell Clean" },
        { label: "One-Arm Overhead Kettlebell Squats" },
        { label: "One-Arm Side Deadlift" },
        { label: "One-Arm Side Laterals" },
        { label: "One-Legged Cable Kickback" },
        { label: "One Arm Against Wall" },
        { label: "One Arm Chin-Up" },
        { label: "One Arm Dumbbell Bench Press" },
        { label: "One Arm Dumbbell Preacher Curl" },
        { label: "One Arm Floor Press" },
        { label: "One Arm Lat Pulldown" },
        { label: "One Arm Pronated Dumbbell Triceps Extension" },
        { label: "One Arm Supinated Dumbbell Triceps Extension" },
        { label: "One Half Locust" },
        { label: "One Handed Hang" },
        { label: "One Knee To Chest" },
        { label: "One Leg Barbell Squat" },
        { label: "Open Palm Kettlebell Clean" },
        { label: "Otis-Up" },
        { label: "Overhead Cable Curl" },
        { label: "Overhead Lat" },
        { label: "Overhead Slam" },
        { label: "Overhead Squat" },
        { label: "Overhead Stretch" },
        { label: "Overhead Triceps" },
        { label: "Pallof Press" },
        { label: "Pallof Press With Rotation" },
        { label: "Palms-Down Dumbbell Wrist Curl Over A Bench" },
        { label: "Palms-Down Wrist Curl Over A Bench" },
        { label: "Palms-Up Barbell Wrist Curl Over A Bench" },
        { label: "Palms-Up Dumbbell Wrist Curl Over A Bench" },
        { label: "Parallel Bar Dip" },
        { label: "Pelvic Tilt Into Bridge" },
        { label: "Peroneals-SMR" },
        { label: "Peroneals Stretch" },
        { label: "Physioball Hip Bridge" },
        { label: "Pin Presses" },
        { label: "Piriformis-SMR" },
        { label: "Plank" },
        { label: "Plate Pinch" },
        { label: "Plate Twist" },
        { label: "Platform Hamstring Slides" },
        { label: "Plie Dumbbell Squat" },
        { label: "Plyo Kettlebell Pushups" },
        { label: "Plyo Push-up" },
        { label: "Posterior Tibialis Stretch" },
        { label: "Power Clean" },
        { label: "Power Clean from Blocks" },
        { label: "Power Jerk" },
        { label: "Power Partials" },
        { label: "Power Snatch" },
        { label: "Power Snatch from Blocks" },
        { label: "Power Stairs" },
        { label: "Preacher Curl" },
        { label: "Preacher Hammer Dumbbell Curl" },
        { label: "Press Sit-Up" },
        { label: "Prone Manual Hamstring" },
        { label: "Prowler Sprint" },
        { label: "Pull Through" },
        { label: "Pullups" },
        { label: "Push-Up Wide" },
        { label: "Push-Ups - Close Triceps Position" },
        { label: "Push-Ups With Feet Elevated" },
        { label: "Push-Ups With Feet On An Exercise Ball" },
        { label: "Push Press" },
        { label: "Push Press - Behind the Neck" },
        { label: "Push Up to Side Plank" },
        { label: "Pushups" },
        { label: "Pushups (Close and Wide Hand Positions)" },
        { label: "Pyramid" },
        { label: "Quad Stretch" },
        { label: "Quadriceps-SMR" },
        { label: "Quick Leap" },
        { label: "Rack Delivery" },
        { label: "Rack Pull with Bands" },
        { label: "Rack Pulls" },
        { label: "Rear Leg Raises" },
        { label: "Recumbent Bike" },
        { label: "Return Push from Stance" },
        { label: "Reverse Band Bench Press" },
        { label: "Reverse Band Box Squat" },
        { label: "Reverse Band Deadlift" },
        { label: "Reverse Band Power Squat" },
        { label: "Reverse Band Sumo Deadlift" },
        { label: "Reverse Barbell Curl" },
        { label: "Reverse Barbell Preacher Curls" },
        { label: "Reverse Cable Curl" },
        { label: "Reverse Crunch" },
        { label: "Reverse Flyes" },
        { label: "Reverse Flyes With External Rotation" },
        { label: "Reverse Grip Bent-Over Rows" },
        { label: "Reverse Grip Triceps Pushdown" },
        { label: "Reverse Hyperextension" },
        { label: "Reverse Machine Flyes" },
        { label: "Reverse Plate Curls" },
        { label: "Reverse Triceps Bench Press" },
        { label: "Rhomboids-SMR" },
        { label: "Rickshaw Carry" },
        { label: "Rickshaw Deadlift" },
        { label: "Ring Dips" },
        { label: "Rocket Jump" },
        { label: "Rocking Standing Calf Raise" },
        { label: "Rocky Pull-Ups/Pulldowns" },
        { label: "Romanian Deadlift" },
        { label: "Romanian Deadlift from Deficit" },
        { label: "Rope Climb" },
        { label: "Rope Crunch" },
        { label: "Rope Jumping" },
        { label: "Rope Straight-Arm Pulldown" },
        { label: "Round The World Shoulder Stretch" },
        { label: "Rowing, Stationary" },
        { label: "Runner's Stretch" },
        { label: "Running, Treadmill" },
        { label: "Russian Twist" },
        { label: "Sandbag Load" },
        { label: "Scapular Pull-Up" },
        { label: "Scissor Kick" },
        { label: "Scissors Jump" },
        { label: "Seated Band Hamstring Curl" },
        { label: "Seated Barbell Military Press" },
        { label: "Seated Barbell Twist" },
        { label: "Seated Bent-Over One-Arm Dumbbell Triceps Extension" },
        { label: "Seated Bent-Over Rear Delt Raise" },
        { label: "Seated Bent-Over Two-Arm Dumbbell Triceps Extension" },
        { label: "Seated Biceps" },
        { label: "Seated Cable Rows" },
        { label: "Seated Cable Shoulder Press" },
        { label: "Seated Calf Raise" },
        { label: "Seated Calf Stretch" },
        { label: "Seated Close-Grip Concentration Barbell Curl" },
        { label: "Seated Dumbbell Curl" },
        { label: "Seated Dumbbell Inner Biceps Curl" },
        { label: "Seated Dumbbell Palms-Down Wrist Curl" },
        { label: "Seated Dumbbell Palms-Up Wrist Curl" },
        { label: "Seated Dumbbell Press" },
        { label: "Seated Flat Bench Leg Pull-In" },
        { label: "Seated Floor Hamstring Stretch" },
        { label: "Seated Front Deltoid" },
        { label: "Seated Glute" },
        { label: "Seated Good Mornings" },
        { label: "Seated Hamstring" },
        { label: "Seated Hamstring and Calf Stretch" },
        { label: "Seated Head Harness Neck Resistance" },
        { label: "Seated Leg Curl" },
        { label: "Seated Leg Tucks" },
        { label: "Seated One-Arm Dumbbell Palms-Down Wrist Curl" },
        { label: "Seated One-Arm Dumbbell Palms-Up Wrist Curl" },
        { label: "Seated One-arm Cable Pulley Rows" },
        { label: "Seated Overhead Stretch" },
        { label: "Seated Palm-Up Barbell Wrist Curl" },
        { label: "Seated Palms-Down Barbell Wrist Curl" },
        { label: "Seated Side Lateral Raise" },
        { label: "Seated Triceps Press" },
        { label: "Seated Two-Arm Palms-Up Low-Pulley Wrist Curl" },
        { label: "See-Saw Press (Alternating Side Press)" },
        { label: "Shotgun Row" },
        { label: "Shoulder Circles" },
        { label: "Shoulder Press - With Bands" },
        { label: "Shoulder Raise" },
        { label: "Shoulder Stretch" },
        { label: "Side-Lying Floor Stretch" },
        { label: "Side Bridge" },
        { label: "Side Hop-Sprint" },
        { label: "Side Jackknife" },
        { label: "Side Lateral Raise" },
        { label: "Side Laterals to Front Raise" },
        { label: "Side Leg Raises" },
        { label: "Side Lying Groin Stretch" },
        { label: "Side Neck Stretch" },
        { label: "Side Standing Long Jump" },
        { label: "Side To Side Chins" },
        { label: "Side Wrist Pull" },
        { label: "Side to Side Box Shuffle" },
        { label: "Single-Arm Cable Crossover" },
        { label: "Single-Arm Linear Jammer" },
        { label: "Single-Arm Push-Up" },
        { label: "Single-Cone Sprint Drill" },
        { label: "Single-Leg High Box Squat" },
        { label: "Single-Leg Hop Progression" },
        { label: "Single-Leg Lateral Hop" },
        { label: "Single-Leg Leg Extension" },
        { label: "Single-Leg Stride Jump" },
        { label: "Single Dumbbell Raise" },
        { label: "Single Leg Butt Kick" },
        { label: "Single Leg Glute Bridge" },
        { label: "Single Leg Push-off" },
        { label: "Sit-Up" },
        { label: "Sit Squats" },
        { label: "Skating" },
        { label: "Sled Drag - Harness" },
        { label: "Sled Overhead Backward Walk" },
        { label: "Sled Overhead Triceps Extension" },
        { label: "Sled Push" },
        { label: "Sled Reverse Flye" },
        { label: "Sled Row" },
        { label: "Sledgehammer Swings" },
        { label: "Smith Incline Shoulder Raise" },
        { label: "Smith Machine Behind the Back Shrug" },
        { label: "Smith Machine Bench Press" },
        { label: "Smith Machine Bent Over Row" },
        { label: "Smith Machine Calf Raise" },
        { label: "Smith Machine Close-Grip Bench Press" },
        { label: "Smith Machine Decline Press" },
        { label: "Smith Machine Hang Power Clean" },
        { label: "Smith Machine Hip Raise" },
        { label: "Smith Machine Incline Bench Press" },
        { label: "Smith Machine Leg Press" },
        { label: "Smith Machine One-Arm Upright Row" },
        { label: "Smith Machine Overhead Shoulder Press" },
        { label: "Smith Machine Pistol Squat" },
        { label: "Smith Machine Reverse Calf Raises" },
        { label: "Smith Machine Squat" },
        { label: "Smith Machine Stiff-Legged Deadlift" },
        { label: "Smith Machine Upright Row" },
        { label: "Smith Single-Leg Split Squat" },
        { label: "Snatch" },
        { label: "Snatch Balance" },
        { label: "Snatch Deadlift" },
        { label: "Snatch Pull" },
        { label: "Snatch Shrug" },
        { label: "Snatch from Blocks" },
        { label: "Speed Band Overhead Triceps" },
        { label: "Speed Box Squat" },
        { label: "Speed Squats" },
        { label: "Spell Caster" },
        { label: "Spider Crawl" },
        { label: "Spider Curl" },
        { label: "Spinal Stretch" },
        { label: "Split Clean" },
        { label: "Split Jerk" },
        { label: "Split Jump" },
        { label: "Split Snatch" },
        { label: "Split Squat with Dumbbells" },
        { label: "Split Squats" },
        { label: "Squat Jerk" },
        { label: "Squat with Bands" },
        { label: "Squat with Chains" },
        { label: "Squat with Plate Movers" },
        { label: "Squats - With Bands" },
        { label: "Stairmaster" },
        { label: "Standing Alternating Dumbbell Press" },
        { label: "Standing Barbell Calf Raise" },
        { label: "Standing Barbell Press Behind Neck" },
        { label: "Standing Bent-Over One-Arm Dumbbell Triceps Extension" },
        { label: "Standing Bent-Over Two-Arm Dumbbell Triceps Extension" },
        { label: "Standing Biceps Cable Curl" },
        { label: "Standing Biceps Stretch" },
        { label: "Standing Bradford Press" },
        { label: "Standing Cable Chest Press" },
        { label: "Standing Cable Lift" },
        { label: "Standing Cable Wood Chop" },
        { label: "Standing Calf Raises" },
        { label: "Standing Concentration Curl" },
        { label: "Standing Dumbbell Calf Raise" },
        { label: "Standing Dumbbell Press" },
        { label: "Standing Dumbbell Reverse Curl" },
        { label: "Standing Dumbbell Straight-Arm Front Delt Raise Above Head" },
        { label: "Standing Dumbbell Triceps Extension" },
        { label: "Standing Dumbbell Upright Row" },
        { label: "Standing Elevated Quad Stretch" },
        { label: "Standing Front Barbell Raise Over Head" },
        { label: "Standing Gastrocnemius Calf Stretch" },
        { label: "Standing Hamstring and Calf Stretch" },
        { label: "Standing Hip Circles" },
        { label: "Standing Hip Flexors" },
        { label: "Standing Inner-Biceps Curl" },
        { label: "Standing Lateral Stretch" },
        { label: "Standing Leg Curl" },
        { label: "Standing Long Jump" },
        { label: "Standing Low-Pulley Deltoid Raise" },
        { label: "Standing Low-Pulley One-Arm Triceps Extension" },
        { label: "Standing Military Press" },
        { label: "Standing Olympic Plate Hand Squeeze" },
        { label: "Standing One-Arm Cable Curl" },
        { label: "Standing One-Arm Dumbbell Curl Over Incline Bench" },
        { label: "Standing One-Arm Dumbbell Triceps Extension" },
        { label: "Standing Overhead Barbell Triceps Extension" },
        { label: "Standing Palm-In One-Arm Dumbbell Press" },
        { label: "Standing Palms-In Dumbbell Press" },
        { label: "Standing Palms-Up Barbell Behind The Back Wrist Curl" },
        { label: "Standing Pelvic Tilt" },
        { label: "Standing Rope Crunch" },
        { label: "Standing Soleus And Achilles Stretch" },
        { label: "Standing Toe Touches" },
        { label: "Standing Towel Triceps Extension" },
        { label: "Standing Two-Arm Overhead Throw" },
        { label: "Star Jump" },
        { label: "Step-up with Knee Raise" },
        { label: "Step Mill" },
        { label: "Stiff-Legged Barbell Deadlift" },
        { label: "Stiff-Legged Dumbbell Deadlift" },
        { label: "Stiff Leg Barbell Good Morning" },
        { label: "Stomach Vacuum" },
        { label: "Straight-Arm Dumbbell Pullover" },
        { label: "Straight-Arm Pulldown" },
        { label: "Straight Bar Bench Mid Rows" },
        { label: "Straight Raises on Incline Bench" },
        { label: "Stride Jump Crossover" },
        { label: "Sumo Deadlift" },
        { label: "Sumo Deadlift with Bands" },
        { label: "Sumo Deadlift with Chains" },
        { label: "Superman" },
        { label: "Supine Chest Throw" },
        { label: "Supine One-Arm Overhead Throw" },
        { label: "Supine Two-Arm Overhead Throw" },
        { label: "Suspended Fallout" },
        { label: "Suspended Push-Up" },
        { label: "Suspended Reverse Crunch" },
        { label: "Suspended Row" },
        { label: "Suspended Split Squat" },
        { label: "Svend Press" },
        { label: "T-Bar Row with Handle" },
        { label: "Tate Press" },
        { label: "The Straddle" },
        { label: "Thigh Abductor" },
        { label: "Thigh Adductor" },
        { label: "Tire Flip" },
        { label: "Toe Touchers" },
        { label: "Torso Rotation" },
        { label: "Trail Running/Walking" },
        { label: "Trap Bar Deadlift" },
        { label: "Tricep Dumbbell Kickback" },
        { label: "Tricep Side Stretch" },
        { label: "Triceps Overhead Extension with Rope" },
        { label: "Triceps Pushdown" },
        { label: "Triceps Pushdown - Rope Attachment" },
        { label: "Triceps Pushdown - V-Bar Attachment" },
        { label: "Triceps Stretch" },
        { label: "Tuck Crunch" },
        { label: "Two-Arm Dumbbell Preacher Curl" },
        { label: "Two-Arm Kettlebell Clean" },
        { label: "Two-Arm Kettlebell Jerk" },
        { label: "Two-Arm Kettlebell Military Press" },
        { label: "Two-Arm Kettlebell Row" },
        { label: "Underhand Cable Pulldowns" },
        { label: "Upper Back-Leg Grab" },
        { label: "Upper Back Stretch" },
        { label: "Upright Barbell Row" },
        { label: "Upright Cable Row" },
        { label: "Upright Row - With Bands" },
        { label: "Upward Stretch" },
        { label: "V-Bar Pulldown" },
        { label: "V-Bar Pullup" },
        { label: "Vertical Swing" },
        { label: "Walking, Treadmill" },
        { label: "Weighted Ball Hyperextension" },
        { label: "Weighted Ball Side Bend" },
        { label: "Weighted Bench Dip" },
        { label: "Weighted Crunches" },
        { label: "Weighted Jump Squat" },
        { label: "Weighted Pull Ups" },
        { label: "Weighted Sissy Squat" },
        { label: "Weighted Sit-Ups - With Bands" },
        { label: "Weighted Squat" },
        { label: "Wide-Grip Barbell Bench Press" },
        { label: "Wide-Grip Decline Barbell Bench Press" },
        { label: "Wide-Grip Decline Barbell Pullover" },
        { label: "Wide-Grip Lat Pulldown" },
        { label: "Wide-Grip Pulldown Behind The Neck" },
        { label: "Wide-Grip Rear Pull-Up" },
        { label: "Wide-Grip Standing Barbell Curl" },
        { label: "Wide Stance Barbell Squat" },
        { label: "Wide Stance Stiff Legs" },
        { label: "Wind Sprints" },
        { label: "Windmills" },
        { label: "World's Greatest Stretch" },
        { label: "Wrist Circles" },
        { label: "Wrist Roller" },
        { label: "Wrist Rotations with Straight Bar" },
        { label: "Yoke Walk" },
        { label: "Zercher Squats" },
        { label: "Zottman Curl" },
        { label: "Zottman Preacher Curl" },
    ];

    const filterOptions = (options, { inputValue }) => {
        const optionsForSearch = options.map((o) => o.label)
        const terms = inputValue.split(' ')
        const result = terms.reduceRight(
            (accu, term) => matchSorter(accu, term),
            optionsForSearch
        )
        return result
    }

    const columns = [
        { id: 'name', label: 'Name', minWidth: 170 },
        { id: 'force', label: 'Force', minWidth: 100 },
        { id: 'level', label: 'Level', minWidth: 100 },
        { id: 'mechanic', label: 'Mechanic', minWidth: 100 },
        { id: 'equipment', label: 'Equipment', minWidth: 100 },
        { id: 'primaryMuscles', label: 'Primary Muscles', minWidth: 100 },
        { id: 'secondaryMuscles', label: 'Secondary Muscles', minWidth: 100 },
        { id: 'category', label: 'Category', minWidth: 100 },
    ];

    // This method fetches the exercises from the database.
    useEffect(() => {
        getExercisesAmount();
        getPage(page, rowsPerPage);
        return;
    }, []);

    async function getPage(pageNumber, rowsPerPage) {
        const start = pageNumber * rowsPerPage;
        const end = start + rowsPerPage - 1;

        let getRows = await getPaginatedExercises(start, end);

        let newRows = [];

        getRows.map((exercise, index) => {
            newRows[start + index] = {
                name: exercise.name ? exercise.name.charAt(0).toUpperCase() + exercise.name.slice(1) : '',
                force: exercise.force ? exercise.force.charAt(0).toUpperCase() + exercise.force.slice(1) : '',
                level: exercise.level ? exercise.level.charAt(0).toUpperCase() + exercise.level.slice(1) : '',
                mechanic: exercise.mechanic ? exercise.mechanic.charAt(0).toUpperCase() + exercise.mechanic.slice(1) : '',
                equipment: exercise.equipment ? exercise.equipment.charAt(0).toUpperCase() + exercise.equipment.slice(1) : '',
                primaryMuscles: exercise.primaryMuscles ? exercise.primaryMuscles.map(muscle => muscle.charAt(0).toUpperCase() + muscle.slice(1)).join(', ') : '',
                secondaryMuscles: exercise.secondaryMuscles ? exercise.secondaryMuscles.map(muscle => muscle.charAt(0).toUpperCase() + muscle.slice(1)).join(', ') : '',
                category: exercise.category ? exercise.category.charAt(0).toUpperCase() + exercise.category.slice(1) : ''
            };
        });

        setRows(newRows);
    }

    async function getExerciseIdByName(name) {

        const response = await fetch(`${dbUrl}exercises/getIdByName/${name.toString()}`);
        if (!response.ok) {
            const message = `An error occurred: ${response.statusText}`;
            window.alert(message);
            return;
        }

        const exerciseId = await response.json();

        setSelectedExercise(exerciseId);
        setOpen(true);
    }

    async function getExercisesAmount() {
        const response = await fetch(`${dbUrl}exercises/getExercisesAmount`);
        if (!response.ok) {
            const message = `An error occurred: ${response.statusText}`;
            window.alert(message);
            return;
        }

        var amount = await response.json();
        setExercisesAmount(amount);
    }

    async function getPaginatedExercises(start, end) {
        const response = await fetch(`${dbUrl}exercises/getPaginatedExercises/${start.toString()}/${end.toString()}`);
        if (!response.ok) {
            const message = `An error occurred: ${response.statusText}`;
            window.alert(message);
            return;
        }

        return await response.json();
    }

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
        getPage(newPage, rowsPerPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(+event.target.value);
        setPage(0);
        getPage(0, +event.target.value);
    };

    function getExerciseInfoDialog() {
        if (selectedExercise !== "") {
            return (
                <>
                    <Dialog
                        onClose={handleClose}
                        aria-labelledby="customized-dialog-title"
                        open={open}
                    >
                        <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
                            Exercise info
                        </DialogTitle>
                        <IconButton
                            aria-label="close"
                            onClick={handleClose}
                            sx={{
                                position: 'absolute',
                                right: 8,
                                top: 8,
                                color: (theme) => theme.palette.grey[500],
                            }}
                        >
                            <CloseIcon />
                        </IconButton>
                        <DialogContent dividers>

                            <Box sx={{ marginTop: -3 }}>
                                <ExerciseDetails exerciseId={selectedExercise} noTopbar={true} />
                            </Box>




                        </DialogContent>
                    </Dialog>
                </>
            )
        }
    }

    return (
        <>
            <TopBar />

            {getExerciseInfoDialog()}

            <Box sx={{
                marginTop: 2,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
            }}>
                <Stack spacing={2} direction="row">
                    <Typography variant="h3" gutterBottom>Exercises</Typography>
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
                    <Typography>Search for exercises</Typography>
                    <Autocomplete
                        disablePortal
                        id="combo-box-demo"
                        options={exerciseAutoCompleteList}
                        filterOptions={filterOptions}
                        renderInput={(params) => <TextField {...params} label="Exercise" />}
                        isOptionEqualToValue={(option, value) => option.value === value.value}
                        onChange={(_, data) => {
                            if (data !== null) {
                                getExerciseIdByName(data);
                            }
                        }
                        }
                    />
                </Stack>
            </Box>

            <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                <TableContainer sx={{ maxHeight: '70vh' }}>
                    <Table stickyHeader aria-label="sticky table">
                        <TableHead>
                            <TableRow>
                                {columns.map((column) => (
                                    <React.Fragment key={uuidv4()}>
                                        <TableCell
                                            key={column.id}
                                            align={column.align}
                                            style={{ minWidth: column.minWidth }}
                                        >
                                            {column.label}
                                        </TableCell>
                                    </React.Fragment>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {rows
                                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                .map((row) => {
                                    return (
                                        <React.Fragment key={uuidv4()}>
                                            <TableRow hover role="checkbox" tabIndex={-1} key={row.code}>
                                                {columns.map((column) => {
                                                    const value = row[column.id];
                                                    return (
                                                        <TableCell key={column.id} align={column.align} onClick={() => getExerciseIdByName(row.name)}>
                                                            {column.format && typeof value === 'number'
                                                                ? column.format(value)
                                                                : value}
                                                        </TableCell>
                                                    );
                                                })}
                                            </TableRow>
                                        </React.Fragment>
                                    );
                                })}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    rowsPerPageOptions={[10, 25, 50, 100]}
                    component="div"
                    count={exercisesAmount}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </Paper>
        </>
    );
}
