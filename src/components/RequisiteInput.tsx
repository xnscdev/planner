import {
  Flex,
  FormControl,
  FormLabel,
  IconButton,
  Text,
} from "@chakra-ui/react";
import { AddIcon } from "@chakra-ui/icons";
import { Dispatch, SetStateAction } from "react";
import { CourseRequisite } from "../models/Course.tsx";

export default function RequisiteInput({
  requisites,
  setRequisites,
}: {
  requisites: CourseRequisite[];
  setRequisites: Dispatch<SetStateAction<CourseRequisite[]>>;
}) {
  return (
    <FormControl>
      <FormLabel>
        <Flex columnGap={4} alignItems="center">
          <Text>Prerequisites</Text>
          <IconButton
            aria-label="Add Prerequisite"
            icon={<AddIcon />}
            colorScheme="green"
            size="sm"
          />
        </Flex>
      </FormLabel>
    </FormControl>
  );
}
