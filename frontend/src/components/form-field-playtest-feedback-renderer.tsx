import { Button, Text, Stack, Paper, Blockquote, Title } from "@mantine/core";
import { useFormContext } from "react-hook-form";
import { IoGameControllerOutline } from "react-icons/io5";
import { TbMessageChatbot } from "react-icons/tb";
import Markdown, { Components } from "react-markdown";
import { useState, useEffect } from "react";
import { useResolveError } from "../utils/error-utils";

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
  const { resolveError } = useResolveError({ name: "form-field-playtest-feedback-renderer" });

  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [promptText, setPromptText] = useState<string>("");

  useEffect(() => {
    const fetchPrompt = async () => {
      try {
        const res = await fetch("/prompt_for_playtest_feedback.txt");
        const text = await res.text();
        setPromptText(text);
      } catch (error) {
        console.error("Failed to load prompt file:", error);
      }
    };
    fetchPrompt();
  }, []);

  const onGenerateFeedback = async () => {
    const content = getValues(name);
    const genre = getValues("Genre");
    const mechanic = getValues("Mechanic");
    if (!content || isLoading) return;

    const fullQuery = `
      ${promptText}
      Genre: ${genre}
      Main Mechanic: ${mechanic}
      Question: ${question}
      Answer: ${content}
    `;

    try {
      setIsLoading(true);
      const res = await fetch("/api/playtest/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": "your-secure-api-key-here",
        },
        body: JSON.stringify({ query: fullQuery, mode: "hybrid" }),
      });

      const raw = await res.json() as { response?: string };
      setFeedback(raw.response ?? "No feedback returned.");
    } catch (err) {
      resolveError(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Stack>
      <div>
        <Button
          leftIcon={<IoGameControllerOutline />}
          compact
          loading={isLoading}
          onClick={onGenerateFeedback}
        >
          {isLoading ? "Generating" : "Generate"} feedback
        </Button>
      </div>

      {feedback &&(
        <Blockquote color="blue" mt="xl" icon={<TbMessageChatbot size={30} />}>
          <Paper withBorder shadow="xl" p="xl">
            <Text size="sm">
              Here is some feedback on what you have written:
              <br />
              <br />
            </Text>
            <Markdown components={markdownComponents}>
              {feedback}
            </Markdown>
          </Paper>
        </Blockquote>
      )}
    </Stack>
  );
}


export default FormFieldPlaytestFeedbackRenderer;


