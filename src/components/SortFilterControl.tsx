import { Dispatch, SetStateAction } from "react";
import {
  Button,
  Input,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuItemOption,
  MenuList,
  MenuOptionGroup,
  Switch,
} from "@chakra-ui/react";
import { ChevronDownIcon } from "@chakra-ui/icons";

export function SortFilterControl({
  sortSubject,
  setSortSubject,
  sortNumber,
  setSortNumber,
  filter,
  setFilter,
  showAvailability,
  setShowAvailability,
  showUsed,
  setShowUsed,
  usedOption,
}: {
  sortSubject: string;
  setSortSubject: Dispatch<SetStateAction<string>>;
  sortNumber: string;
  setSortNumber: Dispatch<SetStateAction<string>>;
  filter: string;
  setFilter: Dispatch<SetStateAction<string>>;
  showAvailability: string[];
  setShowAvailability: Dispatch<SetStateAction<string[]>>;
  showUsed?: boolean;
  setShowUsed?: Dispatch<SetStateAction<boolean>>;
  usedOption: boolean;
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
          <MenuDivider />
          <MenuOptionGroup
            value={showAvailability}
            onChange={(value) => setShowAvailability(value as string[])}
            title="Filter by availability"
            type="checkbox"
          >
            <MenuItemOption value="fall">Fall</MenuItemOption>
            <MenuItemOption value="spring">Spring</MenuItemOption>
            <MenuItemOption value="summer">Summer</MenuItemOption>
          </MenuOptionGroup>
          {usedOption && (
            <>
              <MenuDivider />
              <MenuItem
                as={Switch}
                isChecked={showUsed!}
                onChange={(event) =>
                  setShowUsed!((event.target as HTMLInputElement).checked)
                }
              >
                Show Used
              </MenuItem>
            </>
          )}
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
