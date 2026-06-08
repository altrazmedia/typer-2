"use client";

import { SessionProvider } from "next-auth/react";
import { type FC, type ReactNode, Suspense } from "react";

interface Props {
    children: ReactNode;
}

export const AuthSessionProvider: FC<Props> = ({ children }) => {
    return (
        <Suspense>
            <SessionProvider>{children}</SessionProvider>
        </Suspense>
    );
};
