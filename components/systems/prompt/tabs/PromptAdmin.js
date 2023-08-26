import { useState } from "react";
import useSWR from "swr";
import { useRouter } from "next/router";
import { mutate } from "swr";
import { sdk } from "../../../../lib/apiClient";
import { TextField, Button, Divider, Container } from "@mui/material";
// TODO: Add prompt category field and logic to choose category before choosing prompt, setting to "Default" for now.
const promptCategory = "Default";
export default function PromptAdmin({ friendly_name, name, args, enabled }) {
  const router = useRouter();
  const promptName = router.query.prompt;
  const prompt = useSWR(
    "prompt/" + promptName,
    async () => await sdk.getPrompt(promptName, promptCategory)
  );
  const [newName, setNewName] = useState(promptName);
  const [newBody, setNewBody] = useState(prompt.data);
  console.log(prompt);
  const handleDelete = async () => {
    await sdk.deletePrompt(promptName, promptCategory);
    mutate(`prompt`);
    router.push(`/prompt`);
  };
  const handleSave = async () => {
    await sdk.updatePrompt(newName, promptCategory, newBody);
    mutate(`prompt`);
    router.push(`/prompt/${newName}`);
  };
  return (
    <Container>
      <TextField
        fullWidth
        variant="outlined"
        label="New Prompt Name"
        value={newName}
        onChange={(e) => {
          setNewName(e.target.value);
        }}
      />
      <TextField
        fullWidth
        multiline
        rows={30}
        variant="outlined"
        label="New Prompt Body"
        value={newBody}
        onChange={(e) => {
          setNewBody(e.target.value);
        }}
      />
      <Button
        variant="contained"
        color="primary"
        onClick={handleSave}
        sx={{ marginY: "1rem" }}
      >
        Save Prompt
      </Button>
      <Divider sx={{ my: "1.5rem" }} />
      <Button onClick={handleDelete} variant="contained" color="error">
        Delete Prompt
      </Button>
    </Container>
  );
}
