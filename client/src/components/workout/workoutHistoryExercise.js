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
import Grid from '@mui/material/Grid';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';
import FormHelperText from '@mui/material/FormHelperText';
import FormControl from '@mui/material/FormControl';
import { v4 as uuidv4 } from 'uuid';
import { useEffect, useState } from "react";

function WorkoutExercise(props) {
  const [open, setOpen] = React.useState(false);
  const [exerciseName, setExerciseName] = useState([]);
  const [sets, setSets] = useState([]);
  const dbUrl = process.env.REACT_APP_DB_URL;

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
    return;
  }, []);

  const handleClick = () => {
    setOpen(!open);
  };

  function getSetBackgroundColor(index) {
    if (sets[index].finished === true) {
      return 'none';
    }
    else {
      return 'pink';
    }

  }

  return (
    <div>
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

            <List>
              {sets.map(function (generateSet, index) {
                return (
                  <React.Fragment key={uuidv4()}>
                    <Box sx={{bgcolor: getSetBackgroundColor(index) }}>
                    <ListItem>
                      <FormControl sx={{ m: 1, width: '25ch' }} variant="outlined" disabled={true}>
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
                        />
                        <FormHelperText id="outlined-weight-helper-text">Weight</FormHelperText>
                      </FormControl>

                      <FormControl sx={{ m: 1, width: '25ch' }} variant="outlined" disabled={true}>
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
                        />
                        <FormHelperText id="outlined-weight-helper-text">Reps</FormHelperText>
                      </FormControl>

                    </ListItem>
                    </Box>
                  </React.Fragment>
                )
              })}
            </List>

          </Grid>
        </Box>
      </Collapse>
    </div>
  );
}

export default WorkoutExercise;