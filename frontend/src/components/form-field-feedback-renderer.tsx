import { Button, Text, Stack, Paper, Blockquote } from "@mantine/core";
import { useFormContext } from "react-hook-form";
import { FaRegSmile } from "react-icons/fa";
import { TbMessageChatbot } from "react-icons/tb";
import { useCreateInitialResponseIfNotExistsMutation, useLazyGetFeedbackQuery } from "../redux/services/feedback-api";
import { useResolveError } from "../utils/error-utils";
import { useContext } from "react";
import { FeedbackContext } from "../contexts/feedback-data-collection-provider";

type Props = {
  name: string;
  question: string;
  collectData: boolean | undefined;
};

function FormFieldFeedbackRenderer({ name, question, collectData }: Props) {
  const { getValues } = useFormContext<{ [name: string]: string }>();
  const feedbackContext =  useContext(FeedbackContext)

  const [getFeedback, { isFetching, feedbackResult }] = useLazyGetFeedbackQuery(
    {
      selectFromResult: ({ isFetching, data: feedbackResult }) => ({
        isFetching,
        feedbackResult,
      }),
    },
  );

  const [tryStoreInitialResponse, { isLoading }] = useCreateInitialResponseIfNotExistsMutation({
    selectFromResult: ({ isLoading }) => ({ isLoading }),
  });

  const { resolveError } = useResolveError({
    name: "form-field-feedback-renderer",
  });

  const onGenerateFeedback = async () => {
    const content = getValues(name);
    if (isFetching || !content) {
      return;
    }

    try {
      await getFeedback({ content }).unwrap();
    } catch (error) {
      resolveError(error);
      return;
    }

    // If form in test mode, responses not considered
    if (feedbackContext.testMode || !feedbackContext.submissionId) {
      return;
    }

    const feedbackPostData = {
      submission_id: feedbackContext.submissionId,
      question: question,
      initial_response: content,
    }

    try {
      await tryStoreInitialResponse(feedbackPostData).unwrap();
    } catch (error) {
      resolveError(error);
    }

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
