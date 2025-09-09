import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select.jsx"
import { Input } from "@/components/ui/input"
import { ButtonLoading } from '@/mycomponents/ButtonLoading';
import { initialToastState } from '@/utils/utils';
import { API } from '@/middleware/Api';
import StaredLabel from '@/mycomponents/StaredLabel';
import { DAYS_OF_WEEK, TOAST_TYPE } from '@/utils/enums';
import { ToastAlert } from '@/mycomponents/ToastAlert';

const ClassCreate = () => {
    const [classData, setClassData] = useState({
        course: "",
        teacher: "",
        day: "",
        startTime: "",
        endTime: "",
    });
    const [errors, setErrors] = useState({});
    const [isButtonLoading, setIsButtonLoading] = useState(false);
    const [toastData, setToastData] = useState(initialToastState);

    const handleChange = (e) => {
        setClassData({ ...classData, [e.target.name]: e.target.value });
    };

    const handleCreate = async (e) => {
        e.preventDefault();

        setIsButtonLoading(true);

        try {
            await API.post('/class', classData);
            //console.log(response.data.data);

            setClassData({
                course: "",
                teacher: "",
                day: "",
                startTime: "",
                endTime: "",
            });
            setErrors([]);
            showToast("Successfully Created", TOAST_TYPE.SUCCESS);
        } catch (error) {
            setErrors(error.response?.data || { message: error.message });
        } finally {
            setIsButtonLoading(false);
        }
    };

    const showToast = (message, type) => {
        setToastData({ message, type, id: Date.now() });
    }

    return (
        <div className="container flex min-h-[90vh]">
            <Card className="mx-auto my-auto w-[420px]">
                <form onSubmit={handleCreate}>
                    <CardHeader>
                        <CardTitle>Add Class</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <StaredLabel label="Course" />
                            <Input name="course" type="text" value={classData.course} onChange={handleChange} />
                            <p className='validation-error'>{errors.course || ""}</p>
                        </div>

                        <div className="space-y-2">
                            <StaredLabel label="Teacher" />
                            <Input name="teacher" type="text" value={classData.teacher} onChange={handleChange} />
                            <p className='validation-error'>{errors.teacher || ""}</p>
                        </div>

                        <div className="flex flex-col space-y-1.5">
                            <StaredLabel label="Day" />
                            <Select onValueChange={(value) => setClassData((prev) => ({ ...prev, "day": value }))} value={classData.day || ""}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select day" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectItem value={null}>Please select</SelectItem>
                                        {Object.entries(DAYS_OF_WEEK).map(([dayName, dayValue]) => (
                                            <SelectItem key={dayValue} value={dayValue}>
                                                {dayName}  {/* Display "SUNDAY", "MONDAY", etc. */}
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                            <p className='validation-error'>{errors.day}</p>
                        </div>

                        <div className="space-y-2">
                            <StaredLabel label="Start Time" />
                            <Input name="startTime" type="time" value={classData.startTime} onChange={handleChange} />
                            <p className='validation-error'>{errors.startTime}</p>
                        </div>

                        <div className="space-y-2">
                            <StaredLabel label="End Time" />
                            <Input name="endTime" type="time" value={classData.endTime} onChange={handleChange} />
                            <p className='validation-error'>{errors.endTime}</p>
                        </div>

                        <p className='validation-error'>{errors.message || ""}</p>
                    </CardContent>

                    <CardFooter className="flex-col">
                        {isButtonLoading ?
                            <ButtonLoading css={"w-full bg-blue-600"} /> :
                            <Button type="submit" className="w-full bg-blue-600">Save</Button>
                        }

                        <Link to="/class" className="w-full text-center mt-2 text-sm underline">
                            Back to Schedule
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

export default ClassCreate