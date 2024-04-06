import React, { useMemo, useState } from "react";
import { skipToken } from "@reduxjs/toolkit/query/react";
import { Popover, Button, Stack, MultiSelect, SelectItem } from "@mantine/core";
import { useGetCourseGroupsQuery } from "../redux/services/groups-api";
import { SubmissionType } from "../types/templates";
import { useUpdateSubmissionViewableGroupsMutation } from "../redux/services/submissions-api";
import { GroupData } from "../types/groups";
import toastUtils from "../utils/toast-utils";
import PlaceholderWrapper from "./placeholder-wrapper";

type PublishSubmissionsPopoverProps = {
  courseId?: number | string;
  submissionId?: number | string;
  submissionType?: SubmissionType;
  viewableGroups?: GroupData[];
};

const PublishSubmissionsPopover = ({
  courseId,
  submissionId,
  submissionType,
  viewableGroups,
}: PublishSubmissionsPopoverProps) => {
  const { groups, isLoadingGroups, courseGroupsError } =
    useGetCourseGroupsQuery(
      courseId === undefined || submissionType !== SubmissionType.Group
        ? skipToken
        : { courseId, me: false },
      {
        selectFromResult: ({
          data: groups,
          isLoading: isLoadingGroups,
          error: courseGroupsError,
        }) => ({
          groups,
          isLoadingGroups,
          courseGroupsError,
        }),
      },
    );

  const groupOptions: string[] = useMemo(
    () => groups?.map(({ name }) => name) ?? [],
    [groups],
  );

  const viewableGroupDefaultOptions =
    viewableGroups?.map(({ name }) => name) ?? [];
  const [selectedGroups, setSelectedGroups] = useState<string[]>(
    viewableGroupDefaultOptions,
  );

  const handleSelectedGroupsChange = (value: string[]) => {
    setSelectedGroups(value);
  };

  const [updatePublishingStatus, { isUpdatingPublishingStatus }] =
    useUpdateSubmissionViewableGroupsMutation({
      selectFromResult: ({ isLoading: isUpdatingPublishingStatus }) => ({
        isUpdatingPublishingStatus,
      }),
    });

  const onUpdatePublishingStatus = async () => {
    if (
      isUpdatingPublishingStatus ||
      courseId === undefined ||
      submissionId === undefined ||
      groups === undefined
    ) {
      return;
    }

    const viewableGroupsIds: number[] = selectedGroups
      .map((name) => groups.find((group) => group.name === name)?.id ?? -1)
      .filter((id) => id !== -1);

    const submissionViewableGroupsPutData = {
      courseId,
      submissionId,
      groupIds: viewableGroupsIds,
    };

    await updatePublishingStatus({
      ...submissionViewableGroupsPutData,
    }).unwrap();

    toastUtils.success({
      message:
        "This submission's publishing status has been updated successfully.",
    });
  };

  if (isLoadingGroups) {
    return (
      <PlaceholderWrapper
        py={150}
        isLoading={isLoadingGroups}
        loadingMessage="Loading groups..."
      />
    );
  }

  return (
    <Popover width={300} position="bottom-start" withArrow shadow="md">
      <Popover.Target>
        <Button color="blue">Change Publishing Status</Button>
      </Popover.Target>
      <Popover.Dropdown>
        <Stack spacing={12}>
          <MultiSelect
            label="Groups to publish to"
            placeholder="Pick value"
            data={groupOptions}
            searchable
            clearable
            value={selectedGroups}
            onChange={handleSelectedGroupsChange}
          />
          <Button
            onClick={onUpdatePublishingStatus}
            loading={isUpdatingPublishingStatus}
          >
            Publish to Groups
          </Button>
        </Stack>
      </Popover.Dropdown>
    </Popover>
  );
};

export default PublishSubmissionsPopover;
