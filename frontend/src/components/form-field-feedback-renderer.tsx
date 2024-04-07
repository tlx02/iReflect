import { Button, Text, Stack, Paper, Blockquote } from "@mantine/core";
import { useFormContext } from "react-hook-form";
import { FaRegSmile } from "react-icons/fa";
import { TbMessageChatbot } from "react-icons/tb";
import { useLazyGetFeedbackQuery } from "../redux/services/feedback-api";
import { useResolveError } from "../utils/error-utils";

type Props = {
  name: string;
};

function FormFieldFeedbackRenderer({ name }: Props) {
  const { getValues } = useFormContext<{ [name: string]: string }>();
  const [getFeedback, { isFetching, feedbackResult }] = useLazyGetFeedbackQuery(
    {
      selectFromResult: ({ isFetching, data: feedbackResult }) => ({
        isFetching,
        feedbackResult,
      }),
    },
  );
  const { resolveError } = useResolveError({
    name: "form-field-feedback-renderer",
  });

  const onGenerateFeedback = () => {
    const content = getValues(name);
    if (isFetching || !content) {
      return;
    }

    getFeedback({ content })
      .unwrap()
      .catch((error) => resolveError(error));
  };

  return (
    <Stack>
      <div>
        <Button
          leftIcon={<FaRegSmile />}
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
            <Text size="sm" style={{ whiteSpace: "pre-wrap" }}>
              {feedbackResult.feedback}
            </Text>
          </Paper>
        </Blockquote>
      )}
    </Stack>
  );
}

export default FormFieldFeedbackRenderer;
