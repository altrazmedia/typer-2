import type { FC } from "react";

import { signOut } from "@/lib/auth";

import { Button } from "@/components/ui/button";

export const SignOutButton: FC = () => {
  return (
    <form
      action={async () => {
        "use server";
        await signOut({ redirectTo: "/login" });
      }}
    >
      <Button type="submit" variant="outline" size="sm">
        Wyloguj się
      </Button>
    </form>
  );
};
