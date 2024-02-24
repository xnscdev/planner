import { useRef } from "react";
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Button,
} from "@chakra-ui/react";
import { DeleteIcon } from "@chakra-ui/icons";

export default function DeleteAlertDialog({
  title,
  isOpen,
  onClose,
  onDelete,
}: {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  onDelete: () => void;
}) {
  const cancelRef = useRef<HTMLButtonElement | null>(null);

  function onClick() {
    onClose();
    onDelete();
  }

  return (
    <AlertDialog
      leastDestructiveRef={cancelRef}
      isOpen={isOpen}
      onClose={onClose}
    >
      <AlertDialogOverlay>
        <AlertDialogContent>
          <AlertDialogHeader fontSize="lg" fontWeight="bold">
            {title}
          </AlertDialogHeader>
          <AlertDialogBody>
            Are you sure? You can't undo this action.
          </AlertDialogBody>
          <AlertDialogFooter>
            <Button onClick={onClose} ref={cancelRef} mr={3}>
              Cancel
            </Button>
            <Button
              onClick={onClick}
              colorScheme="red"
              leftIcon={<DeleteIcon />}
            >
              Delete
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  );
}
