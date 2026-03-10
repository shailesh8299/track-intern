import React, { useEffect, useState } from "react";
import {
  Sheet,
  Typography,
  FormControl,
  FormLabel,
  Input,
  Button,
  Box,
  Alert,
} from "@mui/joy";
import { useAuth } from "../context/AuthContext";

function ProfilePage() {
  const { user, getUserProfile, updateUserProfile } = useAuth();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    position: "",
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("neutral");

  useEffect(() => {
    async function loadProfile() {
      if (!user?.id) return;
      const data = await getUserProfile(user.id);
      if (data.success && data.profile) {
        setForm({
          name: data.profile.name || "",
          email: data.profile.email || "",
          phone: data.profile.phone || "",
          position: data.profile.position || "",
        });
      }
    }

    loadProfile();
  }, [user, getUserProfile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!/^\d{10}$/.test(form.phone.trim())) {
      setMessageType("danger");
      setMessage("Phone must be exactly 10 digits.");
      return;
    }

    if (!form.name.trim()) {
      setMessageType("danger");
      setMessage("Name is required.");
      return;
    }

    if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(form.email.trim())) {
      setMessageType("danger");
      setMessage("Please enter a valid email.");
      return;
    }

    setSaving(true);
    const data = await updateUserProfile(user.id, {
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      position: form.position.trim(),
    });
    setSaving(false);

    if (data.success) {
      setMessageType("success");
      setMessage("Profile updated successfully.");
      setForm((prev) => ({
        ...prev,
        name: data.profile.name || "",
        email: data.profile.email || "",
        phone: data.profile.phone || "",
        position: data.profile.position || "",
      }));
      return;
    }

    setMessageType("danger");
    setMessage(data.message || "Unable to update profile.");
  };

  return (
    <Sheet
      sx={{
        maxWidth: 560,
        mx: "auto",
        my: 6,
        p: 4,
        borderRadius: "lg",
        boxShadow: "md",
        bgcolor: "background.body",
      }}
    >
      <Typography level="h3" sx={{ mb: 2 }}>
        Profile
      </Typography>

      {message && (
        <Alert color={messageType} sx={{ mb: 2 }}>
          {message}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSave}>
        <FormControl sx={{ mb: 2 }}>
          <FormLabel>Name</FormLabel>
          <Input name="name" value={form.name} onChange={handleChange} required />
        </FormControl>

        <FormControl sx={{ mb: 2 }}>
          <FormLabel>Email</FormLabel>
          <Input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
          />
        </FormControl>

        <FormControl required sx={{ mb: 2 }}>
          <FormLabel>Phone (10 digits)</FormLabel>
          <Input
            name="phone"
            placeholder="9876543210"
            value={form.phone}
            onChange={handleChange}
            startDecorator="+91"
            type="tel"
            slotProps={{ input: { maxLength: 10, inputMode: "numeric", pattern: "[0-9]*" } }}
            required
          />
        </FormControl>

        <FormControl sx={{ mb: 3 }}>
          <FormLabel>Position</FormLabel>
          <Input
            name="position"
            placeholder="Intern / Supervisor / Admin"
            value={form.position}
            onChange={handleChange}
          />
        </FormControl>

        <Button type="submit" loading={saving} disabled={saving}>
          Save Details
        </Button>
      </Box>
    </Sheet>
  );
}

export default ProfilePage;
