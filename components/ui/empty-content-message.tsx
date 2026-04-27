import type { FC } from "react";

interface Props {
  message: string;
}

export const EmptyContentMessage: FC<Props> = ({ message }) => {
  return (
    <p className="text-center text-sm text-muted-foreground">{message}</p>
  );
};
