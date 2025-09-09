import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select.jsx"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ButtonLoading } from '@/mycomponents/ButtonLoading';
import { ToastAlert } from '@/mycomponents/ToastAlert';
import { initialToastState } from '@/utils/utils';
import { API } from '@/middleware/Api';
import { PRIORITY_LEVEL, TOAST_TYPE } from '@/utils/enums';
import StaredLabel from '@/mycomponents/StaredLabel';

// ✅ Create Component
const GoalCreate = () => {
    const initialGoalData = { name: "", description: "", priority: "", deadline: "" };
    const [goal, setGoal] = useState(initialGoalData);
    const [errors, setErrors] = useState({});
    const [isButtonLoading, setIsButtonLoading] = useState(false);
    const [toastData, setToastData] = useState(initialToastState);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setGoal(prev => ({ ...prev, [name]: value }));
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setIsButtonLoading(true);

        try {
            await API.post('/goals', { ...goal, priority: parseInt(goal.priority) });

            setGoal(initialGoalData);
            setErrors({});
            showToast("Goal created successfully", TOAST_TYPE.SUCCESS);
        } catch (error) {
            console.error(error);
            setErrors(error.response?.data || { message: error.message });
        } finally {
            setIsButtonLoading(false);
        }
    };

    const showToast = (message, type) => setToastData({ message, type, id: Date.now() });

    return (
        <div className="container flex min-h-[90vh] pb-4">
            <Card className="mx-auto my-auto w-[420px]">
                <form onSubmit={handleCreate}>
                    <CardHeader>
                        <CardTitle>Add Goal</CardTitle>
                    </CardHeader>

                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <StaredLabel label="Name" />
                            <Input name="name" value={goal.name} onChange={handleChange} />
                            <p className="validation-error">{errors.name}</p>
                        </div>

                        <div className="space-y-2">
                            <Label>Description</Label>
                            <Textarea name="description" value={goal.description} onChange={handleChange} />
                            <p className="validation-error">{errors.description}</p>
                        </div>

                        <div className="flex flex-col space-y-1.5">
                            <StaredLabel label="Priority" />
                            <Select
                                onValueChange={(value) => setGoal(prev => ({ ...prev, priority: value }))}
                                value={goal.priority || ""}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select priority" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        {Object.entries(PRIORITY_LEVEL).map(([key, value]) => (
                                            <SelectItem key={key} value={value}>
                                                {key}
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                            <p className="validation-error">{errors.priority}</p>
                        </div>

                        <div className="space-y-2">
                            <StaredLabel label="Deadline" />
                            <Input type="date" name="deadline" value={goal.deadline} onChange={handleChange} />
                            <p className="validation-error">{errors.deadline}</p>
                        </div>

                        <p className="validation-error">{errors.message}</p>
                    </CardContent>

                    <CardFooter className="flex-col">
                        {isButtonLoading ? <ButtonLoading css="w-full" /> : <Button type="submit" className="w-full bg-blue-600">Save</Button>}
                        <Link to="/goals" className="w-full text-center mt-2 text-sm underline">Back to Goals</Link>
                    </CardFooter>
                </form>
            </Card>

            {toastData.message && <ToastAlert key={toastData.id} message={toastData.message} type={toastData.type} />}
        </div>
    );
};

export default GoalCreate;
