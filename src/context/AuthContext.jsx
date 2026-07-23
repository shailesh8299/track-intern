import React, { createContext, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config/api";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // Login using backend API
  const login = async ({ email, password }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (data.success) {
        setUser(data.user);
        return true;
      }
      setUser(null);
      return false;
    } catch (err) {
      setUser(null);
      return false;
    }
  };

  // Signup using backend API
  const signup = async ({ name, email, password }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await response.json();
      return data;
    } catch (err) {
      return { success: false, message: "Signup failed. Please try again." };
    }
  };

  // Logout
  const logout = () => {
    setUser(null);
    navigate("/");
  };

  // Fetch all pending users
  const getPendingUsers = async () => {
    const response = await fetch(`${API_BASE_URL}/api/users/pending`);
    return await response.json();
  };

  // Approve a user
  const approveUser = async (userId, role, supervisorId = null) => {
    const response = await fetch(`${API_BASE_URL}/api/users/approve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, role, supervisorId }),
    });
    const data = await response.json();
    return data.success;
  };

  // Fetch all supervisors
  const getSupervisors = async () => {
    const response = await fetch(`${API_BASE_URL}/api/users/supervisors`);
    return await response.json();
  };

  // Fetch all interns of a supervisor
  const getInternsOfSupervisor = async (supervisorId) => {
    const response = await fetch(`${API_BASE_URL}/api/users/interns/${supervisorId}`);
    return await response.json();
  };

  // Fetch all users (optional for admin listing)
  const getAllUsers = async () => {
    const response = await fetch(`${API_BASE_URL}/api/users/all`);
    return await response.json();
  };

  const getTasksForUser = async (userId) => {
    const response = await fetch(`${API_BASE_URL}/api/tasks/user/${userId}`);
    return await response.json();
  };

  const addTask = async (task) => {
    const response = await fetch(`${API_BASE_URL}/api/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(task),
    });
    return await response.json();
  };

  const editTask = async (taskId, task) => {
    const response = await fetch(`${API_BASE_URL}/api/tasks/${taskId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(task),
    });
    return await response.json();
  };

  const deleteTask = async (taskId) => {
    const response = await fetch(`${API_BASE_URL}/api/tasks/${taskId}`, {
      method: "DELETE",
    });
    return await response.json();
  };

  const reviewTask = async (taskId, payload) => {
    const response = await fetch(`${API_BASE_URL}/api/tasks/${taskId}/review`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return await response.json();
  };

  const markAttendance = async (payload) => {
    const response = await fetch(`${API_BASE_URL}/api/attendance/mark`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return await response.json();
  };

  const getAttendanceForUser = async (userId) => {
    const response = await fetch(`${API_BASE_URL}/api/attendance/user/${userId}`);
    return await response.json();
  };

  const getAttendanceForSupervisor = async (supervisorId) => {
    const response = await fetch(`${API_BASE_URL}/api/attendance/supervisor/${supervisorId}`);
    return await response.json();
  };

  const createLeaveRequest = async (payload) => {
    const response = await fetch(`${API_BASE_URL}/api/leaves`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return await response.json();
  };

  const getLeavesForUser = async (userId) => {
    const response = await fetch(`${API_BASE_URL}/api/leaves/user/${userId}`);
    return await response.json();
  };

  const getLeavesForSupervisor = async (supervisorId) => {
    const response = await fetch(`${API_BASE_URL}/api/leaves/supervisor/${supervisorId}`);
    return await response.json();
  };

  const reviewLeave = async (leaveId, payload) => {
    const response = await fetch(`${API_BASE_URL}/api/leaves/${leaveId}/review`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return await response.json();
  };

  const getAnalyticsOverview = async () => {
    const response = await fetch(`${API_BASE_URL}/api/analytics/overview`);
    return await response.json();
  };

  const getUserProfile = async (userId) => {
    const response = await fetch(`${API_BASE_URL}/api/users/${userId}/profile`);
    return await response.json();
  };

  const updateUserProfile = async (userId, profile) => {
    const response = await fetch(`${API_BASE_URL}/api/users/${userId}/profile`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profile),
    });
    const data = await response.json();

    if (data.success && data.profile) {
      setUser((prev) => (prev ? { ...prev, ...data.profile } : prev));
    }

    return data;
  };

  

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        signup,
        getPendingUsers,
        approveUser,
        getSupervisors,
        getInternsOfSupervisor,
        getAllUsers,
        setUser,
        addTask,
        getTasksForUser,
        editTask,
        deleteTask,
        reviewTask,
        markAttendance,
        getAttendanceForUser,
        getAttendanceForSupervisor,
        createLeaveRequest,
        getLeavesForUser,
        getLeavesForSupervisor,
        reviewLeave,
        getAnalyticsOverview,
        getUserProfile,
        updateUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}