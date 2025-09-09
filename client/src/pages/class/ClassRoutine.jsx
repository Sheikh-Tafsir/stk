import React, { useState, useEffect } from 'react';

import ClassRoutineComponent from "./ClassRoutineComponent"
import { API } from '@/middleware/Api';
import PageLoadingOverlay from '@/mycomponents/pageLoadingOverlay/PageLoadingOverlay';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { ToastAlert } from '@/mycomponents/ToastAlert';
import { initialToastState } from '@/utils/utils';
import { TOAST_TYPE } from '@/utils/enums';

export default function ClassRoutine() {
  const navigate = useNavigate();

  const [classes, setClasses] = useState([]);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [toastData, setToastData] = useState(initialToastState);

  useEffect(() => {
    const fetchClasses = async () => {
      setIsPageLoading(true);
      try {
        const response = await API.get('/class');
        //console.log(response.data.data);
        setClasses(response.data.data);
      } catch (error) {
        console.error('Error fetching class schedule:', error);
        showToast("Could not get classes", TOAST_TYPE.ERROR);
      } finally {
        setIsPageLoading(false);
      }
    }

    fetchClasses();
  }, []);

  const showToast = (message, type) => {
    setToastData({ message, type, id: Date.now() });
  }

  return (
    <>
      {isPageLoading && <PageLoadingOverlay />}

      <div className="bg-background pt-4">
        <div className="max-w-7xl mx-auto">
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Weekly Schedule</h1>
            <p className="text-muted-foreground">Week of September 4-10, 2025</p>
            <Button className="mt-4 bg-blue-600" onClick={() => { navigate('/class/create') }}>
              <Plus className="h-4 w-4" />
              Add New Class
            </Button>
          </header>
          <ClassRoutineComponent classes={classes} />
        </div>
      </div>

      {
        toastData.message && (
          <ToastAlert
            key={toastData.id}
            message={toastData.message}
            type={toastData.type}
          />
        )
      }
    </>
  )
}
