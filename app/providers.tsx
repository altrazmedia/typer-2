"use client";

import { SessionProvider } from "next-auth/react";
import type { FC, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

export const AuthSessionProvider: FC<Props> = ({ children }) => {
  return <SessionProvider>{children}</SessionProvider>;
};
