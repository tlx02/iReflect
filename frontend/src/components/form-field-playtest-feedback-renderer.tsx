import { Button, Text, Stack, Paper, Blockquote, Title } from "@mantine/core";
import { useFormContext } from "react-hook-form";
import { IoGameControllerOutline } from "react-icons/io5";
import { TbMessageChatbot } from "react-icons/tb";
import { useContext } from "react";
import Markdown, { Components } from "react-markdown";
import {
  useLazyGetFeedbackQuery,
} from "../redux/services/playtest-api";
import { useResolveError } from "../utils/error-utils";
import { FeedbackContext } from "../contexts/feedback-data-collection-provider";

type Props = {
  name: string;
  question: string;
  collectData: boolean | undefined;
};

const markdownComponents: Partial<Components> = {
  h1: ({ node, children }) => <Title order={1}>{children}</Title>,
  h2: ({ node, children }) => <Title order={2}>{children}</Title>,
  h3: ({ node, children }) => (
    <Title order={4} mb="md">
      {children}
    </Title>
  ),
  h4: ({ node, children }) => (
    <Title order={5} mb="xs">
      {children}
    </Title>
  ),
  p: ({ node, children }) => <Text size="sm">{children}</Text>,
  li: ({ node, children }) => (
    <Text size="sm" component="li" mb="xs">
      {children}
    </Text>
  ),
  strong: ({ node, children }) => <Text weight={700}>{children}</Text>,
};

function FormFieldPlaytestFeedbackRenderer({ name, question, collectData }: Props) {
  const { getValues } = useFormContext<{ [name: string]: string }>();
  const feedbackContext = useContext(FeedbackContext);

  const [getFeedback, { isFetching, data: feedbackResult }] = useLazyGetFeedbackQuery();

  const { resolveError } = useResolveError({
    name: "form-field-feedback-renderer",
  });

  const onGenerateFeedback = async () => {
    const content = getValues(name);
    if (isFetching || !content) {
      return;
    }

    const fullQuery = `
      You are a Computer Science professor with 30 years of experience in game design and play testing.
      Grade the response to the following:
      Question: ${question}
      Answer: ${content}
      Structure your response like this:
      [Score: xx/100]
      [*Feedback based on the knowledge graph*]
    `;

    try {
      await getFeedback({ query: fullQuery, mode: "hybrid" }).unwrap();
    } catch (error) {
      resolveError(error);
      return;
    }

    // // If form in test mode, responses not considered
    // if (feedbackContext.testMode || !feedbackContext.submissionId) {
    //   return;
    // }
  };

  return (
    <Stack>
      <div>
        <Button
          leftIcon={<IoGameControllerOutline />}
          compact
          loading={isFetching}
          onClick={onGenerateFeedback}
        >
          {isFetching ? "Generating" : "Generate"} feedback
        </Button>
      </div>

      {feedbackResult && (
        <Blockquote color="blue" mt="xl" icon={<TbMessageChatbot size={30} />}>
          <Paper withBorder shadow="xl" p="xl">
            <Text size="sm">
              Here is some feedback on what you have written:
              <br />
              <br />
            </Text>
            <Markdown components={markdownComponents}>
              {feedbackResult.response}
            </Markdown>
          </Paper>
        </Blockquote>
      )}
    </Stack>
  );
}

export default FormFieldPlaytestFeedbackRenderer;
