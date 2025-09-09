import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from '@/components/ui/button';
import { Pencil } from "lucide-react"
import { AlertAction, DIALOG_STATUS } from '@/mycomponents/AlertAction';
import { API } from '@/middleware/Api';
import PaginationButton from '@/mycomponents/PaginationButton';
import PaginationSearch from '@/mycomponents/PaginationSearch';
import { FIRST_PAGE, initialToastState } from '@/utils/utils';
import { TOAST_TYPE, USER_ROLE } from '@/utils/enums';
import PageLoadingOverlay from '@/mycomponents/pageLoadingOverlay/PageLoadingOverlay';
import { ToastAlert } from '@/mycomponents/ToastAlert';
import { useUserContext } from '@/context/UserContext';

const CareGiverList = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const queryParams = Object.fromEntries(searchParams.entries());
    const { user } = useUserContext();

    const [isPageLoading, setIsPageLoading] = useState(true);
    const [careGivers, setCareGivers] = useState([]);
    const [totalPages, setTotalPages] = useState(1);
    const [sortConfig, setSortConfig] = useState({ key: '', direction: 'asc' });
    const [selectedCareGiver, setSelectedCareGiver] = useState(null);
    const [toastData, setToastData] = useState(initialToastState)

    const page = parseInt(queryParams.page) || FIRST_PAGE;

    useEffect(() => {
        if (page <= 0 || totalPages < page) {
            navigate("/caregivers", { replace: true });
        };

        const getCareGivers = async () => {
            setIsPageLoading(true);

            try {
                const response = await API.get('/caregivers', {
                    params: {
                        ...queryParams,
                    }
                });
                //console.log(response.data);

                setCareGivers(response.data.data.rows);
                setTotalPages(response.data.data.totalPages);
            } catch (error) {
                console.error('Error getting participant list', error);
            } finally {
                setIsPageLoading(false);
            }
        };

        getCareGivers();
    }, [searchParams]);

    const sortedCareGivers = useMemo(() => {
        if (!sortConfig.key) return careGivers;

        return [...careGivers].sort((a, b) => {
            if (key === 'createdAt') {
                const dateA = new Date(a[key]);
                const dateB = new Date(b[key]);
                return direction === 'asc' ? dateA - dateB : dateB - dateA;
            } else if (key === 'name') {
                const fieldA = a[key].toLowerCase();
                const fieldB = b[key].toLowerCase();
                if (fieldA < fieldB) return direction === 'asc' ? -1 : 1;
                if (fieldA > fieldB) return direction === 'asc' ? 1 : -1;
                return 0;
            } else if (key === 'expCount' || key === 'age') {
                return direction === 'asc' ? a[key] - b[key] : b[key] - a[key];
            }
        });
    }, [careGivers, sortConfig]);

    const handleSort = (key) => {
        setSortConfig((prev) => ({
            key,
            direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
        }));
    };

    const handleDeleteParticipant = useCallback(async () => {
        if (!selectedCareGiver) return;

        try {
            setCareGivers((prevParticipants) =>
                prevParticipants.filter((p) => p.id !== selectedCareGiver.id)
            );

            await API.delete(`/caregivers/${selectedCareGiver.id}`);
        } catch (error) {
            console.error('Error deleting participant:', error);
            showToast("Failed to delete participant", TOAST_TYPE.ERROR)
        }
    }, [selectedCareGiver]);

    const showToast = (message, type) => {
        setToastData({ message, type, id: Date.now() })
    }

    return (
        <>
            {isPageLoading && <PageLoadingOverlay />}

            <div className='container min-h-[90vh] pt-2'>
                <h1 className='text-center text-2xl lg:text-2xl xl:text-3xl mb-[10px]'>Care Giver List</h1>

                <div className='flex mb-[2%] '>
                    <Button className="flex bg-blue-600"
                        onClick={() => navigate('/caregivers/create')}>Create</Button>
                </div>


                <PaginationSearch moduleName={"Care Givers"} />

                <Table className="cursor-pointer bg-white w-[100%]">
                    <TableHeader>
                        <TableRow className="bg-blue-100 hover:bg-blue-200 transform transition-colors duration-200">
                            <TableHead className="text-black text-base">Name</TableHead>
                            <TableHead className="text-black text-base" onClick={() => handleSort('participantCount')}># Patients</TableHead>
                            <TableHead className="text-black text-base" onClick={() => handleSort('createdAt')}>Created</TableHead>
                            <TableHead className="text-black text-base">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sortedCareGivers.length > 0 ?
                            sortedCareGivers.map((careGiver) => (
                                <TableRow key={careGiver.userId} onClick={() => setSelectedCareGiver(careGiver)}>
                                    <TableCell>{careGiver.name}</TableCell>
                                    <TableCell>{careGiver.participantCount}</TableCell>
                                    <TableCell>{careGiver.createdAt}</TableCell>
                                    <TableCell className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="hover:bg-blue-600 text-blue-600 hover:text-white"
                                            onClick={() => navigate(`/caregivers/${careGiver.userId}`)}
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        {(user?.role == USER_ROLE.ADMIN || user?.role == USER_ROLE.SUPER_ADMIN) &&
                                            <AlertAction
                                                onConfirm={handleDeleteParticipant}
                                                description={`Are you sure you want to ${DIALOG_STATUS.DELETE} this participant? This action cannot be undone.`}
                                                status={DIALOG_STATUS.DELETE}
                                            />
                                        }
                                    </TableCell>
                                </TableRow>
                            ))
                            :
                            <TableRow>
                                <TableCell></TableCell>
                                <TableCell>Nothing to show</TableCell>
                                <TableCell></TableCell>
                                <TableCell></TableCell>
                            </TableRow>
                        }
                    </TableBody>
                </Table>

                <PaginationButton totalPages={totalPages} />

                {toastData.message && (
                    <ToastAlert
                        key={toastData.id} // ← forces remount
                        message={toastData.message}
                        type={toastData.type}
                    />
                )}
            </div>
        </>
    )
}

export default CareGiverList