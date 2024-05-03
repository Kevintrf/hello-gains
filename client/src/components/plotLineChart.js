import React, { useEffect } from 'react';
import { Box } from '@mui/material';
import { Stack } from '@mui/material';
import { Typography } from '@mui/material';
import { Button } from '@mui/material';
import { LineChart } from '@mui/x-charts/LineChart';
import { useState } from 'react';

export default function PlotLineChart(props) {
    //Props.
    //data1, data2, title, button1name, button2name, 
    //data1 && data2 are arrays of objects with x and y values
    //title is the title of the chart
    //button1name is the name of the first button
    //button2name is the name of the second button

    const [button1enabled, changeButton1Enabled] = useState(true);
    const [button2enabled, changeButton2Enabled] = useState(false);
    const [data, changeData] = useState(1);
    const [xAxisData, changeXAxisData] = useState(props.data1[0]);
    const [seriesData, changeSeriesData] = useState(props.data1[1]);
    const [screenWidth, setScreenWidth] = useState(window.innerWidth);

    const [oldProps, setOldProps] = useState(props);

    //When updated
    React.useEffect(() => { 
        if (oldProps.title !== props.title) {
            setOldProps(props);
            pressButton(1);
        }
    }, [oldProps.title, props, pressButton]);

    useEffect(() => {
        pressButton(1);

        const handleResize = () => {
            setScreenWidth(window.innerWidth);
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    function pressButton(button) {
        if (button === 1) {
            changeButton1Enabled(false);
            changeButton2Enabled(true);
        }
        else if (button === 2) {
            changeButton2Enabled(false);
            changeButton1Enabled(true);
        }
        if (data === 1) {
            changeData(2);
        }
        else if (data === 2) {
            changeData(1);
        }
        getXAxisData();
        getSeriesData();
    }

    function getButtons() {
        if (props.button1name !== null && props.button2name !== null) {
            return (
                <>
                    <Button variant="contained" disabled={!button1enabled} onClick={() => pressButton(1)}>{props.button1name}</Button>
                    <Button variant="contained" disabled={!button2enabled} onClick={() => pressButton(2)}>{props.button2name}</Button>
                </>
            );
        }
        else {
            return (
                <>
                </>
            )
        }
    }

    function getXAxisData() {
        if (data === 1) {
            changeXAxisData(props.data1[0]);
        }
        else if (data === 2) {
            changeXAxisData(props.data2[0]);
        }
    }

    function getSeriesData() {
        if (data === 1) {
            changeSeriesData(props.data1[1]);
        }
        else if (data === 2) {
            changeSeriesData(props.data2[1]);
        }
    }

    return (
        <>
            <Box sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
            }}>
                <Stack spacing={0}>
                    <Typography variant="h5" gutterBottom align="center" sx={{ marginBottom: -5 }}>{props.title}</Typography>
                    <LineChart
                        xAxis={[{ scaleType: 'point', data: xAxisData }]}
                        series={[
                            {
                                data: seriesData,
                                area: true,
                            },
                        ]}
                        width={screenWidth*0.5}
                        height={screenWidth*0.35}
                    />
                    <Stack spacing={2} direction="row" sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                    }}>
                        {getButtons()}
                    </Stack>
                </Stack>
            </Box>
        </>
    );
};