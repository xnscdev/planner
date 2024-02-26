import { Dispatch, SetStateAction } from "react";
import {
  Icon,
  IconButton,
  Input,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItemOption,
  MenuList,
  MenuOptionGroup,
} from "@chakra-ui/react";
import { BiFilterAlt } from "react-icons/bi";

export function SortFilterControl({
  sortCriteria,
  setSortCriteria,
  sortDirection,
  setSortDirection,
  filter,
  setFilter,
  filterOptions,
  setFilterOptions,
  usedOption,
}: {
  sortCriteria: string;
  setSortCriteria: Dispatch<SetStateAction<string>>;
  sortDirection: string;
  setSortDirection: Dispatch<SetStateAction<string>>;
  filter: string;
  setFilter: Dispatch<SetStateAction<string>>;
  filterOptions: string[];
  setFilterOptions: Dispatch<SetStateAction<string[]>>;
  usedOption: boolean;
}) {
  return (
    <>
      <Menu closeOnSelect={false}>
        <MenuButton
          as={IconButton}
          icon={<Icon boxSize={6} as={BiFilterAlt} />}
          aria-label="Sort and Filter"
        />
        <MenuList>
          <MenuOptionGroup
            value={sortCriteria}
            onChange={(value) => setSortCriteria(value as string)}
            title="Sort criteria"
            type="radio"
          >
            <MenuItemOption value="subject">Subject</MenuItemOption>
            <MenuItemOption value="number">Number</MenuItemOption>
            <MenuItemOption value="credits">Credits</MenuItemOption>
          </MenuOptionGroup>
          <MenuDivider />
          <MenuOptionGroup
            value={sortDirection}
            onChange={(value) => setSortDirection(value as string)}
            title="Sort direction"
            type="radio"
          >
            <MenuItemOption value="asc">Ascending</MenuItemOption>
            <MenuItemOption value="dsc">Descending</MenuItemOption>
          </MenuOptionGroup>
          <MenuDivider />
          <MenuOptionGroup
            value={filterOptions}
            onChange={(value) => setFilterOptions(value as string[])}
            title="Filter"
            type="checkbox"
          >
            <MenuItemOption value="fall">Show fall courses</MenuItemOption>
            <MenuItemOption value="spring">Show spring courses</MenuItemOption>
            <MenuItemOption value="summer">Show summer courses</MenuItemOption>
            {usedOption && (
              <MenuItemOption value="used">Show used courses</MenuItemOption>
            )}
          </MenuOptionGroup>
        </MenuList>
      </Menu>
      <Input
        type="text"
        w="auto"
        placeholder="Filter&hellip;"
        value={filter}
        onChange={(event) => setFilter(event.target.value)}
      />
    </>
  );
}
