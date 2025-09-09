import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from '@/components/ui/button';
import { Video, Pencil } from "lucide-react"
import { AlertAction, DIALOG_STATUS } from '@/mycomponents/AlertAction';
import ParticipantGazeExport from '@/pages/participants/ParticipantGazeExport';
import { API } from '@/middleware/Api';
import PaginationButton from '@/mycomponents/PaginationButton';
import PaginationSearch from '@/mycomponents/PaginationSearch';
import { FIRST_PAGE, TOTAL_EXPERIMENTS } from '@/utils/utils';
import { PARTICIPANT_TYPE, TOAST_TYPE, USER_ROLE } from '@/utils/enums';
import PageLoadingOverlay from '@/mycomponents/pageLoadingOverlay/PageLoadingOverlay';
import { ToastAlert } from '@/mycomponents/ToastAlert';
import { useUserContext } from '@/context/UserContext';

const ParticipantList = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryParams = Object.fromEntries(searchParams.entries());
  const { user } = useUserContext();

  const [isPageLoading, setIsPageLoading] = useState(true);
  const [participants, setParticipants] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: '', direction: 'asc' });
  const [selectedParticipant, setSelectedParticipant] = useState(null);
  const [toastData, setToastData] = useState({ message: "", type: "", id: 0 })

  const page = parseInt(queryParams.page) || FIRST_PAGE;

  useEffect(() => {
    if (page <= 0 || totalPages < page) {
      navigate("/participants", { replace: true });
    };

    const getParticipants = async () => {
      setIsPageLoading(true);

      try {
        const response = await API.get('/participants', {
          params: {
            ...queryParams,
          }
        });
        //console.log(response.data);

        setParticipants(response.data.data.rows);
        setTotalPages(response.data.data.totalPages);
      } catch (error) {
        console.error('Error getting participant list', error);
      } finally {
        setIsPageLoading(false);
      }
    };

    getParticipants();
  }, [searchParams]);

  const sortedParticipants = useMemo(() => {
    if (!sortConfig.key) return participants;

    return [...participants].sort((a, b) => {
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
  }, [participants, sortConfig]);

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const handleDeleteParticipant = useCallback(async () => {
    if (!selectedParticipant) return;

    try {
      setParticipants((prevParticipants) =>
        prevParticipants.filter((p) => p.id !== selectedParticipant.id)
      );

      await API.delete(`/participants/${selectedParticipant.id}`);
    } catch (error) {
      console.error('Error deleting participant:', error);
      showToast("Failed to delete participant", TOAST_TYPE.ERROR)
    }
  }, [selectedParticipant]);

  const showToast = (message, type) => {
    setToastData({ message, type, id: Date.now() }) // ensure uniqueness
  }

  return (
    <>
      {isPageLoading && <PageLoadingOverlay />}

      <div className='container min-h-[90vh] pt-2'>
        <h1 className='text-center text-2xl lg:text-2xl xl:text-3xl mb-[10px]'>Participant List</h1>
        {user.role == USER_ROLE.CARE_GIVER &&
          <div className='flex mb-[2%] '>
            <Button className="flex bg-blue-600"
              onClick={() => navigate('/participants/create')}>Create</Button>
          </div>
        }

        <PaginationSearch moduleName={"Participants"} />

        <Table className="cursor-pointer bg-white w-[100%]">
          <TableHeader>
            <TableRow className="bg-blue-100 hover:bg-blue-200 transform transition-colors duration-200">
              <TableHead className="text-black text-base">Name</TableHead>
              <TableHead className="text-black text-base" onClick={() => handleSort('expCount')}># Exp</TableHead>
              <TableHead className="text-black text-base">Predicted Type</TableHead>
              {[USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN].includes(user.role) &&
                <TableHead className="text-black text-base">Care Giver</TableHead>
              }
              <TableHead className="text-black text-base" onClick={() => handleSort('createdAt')}>Created</TableHead>
              <TableHead className="text-black text-base">Data</TableHead>
              <TableHead className="text-black text-base">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedParticipants.length > 0 ?
              sortedParticipants.map((participant) => (
                <TableRow key={participant.userId} onClick={() => setSelectedParticipant(participant)}>
                  <TableCell>{participant.name}</TableCell>
                  <TableCell>{participant.expCount}/{TOTAL_EXPERIMENTS}</TableCell>
                  <TableCell className={participant.prediction == PARTICIPANT_TYPE.TD ? "text-green-600" : "text-red-600"}>
                    {participant?.prediction}
                  </TableCell>
                  {[USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN].includes(user.role) &&
                    <TableCell>{participant?.CareGiver?.User?.name}</TableCell>
                  }
                  <TableCell>{participant.createdAt}</TableCell>
                  <TableCell>
                    <ParticipantGazeExport id={participant.userId}
                      onDownloadResult={showToast}
                    />
                  </TableCell>
                  <TableCell className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="hover:bg-green-600 text-green-600 hover:text-white"
                      onClick={() => navigate(`/participants/${participant.userId}/experiments`)}
                    >
                      <Video className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="hover:bg-blue-600 text-blue-600 hover:text-white"
                      onClick={() => navigate(`/participants/${participant.userId}`)}
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

export default ParticipantList