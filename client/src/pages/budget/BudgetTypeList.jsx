import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { format } from "date-fns";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import PageLoadingOverlay from '@/mycomponents/pageLoadingOverlay/PageLoadingOverlay';
import { API } from '@/middleware/Api';
import { isAdmin, REGULAR_DATE_FORMAT } from '@/utils/utils';
import { Button } from '@/components/ui/button';
import { Pencil, Plus } from 'lucide-react';
import { useUserContext } from '@/context/UserContext';

const BudgetTypeList = () => {
    const navigate = useNavigate();
    const { user } = useUserContext();

    const [isPageLoading, setIsPageLoading] = useState(true);
    const [types, setTypes] = useState([]);

    useEffect(() => {
        const getTypes = async () => {
            setIsPageLoading(true);

            try {
                const response = await API.get('/budget/type');

                setTypes(response.data.data);
            } catch (error) {
                console.error(error);
            } finally {
                setIsPageLoading(false);
            }
        };

        getTypes();
    }, []);

    const handleEditType = (id) => {
        navigate(`/budget/type/${id}`);
    }

    return (
        <>
            {isPageLoading && <PageLoadingOverlay />}

            <div className='container pt-4 min-h-[90vh]'>
                <h1 className='text-center text-2xl lg:text-2xl xl:text-3xl mb-4'>Budget Types</h1>

                {isAdmin(user.role) && <Button className="mb-4 bg-blue-600" onClick={() => { navigate('/budget/type/create') }}>
                    <Plus className="h-4 w-4" />
                    Add New Type
                </Button>}

                <hr className="my-4" />

                {/* Table */}
                <Table className="cursor-pointer bg-white">
                    <TableHeader>
                        <TableRow className="bg-blue-100 hover:bg-blue-200 transform transition-colors duration-200">
                            <TableHead className="text-black text-base">Name</TableHead>
                            <TableHead className="text-black text-base">Created</TableHead>
                            <TableHead className="text-black text-base">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {types.length > 0 ?
                            types.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell>{item.name}</TableCell>
                                    <TableCell>{format(item.createdAt, REGULAR_DATE_FORMAT)}</TableCell>
                                    <TableCell className="flex gap-2">
                                        {(item.userId == user.id || isAdmin(user.role)) &&
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="hover:bg-blue-600 text-blue-600 hover:text-white"
                                                onClick={() => handleEditType(item.id)}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                        }
                                    </TableCell>
                                </TableRow>
                            ))
                            :
                            <TableRow>
                                <TableCell></TableCell>
                                <TableCell>Nothing to show</TableCell>
                                <TableCell></TableCell>
                            </TableRow>
                        }
                    </TableBody>
                </Table>
            </div>
        </>
    )
}

export default BudgetTypeList