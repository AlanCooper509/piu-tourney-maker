import { Avatar, Button, Field, HStack, Input, Menu, Portal, Text, VStack } from "@chakra-ui/react";
import { IoCreateOutline, IoLogOutOutline } from "react-icons/io5";
import { useState } from "react";

import DialogForm from "../DialogForm";
import { toaster } from "../toaster";
import { useAuth } from "../../../context/AuthContext";
import { useMyProfile } from "../../../hooks/useMyProfile";
import handleUpdateProfile, { MAX_DISPLAY_NAME_LENGTH } from "../../../handlers/handleUpdateProfile";

function sendToast(title: string, description: string, type: "error" | "success") {
  toaster.create({ title, description, type, closable: true });
}

function ProfileAvatar({ name, src, size }: { name: string; src?: string | null; size: "xs" | "sm" | "lg" }) {
  return (
    <Avatar.Root size={size}>
      {/* initials show while the image loads, and stay if the link is broken */}
      <Avatar.Fallback name={name} />
      {src && <Avatar.Image src={src} />}
    </Avatar.Root>
  );
}

export default function ProfileMenu() {
  const { user, signOut } = useAuth();
  const { profile, setProfile } = useMyProfile();
  const [editOpen, setEditOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newAvatarUrl, setNewAvatarUrl] = useState("");
  const [saving, setSaving] = useState(false);

  // admin access is invite-only for now, so signed-out visitors get no login prompt here
  if (!user) return null;

  // fall back to the email while the profile loads (or if the user somehow has none)
  const shownName = profile?.displayName ?? user.email ?? "Account";

  function resetForm() {
    setNewName(profile?.displayName ?? "");
    setNewAvatarUrl(profile?.avatarUrl ?? "");
  }

  async function onSave() {
    setSaving(true);
    try {
      const saved = await handleUpdateProfile(user!.id, newName, newAvatarUrl);
      setProfile(saved);
      sendToast("Profile updated", "Your profile has been saved.", "success");
      return true;
    } catch (error) {
      // supabase errors aren't always Error instances, so read the message directly
      sendToast("Error", (error as { message?: string })?.message ?? "Could not update your profile.", "error");
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function onLogOut() {
    try {
      await signOut();
    } catch (error) {
      sendToast("Error", (error as { message?: string })?.message ?? "Could not log out.", "error");
    }
  }

  return (
    <>
      <Menu.Root positioning={{ placement: "bottom-end" }}>
        <Menu.Trigger asChild>
          {/* no hover/pressed/open background; keyboard focus ring is kept for accessibility */}
          <Button
            variant="ghost"
            size="sm"
            px={0}
            aria-label="Account menu"
            _hover={{ bg: "transparent" }}
            _active={{ bg: "transparent" }}
            _expanded={{ bg: "transparent" }}
          >
              <ProfileAvatar name={shownName} src={profile?.avatarUrl} size="xs" />
          </Button>
        </Menu.Trigger>
        <Portal>
          <Menu.Positioner>
            <Menu.Content minW="180px">
              <Menu.ItemGroup>
                <Menu.ItemGroupLabel>
                  <Text fontSize="xs" color="fg.muted">Signed in as</Text>
                  <Text truncate>{shownName}</Text>
                </Menu.ItemGroupLabel>
              </Menu.ItemGroup>
              <Menu.Separator />
              <Menu.Item
                value="edit-profile"
                onClick={() => {
                  resetForm();
                  setEditOpen(true);
                }}
              >
                <IoCreateOutline />
                Edit profile
              </Menu.Item>
              <Menu.Item value="logout" color="fg.error" onClick={onLogOut}>
                <IoLogOutOutline />
                Log out
              </Menu.Item>
            </Menu.Content>
          </Menu.Positioner>
        </Portal>
      </Menu.Root>

      <DialogForm
        title="Edit Profile"
        formBody={
          <VStack gap={4} align="stretch">
            {/* live preview, so a bad link is obvious before saving */}
            <HStack justify="center">
              <ProfileAvatar name={newName || shownName} src={newAvatarUrl.trim() || null} size="lg" />
            </HStack>

            <Field.Root>
              <Field.Label>Display Name</Field.Label>
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                maxLength={MAX_DISPLAY_NAME_LENGTH}
                placeholder="Enter a display name"
              />
              <Field.HelperText>
                Other organizers use this name to add you as an admin. It must be unique.
              </Field.HelperText>
            </Field.Root>

            <Field.Root>
              <Field.Label>Profile Picture URL (optional)</Field.Label>
              <Input
                value={newAvatarUrl}
                onChange={(e) => setNewAvatarUrl(e.target.value)}
                placeholder="https://example.com/me.png"
              />
              <Field.HelperText>
                A direct https:// link to an image. Leave blank to use your initials.
              </Field.HelperText>
            </Field.Root>
          </VStack>
        }
        loading={saving}
        open={editOpen}
        setOpen={setEditOpen}
        onSubmit={onSave}
        onCancel={resetForm}
      />
    </>
  );
}
