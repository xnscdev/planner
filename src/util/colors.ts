import { murmur3 } from "murmurhash-js";
import { getSubject } from "./course.ts";

const seed = 42;

export function tagColor(text: string) {
  const colors = [
    "gray",
    "red",
    "orange",
    "yellow",
    "green",
    "teal",
    "blue",
    "cyan",
    "purple",
    "pink",
  ];
  const hash = hashCode(text);
  return colors[hash % colors.length];
}

export function courseCardColor(number: string) {
  const str = getSubject(number);
  let hash = hashCode(str);

  function random() {
    const x = Math.sin(hash++) * 10000;
    return x - Math.floor(x);
  }

  const hue = 360 * random();
  const saturation = 25 + 70 * random();
  const lightness = 85 + 10 * random();
  return [
    `hsl(${hue}, ${saturation}%, ${lightness}%)`,
    `hsl(${hue}, ${saturation}%, ${lightness + 5}%)`,
  ];
}

function hashCode(text: string) {
  return murmur3(text, seed);
}
