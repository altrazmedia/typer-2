"use client";

import type { FC } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

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
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleValueChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(searchParamKey, value);
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  return (
    <Tabs value={activeTab} onValueChange={handleValueChange}>
      <TabsList variant="line">
        {tabs.map((tab) => (
          <TabsTrigger key={tab.value} value={tab.value}>
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
};
