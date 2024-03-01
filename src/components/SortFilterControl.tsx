import { ChangeEvent, Dispatch, SetStateAction } from "react";
import {
  Icon,
  IconButton,
  Input,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuItemOption,
  MenuList,
  MenuOptionGroup,
  Select,
} from "@chakra-ui/react";
import { BiFilterAlt } from "react-icons/bi";
import { TagData } from "../models/Tag.tsx";

export function SortFilterControl({
  sortCriteria,
  setSortCriteria,
  sortDirection,
  setSortDirection,
  filter,
  setFilter,
  tagFilter,
  setTagFilter,
  filterOptions,
  setFilterOptions,
  tags,
  usedOption,
}: {
  sortCriteria: string;
  setSortCriteria: Dispatch<SetStateAction<string>>;
  sortDirection: string;
  setSortDirection: Dispatch<SetStateAction<string>>;
  filter: string;
  setFilter: Dispatch<SetStateAction<string>>;
  tagFilter: string;
  setTagFilter: Dispatch<SetStateAction<string>>;
  filterOptions: string[];
  setFilterOptions: Dispatch<SetStateAction<string[]>>;
  tags: TagData[];
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
          <MenuItem
            as={Select}
            variant="unstyled"
            borderRadius={0}
            value={tagFilter}
            onChange={(event) =>
              setTagFilter(
                (event as ChangeEvent<HTMLInputElement>).target.value,
              )
            }
          >
            <option value="">Filter by tag&hellip;</option>
            {tags.map((tag) => (
              <option key={tag.value} value={tag.value}>
                {tag.label}
              </option>
            ))}
          </MenuItem>
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
