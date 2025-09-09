import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';

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
import PageLoadingOverlay from '@/mycomponents/pageLoadingOverlay/PageLoadingOverlay';

const ClassEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const isEditable = location.pathname.endsWith("/edit");

    const [classData, setClassData] = useState({
        course: "",
        teacher: "",
        day: "",
        startTime: "",
        endTime: "",
    });
    const [errors, setErrors] = useState({});
    const [isPageLoading, setIsPageLoading] = useState(true);
    const [isButtonLoading, setIsButtonLoading] = useState(false);
    const [toastData, setToastData] = useState(initialToastState);

    useEffect(() => {
        const fetchClass = async () => {
            try {
                const response = await API.get(`/class/${id}`);
                const classInfo = response.data.data;
                setClassData({
                    course: classInfo.course,
                    teacher: classInfo.teacher,
                    day: classInfo.day,
                    startTime: classInfo.startTime,
                    endTime: classInfo.endTime,
                });
            } catch (error) {
                console.error('Error fetching class details:', error);
                showToast("Could not get class", TOAST_TYPE.ERROR);
            } finally {
                setIsPageLoading(false);
            }
        };

        if (id) {
            fetchClass();
        }
    }, [id]);

    const handleUpdate = async (e) => {
        e.preventDefault();

        setIsButtonLoading(true);

        try {
            await API.put(`/class/${id}`, classData);
            //console.log(response.data.data);

            setErrors([]);
            showToast("Successfully Updated", TOAST_TYPE.SUCCESS);
        } catch (error) {
            console.error(error)
            setErrors(error.response?.data || { message: error.message });
        } finally {
            setIsButtonLoading(false);
        }
    };

    const handleChange = (e) => {
        setClassData({ ...classData, [e.target.name]: e.target.value });
    };

    const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to delete this class?")) {
            return;
        }

        setIsButtonLoading(true);

        try {
            await API.delete(`/class/${id}`);

            showToast("Successfully Deleted", TOAST_TYPE.SUCCESS);
            setTimeout(() => {
                navigate("/class");
            }, 500);
        } catch (error) {
            console.error(error)
            showToast("Could not Delete", TOAST_TYPE.ERROR);
        } finally {
            setIsButtonLoading(false);
        }
    }

    const showToast = (message, type) => {
        setToastData({ message, type, id: Date.now() });
    }

    return (
        <>
            {isPageLoading && <PageLoadingOverlay />}

            <div className="container flex min-h-[90vh]">
                <Card className="mx-auto my-auto w-[420px]">
                    <form onSubmit={handleUpdate}>
                        <fieldset disabled={!isEditable}>
                            <CardHeader>
                                <CardTitle>{isEditable ? "Edit" : "View"} Class</CardTitle>
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
                        </fieldset>

                        <CardFooter className="flex-col">
                            {isButtonLoading ?
                                <ButtonLoading css={"w-full"} /> :
                                !isEditable ?
                                    <div className='w-full flex gap-2'>
                                        <Button type="button" className="w-full bg-gray-600 hover:bg-gray-800" onClick={() => navigate(`edit`)}>Edit</Button>
                                        <Button type="button" className="w-full bg-red-600 hover:bg-red-900" onClick={() => handleDelete()}>Delete</Button>
                                    </div>
                                    :
                                    <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-900">Save</Button>
                            }

                            <Link to="/class" className="w-full text-center mt-2 text-sm underline">
                                Back to Schedule
                            </Link>
                        </CardFooter>
                    </form>
                </Card>
            </div >

            {
                toastData.message && (
                    <ToastAlert
                        key={toastData.id}
                        message={toastData.message}
                        type={toastData.type}
                    />
                )
            }
        </>
    )
}

export default ClassEdit