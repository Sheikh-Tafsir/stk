import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams, useLocation } from 'react-router-dom';
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
import PageLoadingOverlay from '@/mycomponents/pageLoadingOverlay/PageLoadingOverlay';
import { Checkbox } from '@/components/ui/checkbox';

const GoalEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const isEditable = location.pathname.endsWith("/edit");

    const initialGoalData = { name: "", description: "", priority: 1, deadline: "", completed: false };
    const [goal, setGoal] = useState(initialGoalData);
    const [errors, setErrors] = useState({});
    const [isPageLoading, setIsPageLoading] = useState(true);
    const [isButtonLoading, setIsButtonLoading] = useState(false);
    const [toastData, setToastData] = useState(initialToastState);

    useEffect(() => {
        const fetchGoal = async () => {
            try {
                const response = await API.get(`/goals/${id}`);
                response.data.data.priority = response.data.data.priority.toString();
                setGoal(response.data.data);
            } catch (error) {
                console.error(error);
                showToast("Could not fetch goal", TOAST_TYPE.ERROR);
            } finally {
                setIsPageLoading(false);
            }
        };
        fetchGoal();
    }, [id]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setGoal(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setIsButtonLoading(true);
        try {
            await API.put(`/goals/${id}`, goal);
            setErrors({});
            showToast("Goal updated successfully", TOAST_TYPE.SUCCESS);
        } catch (error) {
            console.error(error);
            setErrors(error.response?.data || { message: error.message });
        } finally {
            setIsButtonLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to delete this goal?")) return;
        setIsButtonLoading(true);
        try {
            await API.delete(`/goal/${id}`);
            showToast("Goal deleted", TOAST_TYPE.SUCCESS);
            setTimeout(() => navigate("/goal", { replace: true }), 500);
        } catch (error) {
            console.error(error);
            showToast("Could not delete goal", TOAST_TYPE.ERROR);
        } finally {
            setIsButtonLoading(false);
        }
    };

    const showToast = (message, type) => setToastData({ message, type, id: Date.now() });

    return (
        <>
            {isPageLoading && <PageLoadingOverlay />}

            <div className="container min-h-[90vh] flex">
                <Card className="mx-auto my-auto w-[420px]">
                    <form onSubmit={handleUpdate}>
                        <fieldset disabled={!isEditable}>
                            <CardHeader>
                                <CardTitle>{isEditable ? "Edit" : "View"} Goal</CardTitle>
                            </CardHeader>

                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <StaredLabel label="Name" />
                                    <Input name="name" value={goal.name || ""} onChange={handleChange} />
                                    <p className="validation-error">{errors.name}</p>
                                </div>

                                <div className="space-y-2">
                                    <Label>Description</Label>
                                    <Textarea name="description" value={goal.description || ""} onChange={handleChange} />
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
                                    <Input type="date" name="deadline" value={goal.deadline || ""} onChange={handleChange} />
                                    <p className="validation-error">{errors.deadline}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Checkbox
                                        id="completed"
                                        checked={goal.completed || false}
                                        onCheckedChange={(checked) =>
                                            setGoal((prev) => ({ ...prev, completed: checked }))
                                        }
                                    />
                                    <Label htmlFor="completed">Completed</Label>
                                </div>

                                <p className="validation-error">{errors.message}</p>
                            </CardContent>
                        </fieldset>

                        <CardFooter className="flex-col">
                            {isButtonLoading ? <ButtonLoading css="w-full" /> : !isEditable ? (
                                <div className="w-full flex gap-2">
                                    <Button type="button" className="w-full bg-gray-600" onClick={() => navigate(`edit`)}>Edit</Button>
                                    <Button type="button" className="w-full bg-red-600" onClick={handleDelete}>Delete</Button>
                                </div>
                            ) : (
                                <Button type="submit" className="w-full bg-blue-600">Save</Button>
                            )}

                            <Link to="/goals" className="w-full text-center mt-2 text-sm underline">Back to Goals</Link>
                        </CardFooter>
                    </form>
                </Card>
            </div>

            {toastData.message && <ToastAlert key={toastData.id} message={toastData.message} type={toastData.type} />}
        </>
    );
};

export default GoalEdit;