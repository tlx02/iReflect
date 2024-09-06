import { useState } from "react";
import { Button, Stack, Text } from "@mantine/core";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "react-router-dom";
import toastUtils from "../utils/toast-utils";
import { PASSWORD, RE_PASSWORD } from "../constants";
import PasswordField from "./password-field";
import { usePasswordResetConfirmMutation } from "../redux/services/auth-api";
import { handleSubmitForm } from "../utils/form-utils";
import { useResolveError } from "../utils/error-utils";
import { emptySelector } from "../redux/utils";
import useGetUidAndToken from "../custom-hooks/use-get-uid-and-token";

const schema = z.object({
  [PASSWORD]: z.string().trim().min(1, "Please enter password"),
  [RE_PASSWORD]: z.string().trim().min(1, "Please enter password again"),
});

type PasswordResetFormProps = z.infer<typeof schema>;

const DEFAULT_VALUES: PasswordResetFormProps = {
  password: "",
  re_password: "",
};

function PasswordResetForm() {
  const [resetConfirmed, setResetConfirmed] = useState(false);
  const [passwordResetConfirm] = usePasswordResetConfirmMutation({
    selectFromResult: emptySelector,
  });

  const methods = useForm<PasswordResetFormProps>({
    resolver: zodResolver(schema),
    defaultValues: { ...DEFAULT_VALUES },
  });
  const { resolveError } = useResolveError({ name: "password-reset-form" });

  const { uid, token } = useGetUidAndToken();

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = async (formData: PasswordResetFormProps) => {
    if (isSubmitting) {
      return;
    }

    const { ...passwordResetFormData } = formData;

    // Check if password and re_password are equal
    if (
      passwordResetFormData[PASSWORD] !== passwordResetFormData[RE_PASSWORD]
    ) {
      toastUtils.error({ message: "Passwords does not match." });
      return;
    }

    const passwordResetConfirmPostData = {
      uid: uid || "",
      token: token || "",
      ...passwordResetFormData,
    };

    try {
      await passwordResetConfirm(passwordResetConfirmPostData).unwrap();
      setResetConfirmed(true);
    } catch (error) {
      resolveError(error);
    }
  };

  return resetConfirmed ? (
    <Stack spacing="lg">
      <Stack align="center">
        <Text size="lg" weight={600} align="center">
          Password Changed!
        </Text>

        <Text size="sm" align="center">
          Your password has been changed successfully.
        </Text>

        <Link to="/">
          <Button loading={isSubmitting}>Back to Login</Button>
        </Link>
      </Stack>
    </Stack>
  ) : (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmitForm(handleSubmit(onSubmit), resolveError)}>
        <Stack spacing="lg">
          <Stack>
            <Text size="lg" weight={600} align="center">
              Reset Password
            </Text>

            <PasswordField name={PASSWORD} label="New Password" autoFocus />

            <PasswordField name={RE_PASSWORD} label="Retype Password" />
          </Stack>

          <Button loading={isSubmitting} type="submit">
            Confirm New Password
          </Button>
        </Stack>
      </form>
    </FormProvider>
  );
}

export default PasswordResetForm;
