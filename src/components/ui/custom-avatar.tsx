"use client";
import { createAvatar } from "@dicebear/core";
import { notionists } from "@dicebear/collection";
import Image from "next/image";

export default function CustomAvatar({ seed = "AlphaBI" }: { seed: string }) {
  const avatar = createAvatar(notionists, {
    seed: seed,
    radius: 50,
    scale: 125,
    backgroundColor: ["ffd5dc", "ffdfbf", "b6e3f4", "c0aede", "d1d4f9"],
  }).toDataUriSync();

  return <Image src={avatar} alt="Avatar" fill={true} />;
}
