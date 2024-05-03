import React, { useEffect, useState } from "react";
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Typography from '@mui/material/Typography';
import auth from '../../auth'
import { onAuthStateChanged } from "firebase/auth";

import CalculateIcon from '@mui/icons-material/Calculate';
import { v4 as uuidv4 } from 'uuid';
import FormControl from '@mui/material/FormControl';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';
import FormHelperText from '@mui/material/FormHelperText';

function PlateCalculatorDialog() {

    const [totalWeight, setTotalWeight] = React.useState(20);
    const [barWeight, setBarWeight] = React.useState(20);
    const [plates, setPlates] = React.useState([0, 0, 0, 0, 0, 0, 0, 0]);
    
    const maxWeight = 999;

    const [open, setOpen] = React.useState(false);

    const handleClickOpen = () => {
        setOpen(true);
    };
    const handleClose = () => {
        setOpen(false);
    };

    function updatePlates(totalWeightInput, totalBarWeightInput){
        let weightPerSide = (totalWeightInput - totalBarWeightInput)/2;
        let availablePlates = [25, 20, 15, 10, 7.5, 5, 2.5, 1.25];
        let usedPlates = [0, 0, 0, 0, 0, 0, 0, 0];

        for (let i = 0; i < availablePlates.length; i++){
            while (availablePlates[i] <= weightPerSide) {
                weightPerSide -= availablePlates[i];
                usedPlates[i] += 2;
            }
        }

        setPlates(usedPlates);
    }

    function printPlates(){
        //Change this to a nice map function
        return <>
        25 kg: {plates[0].toString()} plates
        <br />
        20 kg: {plates[1].toString()} plates
        <br />
        15 kg: {plates[2].toString()} plates
        <br />
        10 kg: {plates[3].toString()} plates
        <br />
        7.5 kg: {plates[4].toString()} plates
        <br />
        5 kg: {plates[5].toString()} plates
        <br />
        2.5 kg: {plates[6].toString()} plates
        <br />
        1.25 kg: {plates[7].toString()} plates
        </>;
    }

    return (
        <React.Fragment>
            <Button variant="contained" onClick={handleClickOpen}>
                <CalculateIcon />
                Plate calculator
            </Button>

            <Dialog
                onClose={handleClose}
                aria-labelledby="customized-dialog-title"
                open={open}
            >
                <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
                    Plate calculator
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
                    <Typography>
                        {printPlates()}
                    </Typography>



                    <FormControl key={"inputFormBar"} sx={{ m: 1, width: '25ch' }} variant="outlined">
                      <OutlinedInput
                        id="outlined-adornment-weight"
                        endAdornment={<InputAdornment position="end">kg</InputAdornment>}
                        aria-describedby="outlined-weight-helper-text"
                        inputProps={{
                          'aria-label': 'weight',
                          'type': 'number',
                          'max': '99'
                        }}
                        defaultValue={barWeight}
                        onChange={(e) => {
                            if (e.target.value < 0){
                                e.target.value = 0;
                            }
                            e.target.value = e.target.value.toString().slice(0, 4);
                            setTotalWeight(e.target.value);
                            updatePlates(e.target.value, barWeight);
                          }}
                      />
                      <FormHelperText id="outlined-weight-helper-text">Total weight</FormHelperText>
                    </FormControl>

                    <FormControl key={"inputFormTotal"} sx={{ m: 1, width: '25ch' }} variant="outlined">
                      <OutlinedInput
                        id="outlined-adornment-weight"
                        endAdornment={<InputAdornment position="end">kg</InputAdornment>}
                        aria-describedby="outlined-weight-helper-text"
                        inputProps={{
                          'aria-label': 'weight',
                          'type': 'number',
                          'max': '99'
                        }}
                        defaultValue={totalWeight}
                        onChange={(e) => {
                            if (e.target.value < 0){
                                e.target.value = 0;
                            }
                            e.target.value = e.target.value.toString().slice(0, 4);
                            setBarWeight(e.target.value);
                            updatePlates(totalWeight, e.target.value);
                          }}
                      />
                      <FormHelperText id="outlined-weight-helper-text">Barbell weight</FormHelperText>
                    </FormControl>






                </DialogContent>
            </Dialog>
        </React.Fragment>
    );
}

export default PlateCalculatorDialog;

