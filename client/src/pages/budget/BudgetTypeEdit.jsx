import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select.jsx"
import { Input } from "@/components/ui/input"
import { ButtonLoading } from '@/mycomponents/ButtonLoading';
import { initialToastState } from '@/utils/utils';
import { API } from '@/middleware/Api';
import StaredLabel from '@/mycomponents/StaredLabel';
import { TOAST_TYPE, TRANSACTION_TYPE } from '@/utils/enums';
import { ToastAlert } from '@/mycomponents/ToastAlert';
import PageLoadingOverlay from '@/mycomponents/pageLoadingOverlay/PageLoadingOverlay';

const BudgetTypeEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const isEditable = location.pathname.endsWith("/edit");

    const [typeData, setTypeData] = useState({ name: "", expense: true, image: "" });
    const [transactionType, setTransactionType] = useState(TRANSACTION_TYPE.EXPENSE);
    const [errors, setErrors] = useState({});
    const [isPageLoading, setIsPageLoading] = useState(true);
    const [isButtonLoading, setIsButtonLoading] = useState(false);
    const [toastData, setToastData] = useState(initialToastState);

    useEffect(() => {
        const fetchType = async () => {
            try {
                const response = await API.get(`/budget/type/${id}`);
                setTypeData(response.data.data);
                if (response.data.data.expense) {
                    setTransactionType(TRANSACTION_TYPE.EXPENSE);
                } else {
                    setTransactionType(TRANSACTION_TYPE.INCOME);
                }
            } catch (error) {
                console.error(error);
                howToast("Failed to get budget type", TOAST_TYPE.ERROR);
            } finally {
                setIsPageLoading(false);
            }
        }

        if (id) fetchType();
    }, [id]);

    const handleUpdate = async (e) => {
        e.preventDefault();
        setIsButtonLoading(true);
        try {
            await API.put(`/budget/type/${id}`, typeData);
            setErrors([]);
            showToast("Budget type updated successfully", TOAST_TYPE.SUCCESS);
        } catch (error) {
            console.error(error);
            setErrors(error.response?.data || { message: error.message });
        } finally {
            setIsButtonLoading(false);
        }
    }

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setTypeData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    }

    const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to delete this budget type?")) return;
        setIsButtonLoading(true);
        try {
            await API.delete(`/budget/type/${id}`);
            showToast("Budget type deleted", TOAST_TYPE.SUCCESS);
            setTimeout(() => navigate("/budget/type", { replace: true }), 500);
        } catch (error) {
            console.error(error);
            showToast("Failed to delete budget type", TOAST_TYPE.ERROR);
        } finally {
            setIsButtonLoading(false);
        }
    }

    const showToast = (message, type) => setToastData({ message, type, id: Date.now() });

    return (
        <>
            {isPageLoading && <PageLoadingOverlay />}

            <div className="container flex min-h-[90vh] pb-8">
                <Card className="mx-auto my-auto w-[420px]">
                    <form onSubmit={handleUpdate}>
                        <fieldset disabled={!isEditable}>
                            <CardHeader>
                                <CardTitle>{isEditable ? "Edit" : "View"} Budget Type</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <StaredLabel label="Name" />
                                    <Input name="name" type="text" value={typeData.name} onChange={handleChange} />
                                    <p className='validation-error'>{errors.name}</p>
                                </div>

                                <div className="flex flex-col space-y-1.5">
                                    <StaredLabel label="Income/Expense" />
                                    <Select onValueChange={setTransactionType} value={transactionType}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                {Object.entries(TRANSACTION_TYPE).map(([key, value]) => (
                                                    <SelectItem key={key} value={value}>{value}</SelectItem>
                                                ))}
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                    <p className="validation-error">{errors.typeId}</p>
                                </div>

                                <div className="space-y-2">
                                    <StaredLabel label="Icon/Image URL" />
                                    <Input name="image" type="text" value={typeData.image} onChange={handleChange} />
                                    <p className='validation-error'>{errors.image}</p>
                                </div>
                                <p className='validation-error'>{errors.message}</p>
                            </CardContent>
                        </fieldset>

                        <CardFooter className="flex-col">
                            {isButtonLoading ? <ButtonLoading css={"w-full"} /> :
                                !isEditable ? (
                                    <div className='w-full flex gap-2'>
                                        <Button type="button" className="w-full bg-gray-600 hover:bg-gray-800" onClick={() => navigate(`edit`)}>Edit</Button>
                                        <Button type="button" className="w-full bg-red-600 hover:bg-red-900" onClick={handleDelete}>Delete</Button>
                                    </div>
                                ) : <Button type="submit" className="w-full bg-blue-600">Save</Button>
                            }
                            <Link to="/budget/type" className="w-full text-center mt-2 text-sm underline">Back to Budget Types</Link>
                        </CardFooter>
                    </form>
                </Card>
            </div>
            {toastData.message && <ToastAlert key={toastData.id} message={toastData.message} type={toastData.type} />}
        </>
    )
}

export default BudgetTypeEdit;
