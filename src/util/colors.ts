import { murmur3 } from "murmurhash-js";

const seed = 42;

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

const shades = [100, 200, 300];

export function randomColor(text: string) {
  const hash = hashCode(text);
  return colors[hash % colors.length];
}

export function randomCourseColor(number: string) {
  const match = number.match(/^[a-zA-Z]+/);
  const str = match ? match[0] : "";
  const hash = hashCode(str);
  const color = colors[hash % colors.length];
  const shade = shades[hash % shades.length];
  const lightShade = shade > 100 ? shade - 100 : 50;
  return [`${color}.${shade}`, `${color}.${lightShade}`];
}

function hashCode(text: string) {
  return murmur3(text, seed);
}
