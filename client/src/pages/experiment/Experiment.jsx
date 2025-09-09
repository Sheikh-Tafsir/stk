import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import Stimuli from '@/pages/experiment/Stimuli';
import PageLoading from '@/mycomponents/loading/PageLoading.jsx';
import { API } from '@/middleware/Api';
import { isInRange, isNull, TOTAL_EXPERIMENTS } from '@/utils/utils';
import { AlertStatus } from '@/mycomponents/AlertStatus.jsx';

const EXP_DURATION = 40000;
const EXPERIMENT_STATUS = Object.freeze({
    NOT_STARTED: "not started",
    RUNNING: "running",
    FINISHED: "finished",
    SAVED: "saved",
});

const Experiment = () => {

    const navigate = useNavigate();
    const { id, experimentId } = useParams();

    const [experimentStatus, setExperimentStatus] = useState(EXPERIMENT_STATUS.NOT_STARTED);
    const [currentImageId, setCurrentImageId] = useState(null);
    const [alertInfo, setAlertInfo] = useState({ open: false, message: '' });

    const gazeDataArray = useRef([]);
    const prevAlertOpen = useRef(alertInfo.open);
    const currentImageIdRef = useRef(currentImageId);

    const viewportWidth = document.documentElement.clientWidth;
    const viewportHeight = document.documentElement.clientHeight;

    useEffect(() => {
        const script = document.createElement('script');
        script.src = "https://api.gazerecorder.com/GazeCloudAPI.js";
        script.async = true;
        script.onload = () => {
            console.log("GazeCloudAPI script loaded.");
        };
        script.onerror = () => {
            console.error("Failed to load GazeCloudAPI script.");
        };
        document.body.appendChild(script);
    
        return () => {
            document.body.removeChild(script); // Clean up on unmount
        };
    }, []);
    
    const navigateToPendingExperiments = (id) => {
        navigate(`/participants/${id}/experiments`, { replace: true });
    }

    useEffect(() => {
        if (!id && !experimentId) return;

        if (!isInRange(experimentId, 1, TOTAL_EXPERIMENTS)) {
            navigateToPendingExperiments(id);
            return;
        }

        const checkAndStart = async () => {
            try {
                const response = await API.get(`/participants/${id}/experiments/${experimentId}`);
                //console.log(response.data);
    
                if (!response.data.data) {
                    GazeCloudAPI.StartEyeTracking();
                } else {
                    navigateToPendingExperiments(id);
                }
            } catch (error) {
                console.error("Error checking experiment completion:", error);
                navigateToPendingExperiments(id);
            }
        };
    
        checkAndStart();
    }, [id, experimentId, navigateToPendingExperiments]);

    const PlotGaze = (GazeData, image) => {
        if (isNull(image)) return;

        var x = GazeData.docX;
        var y = GazeData.docY;

        // percentage x and y to be ratios between 0 and 1
        let gazeXPercentage = (x / viewportWidth) * 100;
        let gazeYPercentage = (y / viewportHeight) * 100;

        const currGaze = {
            timestamp: GazeData.time,
            gazeX: gazeXPercentage,
            gazeY: gazeYPercentage,
            image
        };

        if (gazeXPercentage && gazeYPercentage) {
            //console.log(currGaze)
            gazeDataArray.current.push(currGaze);
        }

        // let gaze = document.getElementById("gaze");
        // x -= gaze.clientWidth / 2;
        // y -= gaze.clientHeight / 2;

        // gaze.style.left = x + "px";
        // gaze.style.top = y + "px";

        // if (GazeData.state != 0) {
        //     if (gaze.style.display == 'block')
        //         gaze.style.display = 'none';
        // }
        // else {
        //     if (gaze.style.display == 'none') gaze.style.display = 'block';
        // }
    };

    useEffect(() => {
        GazeCloudAPI.OnCalibrationComplete = () => {
            console.log('gaze Calibration Complete');
            setExperimentStatus(EXPERIMENT_STATUS.RUNNING);
        }

        GazeCloudAPI.OnCamDenied = () => { console.log('camera  access denied') }
        GazeCloudAPI.OnError = (msg) => { console.log('err: ' + msg) }
        GazeCloudAPI.UseClickRecalibration = true;
        // GazeCloudAPI.OnResult = (GazeData) => PlotGaze(GazeData, currentImageId);
        GazeCloudAPI.OnResult = (GazeData) => {
            const currentId = currentImageIdRef.current;
            if (currentId) PlotGaze(GazeData, currentId);
        };
    }, []);

    useEffect(() => {
        currentImageIdRef.current = currentImageId;
    }, [currentImageId]);

    const handleSaveData = async () => {
        try {
            await API.post(`/experiments`, {
                gazeData: gazeDataArray.current,
                stimuli: experimentId,
                participantId: id,
            });

            setAlertInfo({ open: true, message: `Experiment ${experimentId} finished successfully!` });
            setExperimentStatus(EXPERIMENT_STATUS.SAVED);
        }
        catch (error) {
            console.error(error.message);
            setAlertInfo({ open: true, message: `Failed to save data. Please try again.` });
        }
    }

    const stopEyeTracking = () => {
        setExperimentStatus(EXPERIMENT_STATUS.FINISHED);
        GazeCloudAPI.StopEyeTracking();

        if (gazeDataArray.current.length === 0) {
            console.log("Failed to start experiment: GazeCloud error.");
            setAlertInfo({ open: true, message: "Failed to start experiment: GazeCloud error." });
        }
        else handleSaveData();
    };

    useEffect(() => {
        if (experimentStatus === EXPERIMENT_STATUS.RUNNING) {
            const timer = setTimeout(() => {
                stopEyeTracking();
            }, EXP_DURATION);

            return () => clearTimeout(timer); // Clear timeout if the component unmounts or expRunning changes
        }
    }, [experimentStatus]);

    const handleImageChange = useCallback((imageNumber) => {
        setCurrentImageId(imageNumber);
    }, []);

    useEffect(() => {
        if (prevAlertOpen.current && !alertInfo.open) {
            navigateToPendingExperiments(id);
        }

        prevAlertOpen.current = alertInfo.open;
    }, [alertInfo, navigate, id]);

    return (
        <div className='flex min-h-[100vh]'>
            {experimentStatus === EXPERIMENT_STATUS.RUNNING &&
                <>
                    <div id="gaze" style={{ position: 'absolute', display: 'none', width: '100px', height: '100px', borderRadius: '50%', border: 'solid 2px rgba(255, 255,255, .2)', boxShadow: '0 0 100px 3px rgba(125, 125,125, .5)', pointerEvents: 'none', zIndex: '999999' }}></div>
                    <Stimuli isExpRunning={true} stimuliId={experimentId} onImageChange={handleImageChange} />
                </>
            }
            {experimentStatus === EXPERIMENT_STATUS.FINISHED &&
                <PageLoading />
            }
            <AlertStatus
                title={"Status"}
                description={alertInfo.message}
                open={alertInfo.open}
                setOpen={(open) => setAlertInfo((prev) => ({ ...prev, open }))}
            />
        </div>
    )
}

export default Experiment