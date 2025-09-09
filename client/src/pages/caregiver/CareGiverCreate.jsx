import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ButtonLoading } from '@/mycomponents/ButtonLoading';
import { initialToastState, MAX_PARTICIPANT_COUNT } from '@/utils/utils';
import { API } from '@/middleware/Api';
import StaredLabel from '@/mycomponents/StaredLabel';
import { TOAST_TYPE } from '@/utils/enums';
import { ToastAlert } from '@/mycomponents/ToastAlert';
import ImageInput from '@/mycomponents/ImageInput';

const CareGiverCreate = () => {
    const [caregiver, setCaregiver] = useState({
        name: "",
        email: "",
        maxParticipantCount: 20,
    });
    const [image, setImage] = useState(null);
    const [errors, setErrors] = useState([]);
    const [isButtonLoading, setIsButtonLoading] = useState(false);
    const [toastData, setToastData] = useState(initialToastState);

    const handleChange = (e) => {
        setCaregiver({ ...caregiver, [e.target.name]: e.target.value });
    }

    const handleCreate = async (e) => {
        e.preventDefault();

        setIsButtonLoading(true);

        try {
            await API.post('/caregivers', prepareFormData(), {
                headers: { 'Content-Type': 'multipart/form-data' },
                timeout: 20000
            });
            //console.log(response.data.data);

            setCaregiver({
                name: "",
                email: "",
                maxParticipantCount: 20
            });
            setErrors([]);
            showToast("Successfully Created", TOAST_TYPE.SUCCESS);
        } catch (error) {
            setErrors(error.response?.data || { message: error.message });
        } finally {
            setIsButtonLoading(false);
        }
    };

    const prepareFormData = () => {
        const fd = new FormData();
        Object.entries(caregiver).forEach(([key, val]) => {
            if (val) fd.append(key, val);
        });

        if (image) fd.append('image', image);
        return fd;
    }

    const showToast = (message, type) => {
        setToastData({ message, type, id: Date.now() });
    }

    return (
        <div className="min-h-[90vh] flex">
            <Card className="mx-auto my-auto w-[420px]">
                <form onSubmit={handleCreate}>
                    <CardHeader>
                        <CardTitle>Add Mentor</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <ImageInput
                            onImageChange={setImage}
                            error={errors.image}
                        />

                        <div className="space-y-2">
                            <StaredLabel label="Name" />
                            <Input id="name" name="name" type="text" placeholder="John doe" value={caregiver.name} onChange={handleChange} />
                            <p className='validation-error'>{errors.name || ""}</p>
                        </div>

                        <div className="space-y-2">
                            <StaredLabel label="Email" />
                            <Input id="email" name="email" type="email" placeholder="john12@gmail.com" value={caregiver.email} onChange={handleChange} />
                            <p className='validation-error'>{errors.email || ""}</p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="maxParticipantCount" className="flex">Max Participant Count</Label>
                            <Input id="maxParticipantCount" name="maxParticipantCount" type="number" max={MAX_PARTICIPANT_COUNT} value={caregiver.maxParticipantCount} onChange={handleChange} />
                            <p className='validation-error'>{errors.maxParticipantCount || ""}</p>
                        </div>

                        <p className='validation-error'>{errors.message || ""}</p>
                    </CardContent>

                    <CardFooter className="flex-col">
                        {isButtonLoading ?
                            <ButtonLoading css={"w-full"} /> :
                            <Button type="submit" className="w-full">Save</Button>
                        }

                        <Link to="/caregivers" className="w-full text-center mt-2 text-sm underline">
                            Back to Mentor List
                        </Link>
                    </CardFooter>
                </form>
            </Card>

            {toastData.message && (
                <ToastAlert
                    key={toastData.id}
                    message={toastData.message}
                    type={toastData.type}
                />
            )}
        </div>
    )
}

export default CareGiverCreate