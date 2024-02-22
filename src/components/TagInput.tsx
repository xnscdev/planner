import {
  FormControl,
  FormHelperText,
  FormLabel,
  Input,
  Tag,
  TagCloseButton,
  TagLabel,
  Wrap,
  WrapItem,
} from "@chakra-ui/react";
import React, { Dispatch, SetStateAction, useState } from "react";
import { randomColor } from "../util/colors.ts";

export default function TagInput({
  tags,
  setTags,
}: {
  tags: string[];
  setTags: Dispatch<SetStateAction<string[]>>;
}) {
  const [text, setText] = useState("");

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" || event.key === " ") {
      addTag();
      event.preventDefault();
    }
  }

  function onBlur(event: React.FocusEvent<HTMLInputElement>) {
    addTag();
    event.preventDefault();
  }

  function addTag() {
    const name = text.trim();
    if (!name) {
      return;
    }

    setTags((tags) => (tags.includes(name) ? tags : [...tags, name]));
    setText("");
  }

  function removeTag(tag: string) {
    setTags((tags) => tags.filter((t) => t !== tag));
  }

  return (
    <FormControl>
      <FormLabel htmlFor="tags">Tags</FormLabel>
      <Input
        id="tags"
        type="text"
        value={text}
        onChange={(event) => setText(event.target.value)}
        onKeyDown={onKeyDown}
        onBlur={onBlur}
      />
      <FormHelperText>
        <Wrap>
          {tags.map((tag) => (
            <WrapItem key={tag}>
              <Tag boxShadow="base" colorScheme={randomColor(tag)}>
                <TagLabel>{tag}</TagLabel>
                <TagCloseButton onClick={() => removeTag(tag)} />
              </Tag>
            </WrapItem>
          ))}
        </Wrap>
      </FormHelperText>
    </FormControl>
  );
}
