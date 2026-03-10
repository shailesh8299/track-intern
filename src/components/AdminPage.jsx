import React, { useState, useEffect } from "react";
import {
  Sheet,
  Typography,
  Box,
  Table,
  IconButton,
  Tooltip,
  Button,
  Divider,
  List,
  ListItem,
  ListItemContent,
  Select,
  Option,
  Chip,
  Modal,
  ModalDialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/joy";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import SupervisorAccountIcon from "@mui/icons-material/SupervisorAccount";
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1";
import PeopleIcon from "@mui/icons-material/People";
import CloseIcon from "@mui/icons-material/Close";
import { useAuth } from "../context/AuthContext";

function AdminPage() {
  const {
    getPendingUsers,
    approveUser,
    getSupervisors,
    getAllUsers,
    getAnalyticsOverview,
  } = useAuth();

  const [pendingRole, setPendingRole] = useState({});
  const [pendingSupervisor, setPendingSupervisor] = useState({});
  const [approveDialog, setApproveDialog] = useState({ open: false, user: null });

  // Fetched data state
  const [pendingUsers, setPendingUsers] = useState([]);
  const [supervisors, setSupervisors] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [analytics, setAnalytics] = useState(null);

  // Fetch data on mount and after any approval
  const fetchData = async () => {
    const [pending, sup, users, analyticsRes] = await Promise.all([
      getPendingUsers(),
      getSupervisors(),
      getAllUsers(),
      getAnalyticsOverview(),
    ]);

    setPendingUsers(pending);
    setSupervisors(sup);
    setAllUsers(users);
    if (analyticsRes.success) {
      setAnalytics(analyticsRes.overview);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, []);

  const handleApprove = async (userId) => {
    const role = pendingRole[userId];
    if (!role) return;
    const supervisorId = role === "intern" ? pendingSupervisor[userId] : null;
    await approveUser(userId, role, supervisorId);
    setApproveDialog({ open: false, user: null });
    setPendingRole((prev) => ({ ...prev, [userId]: undefined }));
    setPendingSupervisor((prev) => ({ ...prev, [userId]: undefined }));
    fetchData(); // Refresh
  };

  // Build supervisor-interns list
  const supervisorsWithInterns = supervisors.map((sup) => ({
    ...sup,
    interns: allUsers.filter(
      (u) => u.role === "intern" && String(u.supervisor_id) === String(sup.id) && u.status === "active"
    ),
  }));

  return (
    <Sheet
      sx={{
        maxWidth: 950,
        mx: "auto",
        my: 6,
        p: 4,
        borderRadius: "lg",
        boxShadow: "lg",
        bgcolor: "background.body",
      }}
    >
      <Typography level="h2" fontWeight="lg" sx={{ mb: 2 }}>
        Admin Dashboard
      </Typography>
      <Divider sx={{ mb: 3 }} />

      {analytics && (
        <Box sx={{ mb: 4 }}>
          <Typography level="h4" sx={{ mb: 2 }}>
            Platform Analytics
          </Typography>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "repeat(4, 1fr)" },
              gap: 1.5,
              mb: 2,
            }}
          >
            <Sheet variant="soft" sx={{ p: 2, borderRadius: "md" }}>
              <Typography level="body-sm">Total Users</Typography>
              <Typography level="h3">{analytics.users.total_users}</Typography>
              <Typography level="body-xs" color="neutral">
                Active: {analytics.users.active_users} | Pending: {analytics.users.pending_users}
              </Typography>
            </Sheet>
            <Sheet variant="soft" sx={{ p: 2, borderRadius: "md" }}>
              <Typography level="body-sm">Tasks</Typography>
              <Typography level="h3">{analytics.tasks.total_tasks}</Typography>
              <Typography level="body-xs" color="neutral">
                Completed: {analytics.tasks.completed_tasks} | Blocked: {analytics.tasks.blocked_tasks}
              </Typography>
            </Sheet>
            <Sheet variant="soft" sx={{ p: 2, borderRadius: "md" }}>
              <Typography level="body-sm">Attendance Entries</Typography>
              <Typography level="h3">{analytics.attendance.total_attendance}</Typography>
              <Typography level="body-xs" color="neutral">
                Present: {analytics.attendance.present_days} | Absent: {analytics.attendance.absent_days}
              </Typography>
            </Sheet>
            <Sheet variant="soft" sx={{ p: 2, borderRadius: "md" }}>
              <Typography level="body-sm">Leave Requests</Typography>
              <Typography level="h3">{analytics.leaves.total_leave_requests}</Typography>
              <Typography level="body-xs" color="neutral">
                Pending: {analytics.leaves.pending_leave_requests} | Approved: {analytics.leaves.approved_leave_requests}
              </Typography>
            </Sheet>
          </Box>

          <Table size="sm" variant="soft" sx={{ mb: 2 }}>
            <thead>
              <tr>
                <th>Top Intern</th>
                <th>Email</th>
                <th>Total Hours</th>
              </tr>
            </thead>
            <tbody>
              {analytics.topInternHours.map((item) => (
                <tr key={item.email}>
                  <td>{item.name}</td>
                  <td>{item.email}</td>
                  <td>{item.hours}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Box>
      )}

      <Box sx={{ mb: 6 }}>
        <Typography level="h4" sx={{ mb: 2 }}>
          <PersonAddAlt1Icon sx={{ mr: 1 }} />
          Pending User Approvals
        </Typography>
        {pendingUsers.length === 0 ? (
          <Typography color="neutral" sx={{ mb: 2 }}>
            No pending users!
          </Typography>
        ) : (
          <Table
            aria-label="pending users table"
            variant="soft"
            size="md"
            sx={{
              borderRadius: "md",
              overflow: "hidden",
              bgcolor: "background.level1",
              mb: 2,
            }}
          >
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Assign Role</th>
                <th>Assign Supervisor</th>
                <th>Approve</th>
              </tr>
            </thead>
            <tbody>
              {pendingUsers.map((u) => (
                <tr key={u.id}>
                  <td>
                    <Typography fontWeight="md">{u.name}</Typography>
                  </td>
                  <td>{u.email}</td>
                  <td>
                    <Select
                      size="sm"
                      placeholder="Role"
                      value={pendingRole[u.id] || ""}
                      onChange={(_, value) =>
                        setPendingRole((prev) => ({ ...prev, [u.id]: value }))
                      }
                      sx={{ minWidth: 120 }}
                    >
                      <Option value="intern">Intern</Option>
                      <Option value="supervisor">Supervisor</Option>
                    </Select>
                  </td>
                  <td>
                    {pendingRole[u.id] === "intern" ? (
                      <Select
                        size="sm"
                        placeholder="Supervisor"
                        value={pendingSupervisor[u.id] || ""}
                        onChange={(_, value) =>
                          setPendingSupervisor((prev) => ({
                            ...prev,
                            [u.id]: value,
                          }))
                        }
                        sx={{ minWidth: 160 }}
                      >
                        {supervisors.length === 0 ? (
                          <Option disabled>No supervisors</Option>
                        ) : (
                          supervisors.map((sup) => (
                            <Option key={sup.id} value={sup.id}>
                              {sup.name} ({sup.email})
                            </Option>
                          ))
                        )}
                      </Select>
                    ) : (
                      <Typography level="body-sm" color="neutral" sx={{ pl: 1 }}>
                        —
                      </Typography>
                    )}
                  </td>
                  <td>
                    <Tooltip title="Approve User">
                      <span>
                        <IconButton
                          size="sm"
                          color="success"
                          variant="soft"
                          disabled={
                            !pendingRole[u.id] ||
                            (pendingRole[u.id] === "intern" && !pendingSupervisor[u.id])
                          }
                          onClick={() => setApproveDialog({ open: true, user: u })}
                        >
                          <CheckCircleIcon />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Box>

      <Box>
        <Typography level="h4" sx={{ mb: 2 }}>
          <PeopleIcon sx={{ mr: 1 }} />
          Supervisors and Assigned Interns
        </Typography>
        {supervisorsWithInterns.length === 0 ? (
          <Typography color="neutral">
            No supervisors found.
          </Typography>
        ) : (
          <List
            sx={{
              "--ListItem-paddingY": "1.2rem",
              "--ListItem-paddingX": "1rem",
              border: "1px solid var(--joy-palette-neutral-200, #e0e0e0)",
              borderRadius: "lg",
              bgcolor: "background.level1",
              mb: 2,
            }}
          >
            {supervisorsWithInterns.map((sup) => (
              <ListItem
                key={sup.id}
                sx={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  borderBottom: "1px solid var(--joy-palette-neutral-200, #f0f0f0)",
                  "&:last-child": { borderBottom: "none" },
                }}
              >
                <ListItemContent>
                  <Typography fontWeight="md" fontSize="lg">
                    <SupervisorAccountIcon sx={{ mr: 1, mb: "-4px" }} />
                    {sup.name}
                  </Typography>
                  <Typography color="neutral" level="body-sm">
                    {sup.email}
                  </Typography>
                  <Chip
                    size="sm"
                    variant="soft"
                    color="primary"
                    sx={{ mt: 0.5 }}
                  >
                    {sup.interns.length} intern{sup.interns.length !== 1 ? "s" : ""}
                  </Chip>
                  <Box sx={{ mt: 1, ml: 2 }}>
                    {sup.interns.length === 0 ? (
                      <Typography color="neutral" level="body-xs">
                        No interns assigned.
                      </Typography>
                    ) : (
                      <ul style={{ margin: 0, padding: 0, listStyle: "disc inside" }}>
                        {sup.interns.map((intern) => (
                          <li key={intern.id}>
                            <Typography level="body-sm" sx={{ display: "inline" }}>{intern.name} ({intern.email})</Typography>
                          </li>
                        ))}
                      </ul>
                    )}
                  </Box>
                </ListItemContent>
              </ListItem>
            ))}
          </List>
        )}
      </Box>

      {/* Approve confirmation dialog */}
      <Modal open={approveDialog.open} onClose={() => setApproveDialog({ open: false, user: null })}>
        <ModalDialog>
          <DialogTitle>Confirm Approval</DialogTitle>
          <DialogContent>
            {approveDialog.user && (
              <>
                <Typography>
                  Are you sure you want to approve user <b>{approveDialog.user.name}</b> as <b>{pendingRole[approveDialog.user.id]}</b>
                  {pendingRole[approveDialog.user.id] === "intern" &&
                    pendingSupervisor[approveDialog.user.id]
                      ? <>
                          {" "}under supervisor{" "}
                          <b>
                            {supervisors.find((s) => String(s.id) === String(pendingSupervisor[approveDialog.user.id]))?.name}
                          </b>
                        </>
                      : ""}
                  ?
                </Typography>
              </>
            )}
          </DialogContent>
          <DialogActions>
            <Button
              variant="plain"
              startDecorator={<CloseIcon />}
              onClick={() => setApproveDialog({ open: false, user: null })}
            >
              Cancel
            </Button>
            <Button
              color="success"
              variant="solid"
              startDecorator={<CheckCircleIcon />}
              onClick={() => approveDialog.user && handleApprove(approveDialog.user.id)}
            >
              Approve
            </Button>
          </DialogActions>
        </ModalDialog>
      </Modal>
    </Sheet>
  );
}

export default AdminPage;