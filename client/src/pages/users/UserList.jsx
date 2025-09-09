import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { format } from "date-fns";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { SquarePlus, Pencil } from "lucide-react"
import { AlertAction, DIALOG_STATUS } from '@/mycomponents/AlertAction';
import { API } from '@/middleware/Api';
import PaginationButton from '@/mycomponents/PaginationButton';
import PaginationSearch from '@/mycomponents/PaginationSearch';
import { TOAST_TYPE, USER_ROLE, USER_STATUS } from '@/utils/enums';
import PageLoadingOverlay from '@/mycomponents/pageLoadingOverlay/PageLoadingOverlay';
import { FIRST_PAGE, getQueryString, REGULAR_DATE_FORMAT } from '@/utils/utils';
import { ToastAlert } from '@/mycomponents/ToastAlert';

const UserList = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryParams = Object.fromEntries(searchParams.entries());

  const [isPageLoading, setIsPageLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: '', direction: 'asc' });
  const [selectedUser, setSelectedUser] = useState(null);
  const [role, setRole] = useState(queryParams.role || "");
  const [status, setStatus] = useState(queryParams.status || "");
  const [toastData, setToastData] = useState({ message: "", type: "", id: 0 })

  const page = parseInt(queryParams.page) || FIRST_PAGE;

  useEffect(() => {
    if (page <= 0 || totalPages < page) {
      navigate("/users", { replace: true });
    };

    setRole(queryParams.role || "");
    setStatus(queryParams.status || "");

    const getUsers = async () => {
      setIsPageLoading(true);

      try {
        const response = await API.get('/users', {
          params: {
            ...queryParams,
          }
        });

        setUsers(response.data.data.rows);
        setTotalPages(response.data.data.totalPages);
      } catch (error) {
        console.error('Error getting user list', error);
        showToast("Could not get user list", TOAST_TYPE.ERROR);
      } finally {
        setIsPageLoading(false);
      }
    };

    getUsers();
  }, [searchParams]);

  useEffect(() => {
    const navQueryParams = {
      ...queryParams,
      role,
      status,
      // hasCareGiver,
    };

    navigate(getQueryString(navQueryParams));
  }, [role, status, navigate]);

  const sortedUsers = useMemo(() => {
    if (!sortConfig.key) return users;

    return [...users].sort((a, b) => {
      const { key, direction } = sortConfig;

      if (key === 'createdAt') {
        const dateA = new Date(a[key]);
        const dateB = new Date(b[key]);
        return direction === 'asc' ? dateA - dateB : dateB - dateA;
      } else {
        const valA = typeof a[key] === 'string' ? a[key].toLowerCase() : a[key];
        const valB = typeof b[key] === 'string' ? b[key].toLowerCase() : b[key];

        if (valA < valB) return direction === 'asc' ? -1 : 1;
        if (valA > valB) return direction === 'asc' ? 1 : -1;
        return 0;
      }
    });

  }, [users, sortConfig]);

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const handleEditUser = (user) => {
    navigate(`/users/${user.id}`, {
      state: { user }
    });
  }

  const changeUserStatus = async (id, status) => {
    try {
      await API.put(`/users/${id}`, {
        status,
      });
    } catch (error) {
      console.error('Error deleting user:', error);
      showToast("Failed to change User status", TOAST_TYPE.ERROR);
    }
  }

  // const acceptUser = async (id) => {
  //   setUsers((participants) =>
  //     participants.map((p) =>
  //       p.id === id ? { ...p, status: USER_STATUS.ACTIVE } : p
  //     )
  //   );
  //   await changeUserStatus(id, USER_STATUS.ACTIVE);

  //   showToast("User Accepted", TOAST_TYPE.SUCCESS);
  // }

  const deleteUser = useCallback(async () => {
    if (!selectedUser) return;

    setUsers((participants) =>
      participants.filter((p) => p.id !== selectedUser.id)
    );
    await changeUserStatus(selectedUser.id, USER_STATUS.SUSPENDED);

    showToast("User deleted", TOAST_TYPE.SUCCESS);
  }, [selectedUser]);

  const showToast = (message, type) => {
    setToastData({ message, type, id: Date.now() }) // ensure uniqueness
  }

  return (
    <>
      {isPageLoading && <PageLoadingOverlay />}

      <div className='container min-h-[90vh] pt-2'>
        <h1 className='text-center text-2xl lg:text-2xl xl:text-3xl mb-[10px]'>User List</h1>

        <PaginationSearch moduleName={"Users"} />

        <Table className="cursor-pointer bg-white w-[100%]">
          <TableHeader>
            <TableRow className="bg-blue-100 hover:bg-blue-200 transform transition-colors duration-200">
              <TableHead className="text-black text-base">Name</TableHead>
              <TableHead className="text-black text-base">Email</TableHead>
              <TableHead className="text-black text-base">
                {/* <p className='my-auto mr-2'>Role</p> */}
                <Select onValueChange={(value) => setRole(value)} value={role}>
                  <SelectTrigger className="my-auto w-[150px]">
                    <SelectValue placeholder="Role" />
                  </SelectTrigger>
                  <SelectContent>
                    < SelectItem value={null}>All</SelectItem>
                    {Object.values(USER_ROLE).map((item) => (
                      <SelectItem key={item} value={item}>
                        {item}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TableHead>
              <TableHead className="text-black text-base" onClick={() => handleSort('createdAt')}>Created</TableHead>
              <TableHead className="text-black text-base">
                <Select onValueChange={(value) => setStatus(value)} value={status}>
                  <SelectTrigger className="my-auto">
                    <SelectValue placeholder="status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={null}>All</SelectItem>
                    {Object.values(USER_STATUS).map((item) => (
                      <SelectItem key={item} value={item}>
                        {item}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TableHead>
              <TableHead className="text-black text-base">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedUsers.length > 0 ?
              sortedUsers.map((item) => (
                <TableRow key={item.id} onClick={() => setSelectedUser(item)}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.email}</TableCell>
                  <TableCell className={(item.role === USER_ROLE.ADMIN || item.role === USER_ROLE.SUPER_ADMIN) ? "text-blue-600" :
                    item.role === USER_ROLE.CARE_GIVER ? "text-green-600" : item.role === USER_ROLE.PATIENT ? "text-red-600" : "text-gray-700"}>
                    {item.role == USER_ROLE.PATIENT ? "User" : item.role == USER_ROLE.CARE_GIVER ? "Mentor" : item.role}
                  </TableCell>
                  <TableCell>{format(item.createdAt, REGULAR_DATE_FORMAT)}</TableCell>
                  <TableCell className={(item.status === USER_STATUS.ACTIVE ? "text-green-600" : "text-red-600")}>{item.status}</TableCell>
                  <TableCell className="flex gap-2">
                    {/* {item.status == USER_STATUS.INACTIVE && (!item.role || item.role != USER_ROLE.PATIENT) &&
                      <Button
                        variant="outline"
                        size="icon"
                        className="hover:bg-green-600 text-green-600 hover:text-white"
                        onClick={() => acceptUser(item.id)}
                      >
                        <SquarePlus className="h-4 w-4" />
                      </Button>
                    } */}
                    <Button
                      variant="outline"
                      size="icon"
                      className="hover:bg-blue-600 text-blue-600 hover:text-white"
                      onClick={() => handleEditUser(item)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <AlertAction
                      onConfirm={deleteUser}
                      description={`Are you sure you want to ${DIALOG_STATUS.DELETE} this participant? This action cannot be undone.`}
                      status={DIALOG_STATUS.DELETE}
                    />
                  </TableCell>
                </TableRow>
              ))
              :
              <TableRow>
                <TableCell></TableCell>
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

export default UserList