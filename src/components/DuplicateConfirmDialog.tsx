import { useRef } from "react";
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Button,
  Icon,
} from "@chakra-ui/react";
import { BiCopy } from "react-icons/bi";

export default function DuplicateConfirmDialog({
  planName,
  isOpen,
  onClose,
  onConfirm,
}: {
  planName: string;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const cancelRef = useRef<HTMLButtonElement | null>(null);

  function onClick() {
    onClose();
    onConfirm();
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
            Duplicate {planName}
          </AlertDialogHeader>
          <AlertDialogBody>
            The duplicate will be saved as <b>Copy of {planName}</b>.
          </AlertDialogBody>
          <AlertDialogFooter>
            <Button onClick={onClose} ref={cancelRef} mr={3}>
              Cancel
            </Button>
            <Button
              onClick={onClick}
              colorScheme="orange"
              leftIcon={<Icon boxSize={6} as={BiCopy} />}
            >
              Duplicate
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  );
}
