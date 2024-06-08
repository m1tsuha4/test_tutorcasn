import { env } from "@/env.mjs";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import * as z from "zod";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getRandomLightColor() {
  const getRandomLightValue = () => Math.floor(Math.random() * 128) + 128;
  const toHex = (value: number) => value.toString(16).padStart(2, "0");

  const r = getRandomLightValue();
  const g = getRandomLightValue();
  const b = getRandomLightValue();

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}



export const copyTextToClipboard = (
  text: string | undefined,
  callback: () => void,
) => {
  if (text) {
    navigator.clipboard.writeText(text);
  }
  callback();
};

export const isDev = env.NEXT_PUBLIC_ENV === "development";
