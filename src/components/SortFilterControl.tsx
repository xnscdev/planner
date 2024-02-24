import { Dispatch, SetStateAction } from "react";
import {
  Button,
  Input,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItemOption,
  MenuList,
  MenuOptionGroup,
} from "@chakra-ui/react";
import { ChevronDownIcon } from "@chakra-ui/icons";

export function SortFilterControl({
  sortSubject,
  setSortSubject,
  sortNumber,
  setSortNumber,
  filter,
  setFilter,
}: {
  sortSubject: string;
  setSortSubject: Dispatch<SetStateAction<string>>;
  sortNumber: string;
  setSortNumber: Dispatch<SetStateAction<string>>;
  filter: string;
  setFilter: Dispatch<SetStateAction<string>>;
}) {
  return (
    <>
      <Menu closeOnSelect={false}>
        <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
          Sort
        </MenuButton>
        <MenuList>
          <MenuOptionGroup
            value={sortSubject}
            onChange={(value) => setSortSubject(value as string)}
            title="By subject"
            type="radio"
          >
            <MenuItemOption value="asc">Ascending</MenuItemOption>
            <MenuItemOption value="dsc">Descending</MenuItemOption>
          </MenuOptionGroup>
          <MenuDivider />
          <MenuOptionGroup
            value={sortNumber}
            onChange={(value) => setSortNumber(value as string)}
            title="By number"
            type="radio"
          >
            <MenuItemOption value="asc">Ascending</MenuItemOption>
            <MenuItemOption value="dsc">Descending</MenuItemOption>
          </MenuOptionGroup>
        </MenuList>
      </Menu>
      <Input
        type="text"
        w="fit-content"
        placeholder="Filter"
        value={filter}
        onChange={(event) => setFilter(event.target.value)}
      />
    </>
  );
}
