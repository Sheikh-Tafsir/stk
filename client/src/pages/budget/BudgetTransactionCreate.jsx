import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus } from 'lucide-react';

const BudgetTransactionCreate = () => {
  const navigate = useNavigate();

  const initialTransactionData = { typeId: "", name: "", description: "", date: "", amount: "" };
  const [transactionData, setTransactionData] = useState(initialTransactionData);
  const [budgetTypes, setBudgetTypes] = useState([]);
  const [shownBudgetTypes, setShownBudgetTypes] = useState([]);
  const [transactionType, setTransactionType] = useState(TRANSACTION_TYPE.EXPENSE);
  const [errors, setErrors] = useState({});
  const [isButtonLoading, setIsButtonLoading] = useState(false);
  const [toastData, setToastData] = useState(initialToastState);

  useEffect(() => {
    const fetchBudgetTypes = async () => {
      try {
        const response = await API.get('/budget/type');
        setBudgetTypes(response.data.data || []);
      } catch (error) {
        console.error('Error fetching budget types:', error);
      }
    };
    fetchBudgetTypes();
  }, []);

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
      await API.post('/budget/transaction', transactionData);

      setTransactionData(initialTransactionData);
      setErrors({});
      showToast("Transaction created successfully", TOAST_TYPE.SUCCESS);
    } catch (error) {
      console.error(error);
      setErrors(error.response?.data || { message: error.message });
    } finally {
      setIsButtonLoading(false);
    }
  }

  const showToast = (message, type) => setToastData({ message, type, id: Date.now() });

  return (
    <div className="container flex min-h-[90vh] pb-4">
      <Card className="mx-auto my-auto w-[420px]">
        <form onSubmit={handleCreate}>
          <CardHeader>
            <CardTitle>Add Transaction</CardTitle>
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
              <div className='flex'>
                <Select
                  onValueChange={(value) => setTransactionData(prev => ({ ...prev, typeId: value }))}
                  value={transactionData.typeId || ""}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {shownBudgetTypes.map(item => (
                        <SelectItem key={item.id} value={String(item.id)}>
                          {item.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>

                <Button variant="outline" className="ml-2" onClick={() => navigate('/budget/type/create')}>
                  <Plus />
                </Button>
              </div>
              <p className="validation-error">{errors.typeId}</p>
            </div>

            <div className="space-y-2">
              <Label>Name</Label>
              <Input name="name" type="text" value={transactionData.name} onChange={handleChange} />
              <p className='validation-error'>{errors.name}</p>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea name="description" type="text" value={transactionData.description} onChange={handleChange} />
              <p className='validation-error'>{errors.description}</p>
            </div>

            {/* Date fields */}
            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-2">
                <StaredLabel label="Date" />
                <Input name="date" type="date" value={transactionData.date} onChange={handleChange} className="w-[370px]" />
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

          <CardFooter className="flex-col">
            {isButtonLoading
              ? <ButtonLoading css={"w-full"} />
              : <Button type="submit" className="w-full bg-blue-600">Save</Button>}
            <Link to="/budget/transaction" className="w-full text-center mt-2 text-sm underline">Back to Transactions</Link>
          </CardFooter>
        </form>
      </Card>

      {toastData.message && <ToastAlert key={toastData.id} message={toastData.message} type={toastData.type} />}
    </div>
  )
}

export default BudgetTransactionCreate;
