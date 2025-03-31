import { Game } from '@prisma/client';

export interface GameRepository {
  saveGames: (games: Game[]) => Promise<void>;
  updateTodayGames: (games: Game[]) => Promise<void>;
}
