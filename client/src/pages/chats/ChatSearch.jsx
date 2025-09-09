import React, { useState } from "react"
import { useQuery } from '@tanstack/react-query';

import { cn } from "@/lib/utils"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import { API } from "@/middleware/Api";
import InsiderLoading from "@/mycomponents/loading/InsiderLoading";
import { Badge } from "@/components/ui/badge";
import { USER_ROLE } from "@/utils/enums";

const ChatSearch = ({ setSearchedUser }) => {
    const [searchTerm, setSearchTerm] = useState("");

    const fetchUsers = async () => {
        const response = await API.get(`/users/all`);
        // console.log(response.data);
        return response.data.data || [];

    };

    const { data: users = [], isLoading } = useQuery({
        queryKey: ['searchUers'],
        queryFn: fetchUsers,
        staleTime: 60 * 60 * 1000,
    })

    const filteredUsers = users?.filter(user =>
        user.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleUserSelect = (user) => {
        // console.log(user);
        setSearchedUser(user);
        setSearchTerm("");
    }

    const showList = searchTerm.length > 0

    return (
        <div className="relative border rounded-md mb-3">
            <Command shouldFilter={false} className="bg-gradient-to-br">
                <CommandInput
                    placeholder="Search people..."
                    value={searchTerm}
                    onValueChange={setSearchTerm}

                />
                <div className={cn("absolute top-full left-0 w-full bg-white border rounded-md mt-1 z-10", showList ? "block" : "hidden")}>
                    <CommandList>
                        <CommandEmpty>
                            {isLoading ?
                                <InsiderLoading />
                                :
                                "No users found."

                            }
                        </CommandEmpty>
                        <CommandGroup>
                            {!isLoading && filteredUsers.length > 0 && filteredUsers.map((user) => (
                                <CommandItem
                                    key={user.id}
                                    value={user.value}
                                    onSelect={() => {
                                        handleUserSelect(user);
                                    }}
                                >
                                    <div className="flex h-10 items-center space-x-2">
                                        <div className="h-10 w-10 rounded-full overflow-hidden">
                                            <img
                                                src={user.image}
                                                alt={user.name}
                                                className="h-full w-full object-cover"
                                            />
                                        </div>

                                        <p className="my-auto">{user.name}</p>
                                        <Badge>{user.role == USER_ROLE.CARE_GIVER ? "Mentor" : user.role == USER_ROLE.PATIENT ? "User" : "Admin"}</Badge>
                                    </div>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </div>
            </Command>
        </div>
    )
}

export default React.memo(ChatSearch);


