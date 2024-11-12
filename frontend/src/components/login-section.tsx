import {
  createStyles,
  Group,
  Stack,
  Title,
  Text,
  Anchor,
  Space,
  Paper,
} from "@mantine/core";
import { APP_NAME, SUPPORT_EMAIL } from "../constants";
import LoginProvider from "../contexts/login-provider";
import { colorModeValue } from "../utils/theme-utils";
import LoginCard from "./login-card";
import PasswordResetCard from "./password-reset-card";

interface LoginSectionProps {
  isPasswordReset?: boolean;
}

const useStyles = createStyles((theme) => ({
  title: {
    fontSize: "60px",
  },
  subtitle: {
    fontSize: "30px",
  },
  meta: {
    color: colorModeValue(theme.colorScheme, {
      lightModeValue: theme.colors.gray[7],
      darkModeValue: theme.colors.dark[1],
    }),
  },
  paper: {
    "background-color": colorModeValue(theme.colorScheme, {
      lightModeValue: theme.colors.gray[0],
      darkModeValue: theme.colors.dark[8],
    }),
  },
}));

function LoginSection({ isPasswordReset }: LoginSectionProps) {
  const { classes } = useStyles();

  return (
    <Paper shadow="xl" p="xl" withBorder className={classes.paper}>
      <Stack spacing="xl">
        <Stack spacing="sm" align="center">
          <Title className={classes.title}>{APP_NAME}</Title>
          <Text span align="center" className={classes.meta}>
            Manage student peer reviews, discussions and reflections over
            multiple milestones in one app
          </Text>
          <Space h="xl" />

          <Stack spacing="xs">
            <Title order={2} className={classes.subtitle}>
              Log in to your account
            </Title>

            <Group spacing={4} position="center">
              <Text span className={classes.meta}>
                Don&apos;t have an account?
              </Text>

              <Anchor
                href={`mailto:${SUPPORT_EMAIL}?subject=[Account%20sign%20up]`}
                weight={600}
              >
                Contact us!
              </Anchor>
            </Group>
          </Stack>
        </Stack>

        <LoginProvider>
          {isPasswordReset ? <PasswordResetCard /> : <LoginCard />}
        </LoginProvider>
      </Stack>
    </Paper>
  );
}

export default LoginSection;
