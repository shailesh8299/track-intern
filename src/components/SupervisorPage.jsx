import React, { useEffect, useState } from "react";
import {
  Sheet,
  Typography,
  Box,
  Table,
  IconButton,
  Tooltip,
  List,
  ListItem,
  ListItemContent,
  Modal,
  ModalDialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Divider,
  Chip,
  Select,
  Option,
  Textarea,
} from "@mui/joy";
import DownloadIcon from "@mui/icons-material/Download";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CloseIcon from "@mui/icons-material/Close";
import { useAuth } from "../context/AuthContext";

// Download tasks as CSV
function downloadCSV(intern, tasks) {
  if (!tasks.length) return;
  const rows = [
    ["Date", "Task", "Hours", "Description"],
    ...tasks.map((t) => [t.date, t.task, t.hours, t.description || ""]),
  ];
  const csv = rows.map((r) => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${intern.name.replace(/\s+/g, "_")}_tasks.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

// Utility to truncate description to at most 2 lines and add ...
function truncateDescription(description, maxLines = 2, maxCharsPerLine = 60) {
  if (!description) return "";
  // Split by lines then join up to maxLines
  const lines = description.split('\n');
  let result = [];
  let charCount = 0;
  for (let i = 0; i < lines.length && result.length < maxLines; i++) {
    let line = lines[i];
    // If a single line is too long, break it up
    while (line.length > maxCharsPerLine) {
      result.push(line.slice(0, maxCharsPerLine));
      line = line.slice(maxCharsPerLine);
      if (result.length === maxLines) break;
    }
    if (result.length < maxLines) result.push(line);
  }
  let joined = result.join('\n');
  // If there's more content, add ellipsis
  if (lines.length > maxLines || description.length > joined.length) {
    joined = joined.trimEnd();
    if (!joined.endsWith('...')) joined += '...';
  }
  return joined;
}

function SupervisorPage() {
  const {
    user,
    getInternsOfSupervisor,
    getTasksForUser,
    reviewTask,
    getAttendanceForSupervisor,
    getLeavesForSupervisor,
    reviewLeave,
  } = useAuth();
  const [interns, setInterns] = useState([]);
  const [taskCounts, setTaskCounts] = useState({});
  const [selectedIntern, setSelectedIntern] = useState(null);
  const [selectedInternTasks, setSelectedInternTasks] = useState([]);
  const [open, setOpen] = useState(false);
  const [savingTaskId, setSavingTaskId] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [attendanceRows, setAttendanceRows] = useState([]);
  const [leaveRows, setLeaveRows] = useState([]);
  const [leaveReviewDraft, setLeaveReviewDraft] = useState({});

  const filteredTasks =
    statusFilter === "all"
      ? selectedInternTasks
      : selectedInternTasks.filter((task) => (task.status || "pending") === statusFilter);

  useEffect(() => {
    async function fetchData() {
      const interns = await getInternsOfSupervisor(user.id);
      setInterns(interns);

      // Fetch task counts for each intern
      const counts = {};
      for (const intern of interns) {
        const tasks = await getTasksForUser(intern.id);
        counts[intern.id] = tasks.length;
      }
      setTaskCounts(counts);

      setAttendanceRows(await getAttendanceForSupervisor(user.id));
      setLeaveRows(await getLeavesForSupervisor(user.id));
    }
    if (user) fetchData();
  }, [user, getInternsOfSupervisor, getTasksForUser, getAttendanceForSupervisor, getLeavesForSupervisor]);

  const handleViewIntern = async (intern) => {
    setSelectedIntern(intern);
    const data = await getTasksForUser(intern.id);
    setSelectedInternTasks(data);
    setStatusFilter("all");
    setOpen(true);
  };

  const updateTaskReviewLocally = (taskId, key, value) => {
    setSelectedInternTasks((prev) =>
      prev.map((task) => (task.id === taskId ? { ...task, [key]: value } : task))
    );
  };

  const handleSaveReview = async (taskId) => {
    const task = selectedInternTasks.find((item) => item.id === taskId);
    if (!task) return;

    setSavingTaskId(taskId);
    await reviewTask(taskId, {
      status: task.status || "pending",
      reviewComment: task.review_comment || "",
    });
    setSavingTaskId(null);
  };

  const handleLeaveDecision = async (leaveId, status) => {
    const reviewComment = leaveReviewDraft[leaveId] || "";
    const data = await reviewLeave(leaveId, {
      status,
      reviewComment,
      reviewerId: user.id,
    });

    if (data.success) {
      setLeaveRows(await getLeavesForSupervisor(user.id));
    }
  };

  // Format date to YYYY-MM-DD
  const formatDate = (dateStr) =>
    dateStr
      ? typeof dateStr === "string"
        ? dateStr.slice(0, 10)
        : dateStr instanceof Date
        ? dateStr.toISOString().slice(0, 10)
        : ""
      : "";

  return (
    <Sheet
      sx={{
        maxWidth: 900,
        mx: "auto",
        my: 6,
        p: 4,
        borderRadius: "lg",
        boxShadow: "lg",
        bgcolor: "background.body",
      }}
    >
      <Typography level="h2" fontWeight="lg" sx={{ mb: 2 }}>
        Supervisor Dashboard
      </Typography>
      <Divider sx={{ mb: 3 }} />

      <Typography level="h4" sx={{ mb: 2 }}>
        Your Interns
      </Typography>
      {interns.length === 0 ? (
        <Typography color="neutral">
          You have no interns assigned.
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
          {interns.map((intern) => (
            <ListItem
              key={intern.id}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                borderBottom: "1px solid var(--joy-palette-neutral-200, #f0f0f0)",
                "&:last-child": { borderBottom: "none" },
              }}
            >
              <ListItemContent sx={{ flex: 1 }}>
                <Box>
                  <Typography fontWeight="md" fontSize="lg">
                    {intern.name}
                  </Typography>
                  <Typography color="neutral" level="body-sm">
                    {intern.email}
                  </Typography>
                  <Chip size="sm" variant="soft" color="primary" sx={{ mt: 0.5 }}>
                    {taskCounts[intern.id] !== undefined
                      ? `${taskCounts[intern.id]} ${
                          taskCounts[intern.id] === 1 ? "Task" : "Tasks"
                        }`
                      : "Tasks"}
                  </Chip>
                </Box>
              </ListItemContent>
              <Tooltip title="View Tasks" variant="outlined" color="primary">
                <IconButton
                  color="primary"
                  variant="soft"
                  sx={{ mx: 1 }}
                  onClick={() => handleViewIntern(intern)}
                >
                  <VisibilityIcon />
                </IconButton>
              </Tooltip>
            </ListItem>
          ))}
        </List>
      )}

      <Divider sx={{ my: 3 }} />

      <Typography level="h4" sx={{ mb: 2 }}>
        Intern Attendance (Recent)
      </Typography>
      {attendanceRows.length === 0 ? (
        <Typography color="neutral" sx={{ mb: 3 }}>No attendance records yet.</Typography>
      ) : (
        <Table size="sm" variant="soft" sx={{ mb: 3 }}>
          <thead>
            <tr>
              <th>Intern</th>
              <th>Date</th>
              <th>Status</th>
              <th>Note</th>
            </tr>
          </thead>
          <tbody>
            {attendanceRows.slice(0, 15).map((row) => (
              <tr key={row.id}>
                <td>{row.name}</td>
                <td>{row.attendance_date?.slice(0, 10)}</td>
                <td style={{ textTransform: "capitalize" }}>{row.status}</td>
                <td>{row.note || "-"}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <Typography level="h4" sx={{ mb: 2 }}>
        Leave Requests
      </Typography>
      {leaveRows.length === 0 ? (
        <Typography color="neutral">No leave requests yet.</Typography>
      ) : (
        <Table size="sm" variant="soft">
          <thead>
            <tr>
              <th>Intern</th>
              <th>From</th>
              <th>To</th>
              <th>Reason</th>
              <th>Status</th>
              <th>Comment</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {leaveRows.slice(0, 15).map((row) => (
              <tr key={row.id}>
                <td>{row.intern_name}</td>
                <td>{row.from_date?.slice(0, 10)}</td>
                <td>{row.to_date?.slice(0, 10)}</td>
                <td>{row.reason || "-"}</td>
                <td style={{ textTransform: "capitalize" }}>{row.status}</td>
                <td>
                  <Textarea
                    minRows={2}
                    size="sm"
                    value={leaveReviewDraft[row.id] ?? row.review_comment ?? ""}
                    onChange={(e) =>
                      setLeaveReviewDraft((prev) => ({ ...prev, [row.id]: e.target.value }))
                    }
                    placeholder="Add review comment"
                    sx={{ minWidth: 170 }}
                  />
                </td>
                <td>
                  <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                    <Button size="sm" color="success" onClick={() => handleLeaveDecision(row.id, "approved")}>
                      Approve
                    </Button>
                    <Button size="sm" color="danger" onClick={() => handleLeaveDecision(row.id, "rejected")}>
                      Reject
                    </Button>
                  </Box>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <Modal open={open} onClose={() => setOpen(false)}>
        <ModalDialog sx={{ minWidth: 420, maxWidth: 650 }}>
          <DialogTitle>
            {selectedIntern && (
              <>
                Task Entries for{" "}
                <Typography component="span" fontWeight="lg" color="primary">
                  {selectedIntern.name}
                </Typography>
              </>
            )}
          </DialogTitle>
          <DialogContent>
            {selectedIntern && selectedInternTasks.length === 0 && (
              <Typography color="neutral">
                No tasks found for this intern.
              </Typography>
            )}
            {selectedIntern && selectedInternTasks.length > 0 && (
              <>
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 1 }}>
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
                  aria-label="Intern task table"
                  size="sm"
                  variant="soft"
                  sx={{ borderRadius: "md", overflow: "hidden", mt: 1 }}
                >
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Task</th>
                    <th>Hours</th>
                    <th>Description</th>
                    <th>Status</th>
                    <th>Review</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTasks.map((task) => (
                    <tr key={task.id}>
                      <td>
                        <Typography level="body-md">
                          {formatDate(task.date)}
                        </Typography>
                      </td>
                      <td>
                        <Typography level="body-md">{task.task}</Typography>
                      </td>
                      <td>
                        <Typography level="body-md">{task.hours}</Typography>
                      </td>
                      <td>
                        <Typography
                          level="body-sm"
                          color="neutral"
                          sx={{
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "pre-line",
                            maxWidth: 260,
                          }}
                        >
                          {truncateDescription(task.description)}
                        </Typography>
                      </td>
                      <td>
                        <Select
                          size="sm"
                          value={task.status || "pending"}
                          onChange={(_, value) =>
                            updateTaskReviewLocally(task.id, "status", value || "pending")
                          }
                          sx={{ minWidth: 120 }}
                        >
                          <Option value="pending">Pending</Option>
                          <Option value="in-progress">In Progress</Option>
                          <Option value="completed">Completed</Option>
                          <Option value="blocked">Blocked</Option>
                        </Select>
                      </td>
                      <td>
                        <Textarea
                          minRows={2}
                          size="sm"
                          value={task.review_comment || ""}
                          placeholder="Add review"
                          onChange={(e) =>
                            updateTaskReviewLocally(task.id, "review_comment", e.target.value)
                          }
                          sx={{ minWidth: 180 }}
                        />
                      </td>
                      <td>
                        <Button
                          size="sm"
                          onClick={() => handleSaveReview(task.id)}
                          loading={savingTaskId === task.id}
                        >
                          Save
                        </Button>
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
          </DialogContent>
          <DialogActions>
            <Button
              startDecorator={<CloseIcon />}
              color="neutral"
              variant="outlined"
              onClick={() => setOpen(false)}
            >
              Close
            </Button>
            {selectedIntern && selectedInternTasks.length > 0 && (
              <Button
                startDecorator={<DownloadIcon />}
                color="primary"
                variant="solid"
                onClick={() => downloadCSV(selectedIntern, selectedInternTasks)}
              >
                Download CSV
              </Button>
            )}
          </DialogActions>
        </ModalDialog>
      </Modal>
    </Sheet>
  );
}

export default SupervisorPage;