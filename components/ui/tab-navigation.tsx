"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import type { FC } from "react";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export interface TabNavigationItem {
    value: string;
    label: string;
}

interface Props {
    tabs: TabNavigationItem[];
    activeTab: string;
    searchParamKey?: string;
}

export const TabNavigation: FC<Props> = ({
    tabs,
    activeTab,
    searchParamKey = "tab",
}) => {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const buildHref = (tabValue: string): string => {
        const params = new URLSearchParams(searchParams.toString());
        params.set(searchParamKey, tabValue);
        const query = params.toString();
        return query ? `${pathname}?${query}` : pathname;
    };

    return (
        <Tabs value={activeTab}>
            <TabsList variant="line">
                {tabs.map((tab) => (
                    <TabsTrigger
                        key={tab.value}
                        value={tab.value}
                        render={
                            <Link href={buildHref(tab.value)} scroll={false} />
                        }
                    >
                        {tab.label}
                    </TabsTrigger>
                ))}
            </TabsList>
        </Tabs>
    );
};
