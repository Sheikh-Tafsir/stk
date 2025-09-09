import { Routes, Route, BrowserRouter } from "react-router-dom";
import React, { useEffect } from 'react';
import './App.css'
import { UserProvider, useUserContext } from '@/context/UserContext';

import AuthRoute from "./middleware/AuthRoute";
import ProtectedRoute from "./middleware/ProtectedRoute";
import PublicRoute from "./middleware/PublicRoute";
import RoleBasedRoute from "./middleware/RoleBasedRoute";

import { connectSocket, disconnectSocket } from '@/mycomponents/socket';
import { getAccessToken } from "./utils/utils";
import { USER_ROLE } from "./utils/enums";

import Homepage from './pages/homepage/Homepage';
import NotFound from './pages/NotFound';

import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";

import Profile from './pages/profile/Profile'

import ParticipantList from "./pages/participants/ParticipantList";

import ExperimentSelect from "./pages/experiment/ExperimentSelect";
import Experiment from "./pages/experiment/Experiment";

import UserList from "./pages/users/UserList";
import UserEdit from "./pages/users/UserEdit";

import Chats from "./pages/chats/Chats";
import Tasks from "./pages/tasks/Tasks";

import MoodCalendar from "./pages/moodCalendar/MoodCalendar";
import MoodDashboard from "./pages/moodCalendar/MoodDashboard";
import BionicTextConverter from "./pages/bionic/BionicTextConverter";
import VideoPlayer from "./pages/video/VideoPlayer";

import CareGiverCreate from "./pages/caregiver/CareGiverCreate";
import CareGiverList from "./pages/caregiver/CareGiverList";

import ClassRoutine from "./pages/class/ClassRoutine";
import ClassCreate from "./pages/class/ClassCreate";
import ClassEdit from "./pages/class/ClassEdit";

import BudgetTypeList from "./pages/budget/BudgetTypeList";
import BudgetTypeCreate from "./pages/budget/BudgetTypeCreate";
import BudgetTypeEdit from "./pages/budget/BudgetTypeEdit";
import BudgetTransactionMonthly from "./pages/budget/BudgetTransactionMonthly";
import BudgetTransactionCreate from "./pages/budget/BudgetTransactionCreate";
import BudgetTransactionEdit from "./pages/budget/BudgetTransactionEdit";

import GoalsList from "./pages/goals/GoalList";
import GoalCreate from "./pages/goals/GoalCreate";
import GoalEdit from "./pages/goals/GoalEdit";

import QuizCreate from "./pages/quiz/QuizCreate";
import QuizParticipate from "./pages/quiz/QuizParticipate";
import QuizSelect from "./pages/quiz/QuizSelect";

const App = () => {

  return (
    <>
      <UserProvider>
        <BrowserRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
          <InnerApp />
        </BrowserRouter>
      </UserProvider>
    </>
  )
}

const InnerApp = () => {
  const { user } = useUserContext();

  useEffect(() => {
    if (user?.id) {
      const token = getAccessToken();
      connectSocket(token);
    }

    return () => {
      disconnectSocket();
    };
  }, [user?.id])

  return (
    <Routes>
      <Route path="/" element={<Homepage />} />

      <Route element={<AuthRoute />}>
        <Route path="/auth/signup" element={<Signup />} />
        <Route path="/auth/login" element={<Login />} />
        <Route path="/auth/forgot-password" element={<ForgotPassword />} />
        <Route path="/auth/reset-password" element={<ResetPassword />} />
      </Route>

      <Route element={<PublicRoute />}>
        <Route path="/stream" element={<VideoPlayer />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route path='/profile' element={<Profile />} />

        <Route path="/chats" element={<Chats />} />
        <Route path="/chats/:id" element={<Chats />} />

        <Route element={<RoleBasedRoute allowedRoles={[USER_ROLE.PATIENT]} />}>
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/tasks/:id" element={<Tasks />} />

          <Route path="/mood/calendar" element={<MoodCalendar />} />
          <Route path="/mood/dashboard" element={<MoodDashboard />} />

          <Route path="/bionic/converter" element={<BionicTextConverter />} />

          <Route path="/class" element={<ClassRoutine />} />
          <Route path="/class/create" element={<ClassCreate />} />
          <Route path="/class/:id" element={<ClassEdit />} />
          <Route path="/class/:id/edit" element={<ClassEdit />} />

          <Route path="/goals" element={<GoalsList />} />
          <Route path="/goals/create" element={<GoalCreate />} />
          <Route path="/goals/:id" element={<GoalEdit />} />
          <Route path="/goals/:id/edit" element={<GoalEdit />} />

          <Route path="/budget/transaction" element={<BudgetTransactionMonthly />} />
          <Route path="/budget/transaction/create" element={<BudgetTransactionCreate />} />
          <Route path="/budget/transaction/:id" element={<BudgetTransactionEdit />} />
          <Route path="/budget/transaction/:id/edit" element={<BudgetTransactionEdit />} />

          <Route path="/quizes/participate" element={<QuizParticipate />} />
        </Route>

        <Route element={<RoleBasedRoute allowedRoles={[USER_ROLE.ADMIN]} />}>
          <Route path="/users" element={<UserList />} />
          <Route path="/users/:id" element={<UserEdit />} />
          <Route path="/users/:id/edit" element={<UserEdit />} />

          <Route path="/caregivers" element={<CareGiverList />} />
          <Route path="/caregivers/create" element={<CareGiverCreate />} />
          <Route path="/caregivers/:id" element={<UserEdit />} />
          <Route path="/caregivers/:id/edit" element={<UserEdit />} />

          <Route path="/quizes/create" element={<QuizCreate />} />
        </Route>

        <Route element={<RoleBasedRoute allowedRoles={[USER_ROLE.PATIENT, USER_ROLE.ADMIN]} />}>
          <Route path="/participants/:id/experiments" element={<ExperimentSelect />} />
          <Route path="/participants/:id/experiments/:experimentId" element={<Experiment />} />

          <Route path="/budget/type" element={<BudgetTypeList />} />
          <Route path="/budget/type/create" element={<BudgetTypeCreate />} />
          <Route path="/budget/type/:id" element={<BudgetTypeEdit />} />
          <Route path="/budget/type/:id/edit" element={<BudgetTypeEdit />} />

          <Route path="/quizes/select" element={<QuizSelect />} />
        </Route>

        <Route element={<RoleBasedRoute allowedRoles={[USER_ROLE.CARE_GIVER, USER_ROLE.ADMIN]} />}>
          <Route path="/participants" element={<ParticipantList />} />
          <Route path="/participants/:id" element={<UserEdit />} />
          <Route path="/participants/:id/edit" element={<UserEdit />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default App