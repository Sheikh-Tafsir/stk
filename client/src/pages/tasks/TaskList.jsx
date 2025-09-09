import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { EllipsisVertical, Pencil, Trash2 } from 'lucide-react'

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { PenSquare } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { API } from '@/middleware/Api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getLastMessageTime } from '@/utils/utils';
import PageLoadingOverlay from '@/mycomponents/pageLoadingOverlay/PageLoadingOverlay';

export default function TaskList({ newChatTrigger }) {
  const { id } = useParams();
  const queryClient = useQueryClient();

  const fetchTasks = async () => {
    const response = await API.get(`/tasks`);
    // console.log(response.data);
    return response.data.data || [];
  }

  const { data: taskList, isLoading } = useQuery({
    queryKey: ['task', newChatTrigger],
    queryFn: fetchTasks,
  })

  const deleteTask = useMutation({
    mutationFn: async (taskId) => {
      await API.delete(`/tasks/${taskId}`);
    },
    onSuccess: () => {
      // Invalidate and refetch the task list
      queryClient.invalidateQueries({ queryKey: ['task'] });
      navigate("/tasks");
    },
    onError: (error) => {
      console.error("Error deleting task:", error);
    },
  });

  return (
    <div className="w-full">
      {isLoading && <PageLoadingOverlay />}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Tasks</h1>
        <Link to={"/tasks"}>
          <Button size="icon" className="bg-blue-600">
            <PenSquare className="h-4 w-4" />
            <span className="sr-only">New message</span>
          </Button>
        </Link>
      </div>

      <Card>
        <ScrollArea className="h-[calc(93.5vh-8rem)]">
          {isLoading && <PageLoadingOverlay />}
          <div className="flex flex-col space-y-2 p-1">
            {taskList && taskList.length > 0 ?
              taskList.map((item) => (
                <div
                  key={item.id}
                  className={`flex px-4 py-5 transition-colors ${item.id == id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 hover:bg-blue-500 hover:text-white'
                    } cursor-pointer`}
                >
                  <Link to={`/tasks/${item.id}`} className="w-[55%]">
                    <div>
                      <p className="font-semibold truncate">{item.prompt}</p>
                      <p className={`text-xs text-muted-foreground whitespace-nowrap ${item.id == id ? 'text-white' : ''}`}>{getLastMessageTime(item.createdAt)}</p>
                    </div>
                  </Link>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <EllipsisVertical className={`${item.id == id ? 'text-white' : 'text-black'} hover:text-gray-300`} />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-30 ml-40">
                      <DropdownMenuItem>
                        <Pencil className='h-6 w-6 pr-2' />
                        <span>Edit</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => deleteTask.mutate(item.id)}>
                        <Trash2 className='h-6 w-6 pr-2' />
                        <span>Delete</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))
              :
              <div className='flex'>
                <p className='mx-auto pt-2 font-semibold'>No chat started</p>
              </div>
            }
          </div>
        </ScrollArea>
      </Card>
    </div>
  )
}