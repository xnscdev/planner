import {
  Box,
  Button,
  Heading,
  useDisclosure,
  Wrap,
  WrapItem,
} from "@chakra-ui/react";
import { AddIcon } from "@chakra-ui/icons";
import { useDb } from "../providers/DatabaseProvider.tsx";
import { useEffect, useState } from "react";
import Plan from "../models/Plan.tsx";
import PlanCard from "../components/PlanCard.tsx";
import AddPlanForm from "../components/AddPlanForm.tsx";

export default function PlansPage() {
  const db = useDb();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState<(Plan & { id: string })[]>([]);

  function update() {
    setLoading(true);
    db.getAllPlans().then((plans) => {
      setPlans(plans);
      setLoading(false);
    });
  }

  useEffect(() => {
    update();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Box p={10}>
      <Heading size="lg">My Plans</Heading>
      <Button
        onClick={onOpen}
        mt={8}
        mb={12}
        leftIcon={<AddIcon />}
        colorScheme="green"
        isDisabled={loading}
      >
        Add Plan
      </Button>
      <AddPlanForm isOpen={isOpen} onClose={onClose} update={update} />
      {loading ? (
        <Heading size="md" color="gray">
          Loading&hellip;
        </Heading>
      ) : plans.length ? (
        <Wrap spacing={6}>
          {plans.map(({ id, ...plan }) => (
            <WrapItem key={id}>
              <PlanCard id={id} plan={plan} />
            </WrapItem>
          ))}
        </Wrap>
      ) : (
        <Heading size="md">
          No plans yet! Add a plan above to get started.
        </Heading>
      )}
    </Box>
  );
}
