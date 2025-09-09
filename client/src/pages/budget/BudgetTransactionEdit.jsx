import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select.jsx"
import { Input } from "@/components/ui/input"
import { ButtonLoading } from '@/mycomponents/ButtonLoading';
import { initialToastState } from '@/utils/utils';
import { API } from '@/middleware/Api';
import StaredLabel from '@/mycomponents/StaredLabel';
import { TRANSACTION_TYPE, TOAST_TYPE } from '@/utils/enums';
import { ToastAlert } from '@/mycomponents/ToastAlert';
import PageLoadingOverlay from '@/mycomponents/pageLoadingOverlay/PageLoadingOverlay';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const BudgetTransactionEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const isEditable = location.pathname.endsWith("/edit");

    const initialTransactionData = { typeId: "", name: "", description: "", date: "", amount: "" };
    const [transactionData, setTransactionData] = useState(initialTransactionData);
    const [budgetTypes, setBudgetTypes] = useState([]);
    const [shownBudgetTypes, setShownBudgetTypes] = useState([]);
    const [transactionType, setTransactionType] = useState(TRANSACTION_TYPE.EXPENSE);
    const [errors, setErrors] = useState({});
    const [isPageLoading, setIsPageLoading] = useState(true);
    const [isButtonLoading, setIsButtonLoading] = useState(false);
    const [toastData, setToastData] = useState(initialToastState);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [typesResp, transactionResp] = await Promise.all([
                    API.get('/budget/type'),
                    API.get(`/budget/transaction/${id}`)
                ]);

                // console.log(typesResp.data.data);
                // console.log(transactionResp.data.data);
                setBudgetTypes(typesResp.data.data);

                const transaction = transactionResp.data.data;
                const dateObj = new Date(`${transaction.year}-${transaction.month}-${transaction.day}`);
                transaction.date = dateObj.toISOString().split("T")[0];
                setTransactionData(transaction);
            } catch (error) {
                console.error(error);
                showToast("Failed to get Budget Transaction", TOAST_TYPE.ERROR);
            } finally {
                setIsPageLoading(false);
            }
        }
        fetchData();
    }, [id]);

    // Update shown budget types whenever transaction type or budgetTypes changes
    useEffect(() => {
        setShownBudgetTypes(
            budgetTypes.filter(item => item.expense == (transactionType === TRANSACTION_TYPE.EXPENSE))
        );
    }, [transactionType, budgetTypes]);

        const handleChange = (e) => {
        const { name, value } = e.target;
        setTransactionData(prev => ({ ...prev, [name]: value }));
    }

    const handleCreate = async (e) => {
        e.preventDefault();
        setIsButtonLoading(true);

        try {
            await API.put(`/budget/transaction/${id}`, transactionData);

            setErrors({});
            showToast("Transaction created successfully", TOAST_TYPE.SUCCESS);
        } catch (error) {
            console.error(error);
            setErrors(error.response?.data || { message: error.message });
        } finally {
            setIsButtonLoading(false);
        }
    }

    const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to delete this transaction?")) return;
        setIsButtonLoading(true);
        try {
            await API.delete(`/budget/transaction/${id}`);
            showToast("Budget Transaction deleted", TOAST_TYPE.SUCCESS);
            setTimeout(() => navigate("/budget/transaction", { replace: true }), 500);
        } catch (error) {
            console.error(error);
            showToast("Failed to delete Budget Transaction", TOAST_TYPE.ERROR);
        } finally {
            setIsButtonLoading(false);
        }
    }

    const showToast = (message, type) => setToastData({ message, type, id: Date.now() });

    return (
        <>
            {isPageLoading && <PageLoadingOverlay />}
            <div className="container pb-8">
                <Card className="mx-auto my-auto w-[420px]">
                    <form onSubmit={handleCreate}>
                        <fieldset disabled={!isEditable}>
                            <CardHeader>
                                <CardTitle>{isEditable ? "Edit" : "View"} Transaction</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Transaction Type */}
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
                                </div>

                                {/* Budget Type */}
                                <div className="flex flex-col space-y-1.5">
                                    <StaredLabel label="Type" />
                                    <select
                                        className="border rounded px-2 py-2 bg-white text-sm outline-none"
                                        onChange={(e) =>
                                            setTransactionData((prev) => ({ ...prev, typeId: e.target.value }))
                                        }
                                        value={transactionData.typeId || ""}
                                    >
                                        <option value="" disabled>
                                            Select type
                                        </option>
                                        {shownBudgetTypes.map((item) => (
                                            <option key={item.id} value={item.id}>
                                                {item.name}
                                            </option>
                                        ))}
                                    </select>
                                    <p className="validation-error">{errors.typeId}</p>
                                </div>

                                <div className="space-y-2">
                                    <Label>Name</Label>
                                    <Input name="name" type="text" value={transactionData.name || ""} onChange={handleChange} />
                                    <p className='validation-error'>{errors.name}</p>
                                </div>

                                <div className="space-y-2">
                                    <Label>Description</Label>
                                    <Textarea name="description" type="text" value={transactionData.description || ""} onChange={handleChange} />
                                    <p className='validation-error'>{errors.description}</p>
                                </div>

                                {/* Date fields */}
                                <div className="grid grid-cols-3 gap-2">
                                    <div className="space-y-2">
                                        <StaredLabel label="Date" />
                                        <Input name="date" type="date" value={transactionData.date} onChange={handleChange} className="w-full" />
                                        <p className="validation-error">{errors.date}</p>
                                    </div>
                                </div>

                                {/* Amount */}
                                <div className="space-y-2">
                                    <StaredLabel label="Amount" />
                                    <Input name="amount" type="number" step="0.01" value={transactionData.amount} onChange={handleChange} />
                                    <p className="validation-error">{errors.amount}</p>
                                </div>

                                <p className="validation-error">{errors.message}</p>
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
                            <Link to="/budget/transaction" className="w-full text-center mt-2 text-sm underline">Back to Transactions</Link>
                        </CardFooter>
                    </form>
                </Card>
            </div>

            {toastData.message && <ToastAlert key={toastData.id} message={toastData.message} type={toastData.type} />}
        </>
    )
}

export default BudgetTransactionEdit;