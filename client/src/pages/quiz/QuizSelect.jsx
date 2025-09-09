import React, { useState } from 'react';

import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectGroup, SelectItem } from "@/components/ui/select.jsx";
import { useNavigate } from 'react-router-dom';
import { COURSES, DIFFICULTY_LEVEL, USER_ROLE } from '@/utils/enums';
import { useUserContext } from '@/context/UserContext';
import { isAdmin } from '@/utils/utils';

const QuizSelect = () => {
    const navigate = useNavigate();
    const { user } = useUserContext();

    const [difficulty, setDifficulty] = useState("");
    const [course, setCourse] = useState("");
    const [errors, setErrors] = useState({});

    const handleSubmit = async (e) => {
        e.preventDefault();


        const newErrors = {};

        if (!course) {
            newErrors.course = "Select a course";
        }

        if (!difficulty) {
            newErrors.difficulty = "Select difficulty";
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setErrors({});

        if (isAdmin(user.role)) {
            navigate(`/quizes/create?course=${course}&difficulty=${difficulty}`);
        } else if (user.role == USER_ROLE.PATIENT) {
            navigate(`/quizes/participate?course=${course}&difficulty=${difficulty}`);
        }
    }

    return (
        <div className='flex min-h-[90vh]'>
            <Card className="mx-auto my-auto w-[350px]">
                <form onSubmit={handleSubmit}>
                    <CardHeader>
                        <CardTitle>Quiz selection</CardTitle>
                    </CardHeader>

                    <CardContent className="gap-4 space-y-4">
                        <div className="space-y-2">
                            <Label>Course</Label>
                            <Select value={course} onValueChange={setCourse}>
                                <SelectTrigger className="border p-2 rounded bg-white text-sm w-full">
                                    <SelectValue placeholder="Select course" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        {Object.entries(COURSES).map(([key, val]) => (
                                            <SelectItem key={key} value={val}>{val}</SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                            <p className="text-red-500 text-sm">{errors.course}</p>
                        </div>

                        <div className="space-y-2">
                            <Label>Difficulty</Label>
                            <Select value={difficulty} onValueChange={setDifficulty}>
                                <SelectTrigger className="border p-2 rounded bg-white text-sm w-full">
                                    <SelectValue placeholder="Select difficulty" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        {Object.entries(DIFFICULTY_LEVEL).map(([key, val]) => (
                                            <SelectItem key={key} value={val}>{val}</SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                            <p className="text-red-500 text-sm">{errors.difficulty}</p>
                        </div>
                    </CardContent>

                    <CardFooter className="flex-col">
                        <Button type="submit" className="w-full">Select</Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    )
}

export default QuizSelect