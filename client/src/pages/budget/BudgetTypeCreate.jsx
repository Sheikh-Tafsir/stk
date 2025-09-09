import React, { useState } from 'react';
import { Link } from 'react-router-dom';
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

const BudgetTypeCreate = () => {
    const [typeData, setTypeData] = useState({ name: "", expense: true, image: "" });
    const [transactionType, setTransactionType] = useState(TRANSACTION_TYPE.EXPENSE);
    const [errors, setErrors] = useState({});
    const [isButtonLoading, setIsButtonLoading] = useState(false);
    const [toastData, setToastData] = useState(initialToastState);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setTypeData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    }

    const handleCreate = async (e) => {
        e.preventDefault();
        setIsButtonLoading(true);

        try {
            await API.post('/budget/type', {
                ...typeData,
                expense: transactionType == TRANSACTION_TYPE.EXPENSE
            });

            setTypeData({ name: "", expense: TRANSACTION_TYPE.EXPENSE, image: "" });
            setErrors([]);
            showToast("Budget type created successfully", TOAST_TYPE.SUCCESS);
        } catch (error) {
            console.error(error);
            setErrors(error.response?.data || { message: error.message });
        } finally {
            setIsButtonLoading(false);
        }
    }

    const showToast = (message, type) => {
        setToastData({ message, type, id: Date.now() });
    }

    return (
        <div className="container pb-8 flex min-h-[90vh]">
            <Card className="mx-auto my-auto w-[420px]">
                <form onSubmit={handleCreate}>
                    <CardHeader>
                        <CardTitle>Add Budget Type</CardTitle>
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

                        <div className="space-y-2 pt-2">
                            <StaredLabel label="Icon/Image URL" />
                            <Input name="image" type="text" value={typeData.image} onChange={handleChange} />
                            <p className='validation-error'>{errors.image}</p>
                        </div>

                        <p className='validation-error'>{errors.message}</p>
                    </CardContent>
                    <CardFooter className="flex-col">
                        {isButtonLoading ?
                            <ButtonLoading css={"w-full"} /> :
                            <Button type="submit" className="w-full bg-blue-600">Save</Button>
                        }
                        <Link to="/budget/type" className="w-full text-center mt-2 text-sm underline">
                            Back to Budget Types
                        </Link>
                        <Link to="/budget/transaction/create" className="w-full text-center mt-2 text-sm underline">
                            Back to Create Transaction
                        </Link>
                    </CardFooter>
                </form>
            </Card>

            {toastData.message && (
                <ToastAlert key={toastData.id} message={toastData.message} type={toastData.type} />
            )}
        </div>
    )
}

export default BudgetTypeCreate;