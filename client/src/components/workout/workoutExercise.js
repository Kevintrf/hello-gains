import * as React from 'react';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Collapse from '@mui/material/Collapse';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import Box from '@mui/material/Box';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import Grid from '@mui/material/Grid';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckIcon from '@mui/icons-material/Check';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';
import FormHelperText from '@mui/material/FormHelperText';
import FormControl from '@mui/material/FormControl';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import { v4 as uuidv4 } from 'uuid';
import { useEffect, useState } from "react";
import { red } from '@mui/material/colors';
import ExerciseHistoryDialog from "./exerciseHistoryDialog";
import PlateCalculatorDialog from "./plateCalculatorDialog";
import InfoIcon from '@mui/icons-material/Info';
import Container from '@mui/material/Container';
import ExerciseInfoDialog from './exerciseInfoDialog';

function WorkoutExercise(props) {
  const [open, setOpen] = React.useState(false);
  const [exerciseName, setExerciseName] = useState([]);
  const [sets, setSets] = useState([]);
  const [state, setState] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const dbUrl = process.env.REACT_APP_DB_URL;

  const maxReps = 999;
  const maxWeight = 999;

  // This method fetches the exercises from the database.
  useEffect(() => {
    async function getExerciseName() {
      const response = await fetch(`${dbUrl}exercises/getNameById/${props.exerciseId.toString()}`);
      if (!response.ok) {
        const message = `An error occurred: ${response.statusText}`;
        window.alert(message);
        return;
      }
      const exerciseName = await response.json();
      setExerciseName(exerciseName);
    }
    getExerciseName();
    setSets(props.sets);
    setEditMode(props.editMode);
    return;
  }, []);

  const handleClick = () => {
    setOpen(!open);
  };

  //Sets a new unique state which rerenders the component, somewhat of a hack
  const newState = () => {
    setState(uuidv4());
  }

  function updateExerciseToDay(finishSet) {
    var exercise = { "exerciseId": props.exerciseId, "sets": sets };
    props.updateDayFromChildExercise(exercise, props.index, finishSet);
  }

  const addSet = () => {
    var newSets = sets;
    newSets.push({ reps: 0, weight: 0 });
    setSets(newSets);
    newState(); //newState needs to be called in order to rerender the component and have the new set show up, setSets() should do this but doesnt seem to work?
    updateExerciseToDay(false);
  }

  const removeSet = (index) => {
    var newSets = sets;
    newSets.splice(index, 1); //Removes one element from the array at the given index
    setSets(newSets);
    newState();
    updateExerciseToDay(false);
  }

  const setWeightChanged = (weight, index) => {
    if (weight === "") {
      weight = 0;
    }
    var newSet = sets;
    newSet[index].weight = weight;
    setSets(newSet);
    updateExerciseToDay(false);
  }

  const setRepsChanged = (reps, index) => {
    if (reps === "") {
      reps = 0;
    }
    var newSet = sets;
    newSet[index].reps = reps;
    setSets(newSet);
    updateExerciseToDay(false);
  }

  const changeSetFinished = (index) => {
    var newSet = sets;
    var finished = false;
    if (newSet[index].finished === true) {
      newSet[index].finished = false;
    }
    else {
      newSet[index].finished = true;
      finished = true;
    }
    newSet[index].timeFinished = Date.now();
    setSets(newSet);
    updateExerciseToDay(finished);
    newState();
  }

  const getSetFinishedButtonColor = (index) => {
    if (sets[index].finished === true) {
      return 'primary';
    }
    else {
      return 'disabled';
    }
  }

  function getExerciseButtons() {
    if (editMode) {
      return <></>
    }
    else {
      return (
        <>
          <Box sx={{ marginTop: 0, marginLeft: 3 }}>
            <Stack spacing={2} direction="row">
              <ExerciseInfoDialog exerciseId={props.exerciseId} />
              <ExerciseHistoryDialog authUserId={props.authUserId} exerciseId={props.exerciseId} />
              <PlateCalculatorDialog authUserId={props.authUserId} exerciseId={props.exerciseId} />
            </Stack>
          </Box>
        </>
      )
    }
  }

  function getSetButtons(index) {
    if (editMode) {
      return (
        <>
          <IconButton edge="end" aria-label="delete" onClick={() => removeSet(index)}>
            <DeleteIcon />
          </IconButton>
        </>
      )
    }
    else {
      return (
        <>
          <IconButton edge="end" aria-label="check" color={getSetFinishedButtonColor(index)} onClick={() => changeSetFinished(index)}>
            <CheckIcon />
          </IconButton>
          <IconButton edge="end" aria-label="delete" onClick={() => removeSet(index)}>
            <DeleteIcon />
          </IconButton>
        </>
      )
    }
  }

  function getSetBackgroundColor(index) {
    if (sets[index].finished === true && editMode === false) {
      return 'lightgreen';
    }
    else {
      return 'none';
    }

  }

  return (
    <>
      <ListItemButton onClick={() => handleClick()}>
        <ListItemIcon>
          <FitnessCenterIcon />
        </ListItemIcon>
        <ListItemText primary={exerciseName} />
        {open ? <ExpandLess onClick={() => handleClick()} /> : <ExpandMore onClick={() => handleClick()} />}
      </ListItemButton>

      <Collapse in={open} timeout="auto" unmountOnExit>
        <Box sx={{ flexGrow: 1, maxWidth: 752 }}>
          <Grid item xs={12} md={6}>

            {getExerciseButtons()}

            <List>
              {sets.map(function (generateSet, index) {
                return (
                  <React.Fragment key={uuidv4()}>
                    <Box sx={{bgcolor: getSetBackgroundColor(index) }}>
                    <ListItem >
                      <FormControl sx={{ m: 1, width: '25ch' }} variant="outlined">
                        <OutlinedInput
                          id="outlined-adornment-weight"
                          endAdornment={<InputAdornment position="end">kg</InputAdornment>}
                          aria-describedby="outlined-weight-helper-text"
                          inputProps={{
                            'aria-label': 'weight',
                            'type': 'number',
                            'max': '999'
                          }}
                          defaultValue={generateSet.weight}
                          onChange={(e) => {
                            if (e.target.value > maxWeight) {
                              e.target.value = Number(maxWeight);
                            }
                            else if (e.target.value < 0) {
                              e.target.value = Number(0);
                            }
                            setWeightChanged(e.target.value, index);
                          }}
                        />
                        <FormHelperText id="outlined-weight-helper-text">Weight</FormHelperText>
                      </FormControl>

                      <FormControl sx={{ m: 1, width: '25ch' }} variant="outlined">
                        <OutlinedInput
                          id="outlined-adornment-weight"
                          endAdornment={<InputAdornment position="end">reps</InputAdornment>}
                          aria-describedby="outlined-weight-helper-text"
                          inputProps={{
                            'aria-label': 'weight',
                            'type': 'number',
                            'max': '99'
                          }}
                          defaultValue={generateSet.reps}
                          onChange={(e) => {
                            if (e.target.value > maxReps) {
                              e.target.value = Number(maxReps);
                            }
                            else if (e.target.value < 0) {
                              e.target.value = Number(0);
                            }
                            setRepsChanged(e.target.value, index);
                          }}
                          
                        />
                        <FormHelperText id="outlined-weight-helper-text">Reps</FormHelperText>
                      </FormControl>

                      <Box sx={{marginTop: -3, marginLeft: 0.5}}>
                      <Stack spacing={0.5} direction="row">
                      {getSetButtons(index)}
                      </Stack>
                      </Box>

                    </ListItem>
                    </Box>
                  </React.Fragment>
                )
              })}

              <ListItemButton onClick={() => addSet()}>
                <ListItemAvatar >
                  <Avatar >
                    <AddCircleIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary="Add set"
                />
              </ListItemButton>
            </List>

          </Grid>
        </Box>
      </Collapse>
    </>
  );
}

export default WorkoutExercise;