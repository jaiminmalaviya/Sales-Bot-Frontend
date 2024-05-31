"use client";

import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <h2>Something went wrong!</h2>
        <h3>{error.message}</h3>
        <Button onClick={() => reset()}>Try again</Button>
      </body>
    </html>
  );
}
