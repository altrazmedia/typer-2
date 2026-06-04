import type { FC } from "react";

interface Props {
    header: string;
    subHeader?: string;
}

export const PageHeader: FC<Props> = ({ header, subHeader }) => {
    return (
        <div className="mb-8 flex flex-col items-center gap-2 text-center">
            <h1 className="font-heading text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
                {header}
            </h1>
            {subHeader && (
                <p className="max-w-2xl text-sm text-muted-foreground sm:text-base lg:text-lg">
                    {subHeader}
                </p>
            )}
        </div>
    );
};
