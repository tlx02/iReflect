import { Stack, Select, Button, SelectItem } from "@mantine/core";
import { RiFileDownloadLine } from "react-icons/ri";
import { useNavigate } from "react-router-dom";
import { skipToken } from "@reduxjs/toolkit/dist/query";
import { useMemo, useState } from "react";
import { useGetSingleTemplateQuery } from "../redux/services/templates-api";
import { useGetCoursesQuery } from "../redux/services/courses-api";
import PlaceholderWrapper from "./placeholder-wrapper";

type Props = {
  navigate: ReturnType<typeof useNavigate>;
  courseId: string;
  templateId: string;
  onSuccess: () => void;
};

function MilestoneTemplateCopyToSelection({
  navigate,
  courseId,
  templateId,
  onSuccess,
}: Props) {
  const { milestoneTemplateData, isFetching, error } =
    useGetSingleTemplateQuery(
      courseId === undefined || templateId === undefined
        ? skipToken
        : { courseId, templateId },
      {
        selectFromResult: ({
          data: milestoneTemplateData,
          isFetching,
          error,
        }) => ({
          milestoneTemplateData,
          isFetching,
          error,
        }),
      },
    );

  const { courses, isLoading, coursesError } = useGetCoursesQuery(undefined, {
    selectFromResult: ({ data: courses, isLoading, error: coursesError }) => ({
      courses,
      isLoading,
      coursesError,
    }),
  });

  const courseOptions: SelectItem[] = useMemo(
    () =>
      courses?.map((course) => ({
        value: String(course.id),
        label: course.name,
      })) ?? [],
    [courses],
  );

  const [selectedCourse, setSelectedCourse] = useState<string>();

  const handleSelectedCourseChange = (value: string) => {
    setSelectedCourse(value);
  };

  const handleCopyForm = (targetCourseId?: string) => {
    if (!targetCourseId || !milestoneTemplateData) {
      return;
    }

    // Navigate to the FormCreationPage with the form data in the state
    navigate(`/courses/${targetCourseId}/templates/new`, {
      state: { milestoneTemplateData },
    });

    onSuccess();
  };

  return (
    <PlaceholderWrapper
      py={150}
      isLoading={isFetching}
      loadingMessage="Loading template..."
      showDefaultMessage={!milestoneTemplateData}
      defaultMessage="No template found."
    >
      <PlaceholderWrapper
        py={150}
        isLoading={isFetching}
        loadingMessage="Loading courses..."
        showDefaultMessage={!courses}
        defaultMessage="No courses found."
      >
        <Stack>
          <Select
            label="Course to copy to"
            placeholder="Pick value"
            data={courseOptions}
            value={selectedCourse}
            onChange={handleSelectedCourseChange}
          />
          <Button
            disabled={!selectedCourse}
            onClick={() => handleCopyForm(selectedCourse)}
            leftIcon={<RiFileDownloadLine />}
          >
            Copy Template
          </Button>
        </Stack>
      </PlaceholderWrapper>
    </PlaceholderWrapper>
  );
}

export default MilestoneTemplateCopyToSelection;
