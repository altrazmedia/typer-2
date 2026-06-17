import type { FC } from "react";

import { FinishedGameBetsToggle } from "@/features/game/components/finished-game-bets-toggle";
import { buildGameBetRows } from "@/features/game/helpers/build-game-bet-rows";
import { getGameBets } from "@/features/game/server/get-game-bets";
import type { GroupMemberRow } from "@/features/game/types";

interface Props {
    gameId: string;
    groupMembers: GroupMemberRow[];
    currentUserId: string;
}

export const FinishedGameBetsSection: FC<Props> = async ({
    gameId,
    groupMembers,
    currentUserId,
}) => {
    const bets = await getGameBets(gameId);
    const rows = buildGameBetRows(groupMembers, bets, currentUserId);

    return <FinishedGameBetsToggle rows={rows} />;
};
