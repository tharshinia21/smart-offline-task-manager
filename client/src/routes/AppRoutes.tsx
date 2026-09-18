import { Routes, Route, Navigate } from 'react-router-dom'
import Dashboard from '../pages/Dashboard'
import Tasks from '../pages/Tasks'
import TodayTasks from '../pages/TodayTasks'
import UpcomingTasks from '../pages/UpcomingTasks'
import OverdueTasks from '../pages/OverdueTasks'
import CompletedTasks from '../pages/CompletedTasks'
import CreateTask from '../pages/CreateTask'
import TaskDetails from '../pages/TaskDetails'
import EditTask from '../pages/EditTask'
import Calendar from '../pages/Calendar'
import FocusMode from '../pages/FocusMode'
import Statistics from '../pages/Statistics'
import Settings from '../pages/Settings'
import Login from '../pages/Login'

export default function AppRoutes(){
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace/>} />
      <Route path="/login" element={<Login/>} />
      <Route path="/dashboard" element={<Dashboard/>} />
      <Route path="/tasks" element={<Tasks/>} />
      <Route path="/tasks/today" element={<TodayTasks/>} />
      <Route path="/tasks/upcoming" element={<UpcomingTasks/>} />
      <Route path="/tasks/overdue" element={<OverdueTasks/>} />
      <Route path="/tasks/completed" element={<CompletedTasks/>} />
      <Route path="/tasks/new" element={<CreateTask/>} />
      <Route path="/tasks/:taskId" element={<TaskDetails/>} />
      <Route path="/tasks/:taskId/edit" element={<EditTask/>} />
      <Route path="/calendar" element={<Calendar/>} />
      <Route path="/focus" element={<FocusMode/>} />
      <Route path="/statistics" element={<Statistics/>} />
      <Route path="/settings" element={<Settings/>} />
      <Route path="*" element={<div className="p-8 text-center">Not found — <a href="/dashboard" className="text-indigo-600 underline">Go dashboard</a></div>} />
    </Routes>
  )
}
