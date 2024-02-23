import { Card, CardBody, CardHeader, Heading, Text } from "@chakra-ui/react";
import Plan from "../models/Plan.tsx";
import { useNavigate } from "react-router-dom";

export default function PlanCard({ id, plan }: { id: string; plan: Plan }) {
  const navigate = useNavigate();
  return (
    <>
      <Card
        _hover={{ bgColor: "gray.100" }}
        w={360}
        cursor="pointer"
        onClick={() => navigate(`/plan?id=${id}`)}
      >
        <CardHeader>
          <Heading size="md">{plan.name}</Heading>
        </CardHeader>
        {plan.description && (
          <CardBody>
            <Text noOfLines={4} whiteSpace="pre-line">
              {plan.description}
            </Text>
          </CardBody>
        )}
      </Card>
    </>
  );
}
