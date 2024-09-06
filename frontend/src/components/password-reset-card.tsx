import { Paper } from "@mantine/core";
import PasswordResetForm from "./password-reset-form";

function PasswordResetCard() {
  return (
    <Paper withBorder shadow="md" p="xl" radius="md">
      <PasswordResetForm />
    </Paper>
  );
}

export default PasswordResetCard;
