import React, { useEffect, useState } from "react";
import {
  Modal,
  ModalDialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Input,
  FormControl,
  FormLabel,
  IconButton,
  Sheet,
  Table,
  Typography,
  Tooltip,
  Box,
  Select,
  Option,
  Divider,
} from "@mui/joy";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useAuth } from "../context/AuthContext";
import { Textarea } from "@mui/joy";

function statusColor(status) {
  if (status === "completed") return "success";
  if (status === "in-progress") return "warning";
  if (status === "blocked") return "danger";
  return "neutral";
}

// Utility: returns YYYY-MM-DD string
const formatDate = (dateObj) => dateObj.toISOString().slice(0, 10);

function getDateLimits() {
  const today = new Date();
  const maxDate = formatDate(today);

  // Previous month, same date or last day if prev month too short
  const prevMonth = new Date(today);
  prevMonth.setMonth(today.getMonth() - 1);

  if (prevMonth.getMonth() === today.getMonth()) {
    // e.g., Mar 31 -> Feb 28/29
    prevMonth.setDate(0);
  }
  const minDate = formatDate(prevMonth);
  return { minDate, maxDate };
}

function isDateInRange(date, min, max) {
  return date >= min && date <= max;
}

function InternPage() {
  const {
    user,
    getTasksForUser,
    addTask,
    editTask,
    deleteTask,
    markAttendance,
    getAttendanceForUser,
    createLeaveRequest,
    getLeavesForUser,
  } = useAuth();
  const [open, setOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [form, setForm] = useState({
    date: "",
    task: "",
    hours: "",
    description: "",
  });
  const [tasks, setTasks] = useState([]);
  const [refresh, setRefresh] = useState(false);

  const { minDate, maxDate } = getDateLimits();
  const [deleteTaskId, setDeleteTaskId] = useState(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [attendanceDate, setAttendanceDate] = useState(formatDate(new Date()));
  const [attendanceStatus, setAttendanceStatus] = useState("present");
  const [attendanceNote, setAttendanceNote] = useState("");
  const [attendanceRows, setAttendanceRows] = useState([]);
  const [leaveForm, setLeaveForm] = useState({ fromDate: "", toDate: "", reason: "" });
  const [leaveRows, setLeaveRows] = useState([]);

  const filteredTasks =
    statusFilter === "all"
      ? tasks
      : tasks.filter((task) => (task.status || "pending") === statusFilter);

  useEffect(() => {
    async function loadData() {
      if (!user) return;
      const [taskData, attendanceData, leaveData] = await Promise.all([
        getTasksForUser(user.id),
        getAttendanceForUser(user.id),
        getLeavesForUser(user.id),
      ]);
      setTasks(taskData);
      setAttendanceRows(attendanceData);
      setLeaveRows(leaveData);
    }

    loadData();
  }, [user, refresh, getTasksForUser, getAttendanceForUser, getLeavesForUser]);

  const handleOpen = (task = null) => {
    if (task) {
      setForm({
        date: task.date ? task.date.slice(0, 10) : "",
        task: task.task,
        hours: task.hours,
        description: task.description || "",
      });
      setEditingTask(task);
    } else {
      setForm({
        date: "",
        task: "",
        hours: "",
        description: "",
      });
      setEditingTask(null);
    }
    setOpen(true);
  };

  const handleSave = async () => {
    if (!form.date || !form.task || !form.hours) return;

    if (!isDateInRange(form.date, minDate, maxDate)) {
      alert(`Date must be between ${minDate} and ${maxDate}.`);
      return;
    }

    if (editingTask) {
      await editTask(editingTask.id, {
        date: form.date,
        task: form.task,
        hours: Number(form.hours),
        description: form.description,
      });
    } else {
      // Prevent duplicate date entries for this user in allowed range
      if (tasks.some((t) => t.date === form.date)) {
        alert("Task for this date already exists. Use edit.");
        return;
      }
      await addTask({
        userId: user.id,
        date: form.date,
        task: form.task,
        hours: Number(form.hours),
        description: form.description,
      });
    }
    setOpen(false);
    setRefresh((v) => !v);
  };

  const handleDeleteTask = async () => {
    await deleteTask(deleteTaskId);
    setDeleteOpen(false);
    setRefresh((v) => !v);
    setDeleteTaskId(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleMarkAttendance = async () => {
    if (!attendanceDate) return;
    await markAttendance({
      userId: user.id,
      date: attendanceDate,
      status: attendanceStatus,
      note: attendanceNote,
    });
    setAttendanceNote("");
    setRefresh((v) => !v);
  };

  const handleLeaveSubmit = async () => {
    if (!leaveForm.fromDate || !leaveForm.toDate) return;
    await createLeaveRequest({
      userId: user.id,
      fromDate: leaveForm.fromDate,
      toDate: leaveForm.toDate,
      reason: leaveForm.reason,
    });
    setLeaveForm({ fromDate: "", toDate: "", reason: "" });
    setRefresh((v) => !v);
  };

  return (
    <Sheet
      sx={{
        maxWidth: 700,
        mx: "auto",
        my: 6,
        p: 3,
        borderRadius: "lg",
        boxShadow: "sm",
        bgcolor: "background.body",
      }}
    >
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        mb={2}
      >
        <Typography level="h3">Your Task Entries</Typography>
        <Tooltip title="Add Task">
          <IconButton
            variant="soft"
            color="primary"
            onClick={() => handleOpen()}
          >
            <AddIcon />
          </IconButton>
        </Tooltip>
      </Box>
      {tasks.length === 0 ? (
        <Typography level="body-md" color="neutral">
          No tasks added yet. Click <AddIcon fontSize="small" /> to add your
          first task.
        </Typography>
      ) : (
        <>
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 1.5 }}>
            {[
              { key: "all", label: "All" },
              { key: "pending", label: "Pending" },
              { key: "in-progress", label: "In Progress" },
              { key: "completed", label: "Completed" },
              { key: "blocked", label: "Blocked" },
            ].map((item) => (
              <Button
                key={item.key}
                size="sm"
                variant={statusFilter === item.key ? "solid" : "soft"}
                onClick={() => setStatusFilter(item.key)}
              >
                {item.label}
              </Button>
            ))}
          </Box>

          <Table
            aria-label="task table"
            variant="soft"
            sx={{
              mt: 2,
              borderRadius: "md",
              overflow: "hidden",
              tableLayout: "fixed",
              "& th, & td": {
                verticalAlign: "top",
                wordBreak: "break-word",
                whiteSpace: "pre-line",
              },
            }}
          >
          <colgroup>
            <col style={{ width: "110px" }} />
            <col style={{ width: "120px" }} />
            <col style={{ width: "70px" }} />
            <col style={{ width: "170px" }} />
            <col style={{ width: "110px" }} />
            <col style={{ width: "170px" }} />
            <col style={{ width: "50px" }} />
            <col style={{ width: "60px" }} />
          </colgroup>
          <thead>
            <tr>
              <th>Date</th>
              <th>Task</th>
              <th>Hours</th>
              <th>Description</th>
              <th>Status</th>
              <th>Supervisor Comment</th>
              <th>Edit</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>
            {filteredTasks.map((t) => (
              <tr key={t.id}>
                <td>{t.date ? t.date.slice(0, 10) : ""}</td>
                <td>{t.task}</td>
                <td>{t.hours}</td>
                <td>
                  <Typography
                    sx={{
                      maxWidth: "160px",
                      overflowWrap: "break-word",
                      whiteSpace: "pre-line",
                    }}
                    level="body-sm"
                  >
                    {t.description}
                  </Typography>
                </td>
                <td>
                  <Typography
                    level="body-sm"
                    color={statusColor(t.status)}
                    sx={{ textTransform: "capitalize", fontWeight: 600 }}
                  >
                    {t.status || "pending"}
                  </Typography>
                </td>
                <td>
                  <Typography
                    sx={{
                      maxWidth: "160px",
                      overflowWrap: "break-word",
                      whiteSpace: "pre-line",
                    }}
                    level="body-sm"
                    color="neutral"
                  >
                    {t.review_comment || "-"}
                  </Typography>
                </td>
                <td>
                  <IconButton
                    size="sm"
                    variant="plain"
                    color="neutral"
                    onClick={() => handleOpen(t)}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                </td>
                <td>
                  <IconButton
                    size="sm"
                    variant="plain"
                    color="danger"
                    onClick={() => {
                      setDeleteTaskId(t.id);
                      setDeleteOpen(true);
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </td>
              </tr>
            ))}
          </tbody>
          </Table>
          {filteredTasks.length === 0 && (
            <Typography level="body-sm" color="neutral" sx={{ mt: 1 }}>
              No tasks found for selected status.
            </Typography>
          )}
        </>
      )}

      {/* Delete Modal */}
      <Modal open={deleteOpen} onClose={() => setDeleteOpen(false)}>
        <ModalDialog variant="outlined" color="danger">
          <DialogTitle>Delete Task?</DialogTitle>
          <DialogContent>
            Are you sure you want to delete this task? This action cannot be
            undone.
          </DialogContent>
          <DialogActions>
            <Button variant="plain" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button variant="solid" color="danger" onClick={handleDeleteTask}>
              Delete
            </Button>
          </DialogActions>
        </ModalDialog>
      </Modal>

      {/* Add/Edit Modal */}
      <Modal open={open} onClose={() => setOpen(false)}>
        <ModalDialog>
          <DialogTitle>{editingTask ? "Edit Task" : "Add Task"}</DialogTitle>
          <DialogContent>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSave();
              }}
            >
              <FormControl required sx={{ mb: 2 }}>
                <FormLabel>Date</FormLabel>
                <Input
                  type="date"
                  name="date"
                  value={form.date}
                  onChange={handleChange}
                  disabled={!!editingTask}
                  required
                  min={minDate}
                  max={maxDate}
                />
              </FormControl>
              <FormControl required sx={{ mb: 2 }}>
                <FormLabel>Task Name</FormLabel>
                <Input
                  name="task"
                  value={form.task}
                  onChange={handleChange}
                  placeholder="Enter task name"
                  required
                />
              </FormControl>
              <FormControl required sx={{ mb: 2 }}>
                <FormLabel>Hours</FormLabel>
                <Input
                  type="number"
                  name="hours"
                  value={form.hours}
                  onChange={handleChange}
                  placeholder="Number of hours"
                  required
                  min={1}
                  max={24}
                />
              </FormControl>
              <FormControl sx={{ mb: 2 }}>
                <FormLabel>Description (optional)</FormLabel>
                <Textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Description"
                  minRows={2}
                />
              </FormControl>
              <DialogActions>
                <Button
                  type="button"
                  variant="plain"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="solid">
                  {editingTask ? "Update" : "Add"}
                </Button>
              </DialogActions>
            </form>
          </DialogContent>
        </ModalDialog>
      </Modal>

      <Divider sx={{ my: 3 }} />

      <Typography level="h4" sx={{ mb: 1.5 }}>
        Attendance
      </Typography>
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr 1fr auto" }, gap: 1, mb: 2 }}>
        <Input type="date" value={attendanceDate} onChange={(e) => setAttendanceDate(e.target.value)} />
        <Select value={attendanceStatus} onChange={(_, value) => setAttendanceStatus(value || "present")}> 
          <Option value="present">Present</Option>
          <Option value="wfh">WFH</Option>
          <Option value="absent">Absent</Option>
        </Select>
        <Input
          placeholder="Note (optional)"
          value={attendanceNote}
          onChange={(e) => setAttendanceNote(e.target.value)}
        />
        <Button onClick={handleMarkAttendance}>Mark</Button>
      </Box>

      {attendanceRows.length > 0 && (
        <Table size="sm" variant="soft" sx={{ mb: 3 }}>
          <thead>
            <tr>
              <th>Date</th>
              <th>Status</th>
              <th>Note</th>
            </tr>
          </thead>
          <tbody>
            {attendanceRows.slice(0, 10).map((row) => (
              <tr key={row.id}>
                <td>{row.attendance_date?.slice(0, 10)}</td>
                <td style={{ textTransform: "capitalize" }}>{row.status}</td>
                <td>{row.note || "-"}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <Typography level="h4" sx={{ mb: 1.5 }}>
        Leave Requests
      </Typography>
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 1, mb: 1 }}>
        <Input
          type="date"
          value={leaveForm.fromDate}
          onChange={(e) => setLeaveForm((prev) => ({ ...prev, fromDate: e.target.value }))}
        />
        <Input
          type="date"
          value={leaveForm.toDate}
          onChange={(e) => setLeaveForm((prev) => ({ ...prev, toDate: e.target.value }))}
        />
      </Box>
      <Textarea
        minRows={2}
        placeholder="Reason (optional)"
        value={leaveForm.reason}
        onChange={(e) => setLeaveForm((prev) => ({ ...prev, reason: e.target.value }))}
      />
      <Button sx={{ mt: 1.5, mb: 2 }} onClick={handleLeaveSubmit}>Submit Leave Request</Button>

      {leaveRows.length > 0 && (
        <Table size="sm" variant="soft">
          <thead>
            <tr>
              <th>From</th>
              <th>To</th>
              <th>Status</th>
              <th>Review</th>
            </tr>
          </thead>
          <tbody>
            {leaveRows.slice(0, 10).map((row) => (
              <tr key={row.id}>
                <td>{row.from_date?.slice(0, 10)}</td>
                <td>{row.to_date?.slice(0, 10)}</td>
                <td style={{ textTransform: "capitalize" }}>{row.status}</td>
                <td>{row.review_comment || "-"}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Sheet>
  );
}

export default InternPage;