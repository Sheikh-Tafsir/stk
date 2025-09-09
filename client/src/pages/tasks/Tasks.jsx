import React, { useState, useCallback } from 'react'
import TaskList from './TaskList'
import TaskToDo from './TaskToDo'

const Tasks = () => {

  const [newChatTrigger, setNewChatTrigger] = useState(false);

  const onNewChatCreate = useCallback(() => {
    setNewChatTrigger((prev) => !prev);
  }, []);

  return (
    <div className='container min-h-[90vh]'>
    <div className='mx-auto flex flex-col md:flex-row justify-between gap-4 pt-2'>
      <div className='w-[25%]'>
        <TaskList newChatTrigger={newChatTrigger} />
      </div>
      <div className='w-[75%]'>
        <TaskToDo onNewChatCreate={onNewChatCreate} />
      </div>
    </div>
    </div>
  )
}

export default Tasks
