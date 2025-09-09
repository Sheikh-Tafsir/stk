import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { Button } from "@/components/ui/button.jsx"
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card.jsx"
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select.jsx"
import { Label } from '@/components/ui/label.jsx';
import PageLoading from '@/mycomponents/loading/PageLoading.jsx';
import { API } from '@/middleware/Api';
import { isInRange, TOTAL_EXPERIMENTS } from '@/utils/utils';
import { REQUIRED } from '@/utils/messages';

const ExperimentSelect = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [experiment, setExperiment] = useState(0);
    const [experiments, setExperiments] = useState([]);
    const [isPageLoading, setIsPageLoading] = useState(true);
    const [responseMessage, setResponseMessage] = useState("");

    useEffect(() => {
        const getAllPendingStimuli = async () => {
            try {
                const response = await API.get(`/participants/${id}/experiments-pending`);
                if (response.data?.data.length == 0) {
                    setResponseMessage("No pending stimuli found");
                    return;
                }

                setExperiments(response.data?.data);
            }
            catch (error) {
                console.error("Could not get experiments:", error);
            }
            finally {
                setIsPageLoading(false);
            }
        }

        getAllPendingStimuli();
    }, [id]);

    const startExperiment = (e) => {
        e.preventDefault();

        if (!isInRange(experiment, 1, TOTAL_EXPERIMENTS)) {
            setResponseMessage(REQUIRED)
        } else {
            navigate(`/participants/${id}/experiments/${experiment}`);
        }
    };

    return (
        <div className='min-h-[100vh] flex bg-gradient-to-br from-blue-50 to-indigo-100'>
            {isPageLoading ?
                <PageLoading />
                :
                <Card className="w-[400px] mx-auto my-auto">
                    <form onSubmit={startExperiment}>
                        <CardHeader>
                            <CardTitle>Start Experiments</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-1">
                                <Label>Experiment</Label>
                                <Select onValueChange={(value) => setExperiment(value)} >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectLabel>Select Experiments</SelectLabel>
                                            {experiments.map((exp) => (
                                                <SelectItem key={exp} value={String(exp)}>
                                                    {exp}
                                                </SelectItem>
                                            ))}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                                <p className='validation-error'>{responseMessage}</p>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button className='w-[100%] bg-blue-600'>Start</Button>
                        </CardFooter>
                    </form>
                </Card>
            }
        </div >
    )
}

export default ExperimentSelect