import { NbaGameRepository } from '../../../domain/repositories/NbaGameRepository.js';
import { Game } from '@prisma/client';

interface GameDetail {
  gameId: string;
  gameStatus: number;
  gameStatusText: string;
  gameDateTimeUTC: string;
  gameLabel: string;
  arenaName: string;
  homeTeam: {
    teamId: number;
    teamName: string;
    teamCity: string;
    teamTricode: string;
    score: number;
  };
  awayTeam: {
    teamId: number;
    teamName: string;
    teamCity: string;
    teamTricode: string;
    score: number;
  };
}

interface GameDate {
  gameDate: string;
  games: GameDetail[];
}

interface TodayGameDetail {
  gameId: string;
  gameStatus: number;
  gameTimeUTC: string;
  homeTeam: {
    teamId: number;
    score: number;
    periods: { period: number; score: number }[];
  };
  awayTeam: {
    teamId: number;
    score: number;
    periods: { period: number; score: number }[];
  };
}

interface Scoreboard {
  scoreboard: {
    gameDate: string;
    games: TodayGameDetail[];
  };
}

interface GameDetails {
  gameId: string;
  gameTimeUTC: string;
  gameStatus: number;
  arena: { arenaName: string };
  homeTeam: {
    teamId: number;
    score: number;
    periods: { period: number; score: number }[];
  };
  awayTeam: {
    teamId: number;
    score: number;
    periods: { period: number; score: number }[];
  };
}

interface GameInfo {
  game: GameDetails;
}

const LABELS = [
  '',
  'Emirates NBA Cup',
  'SoFi Play-In Tournament',
  'East First Round',
  'West First Round',
  'East Conf. Semifinals',
  'West Conf. Semifinals',
  'East Conf. Finals',
  'West Conf. Finals',
  'NBA Finals',
];
export class NbaOfficialGameRpository implements NbaGameRepository {
  async findAll(): Promise<Game[]> {
    try {
      const url = process.env.NBA_SEASON_SCHEDULE_URL;

      if (!url) {
        throw new Error('NBA_SEASON_SCHEDULE_URL is not defined');
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.statusText}`);
      }

      const result = await response.json();

      const games: Game[] = result.leagueSchedule.gameDates.flatMap(
        (gameDate: GameDate): Game[] =>
          gameDate.games
            .filter((game: GameDetail) => {
              const hasValidLabel = LABELS.includes(game.gameLabel);

              const hasValidTeam =
                game.awayTeam.teamId !== 0 && game.homeTeam.teamId !== 0;

              return hasValidLabel && hasValidTeam;
            })
            .map((game: GameDetail) => {
              const homeTeam = game.homeTeam;
              const awayTeam = game.awayTeam;

              return {
                id: game.gameId,
                season: parseInt(result.leagueSchedule.seasonYear),
                status: game.gameStatus.toString(),
                arenaName: game.arenaName,
                awayTeamId: awayTeam.teamId.toString(),
                awayTeamPeriods: [],
                awayTeamScore: awayTeam.score,
                homeTeamId: homeTeam.teamId.toString(),
                homeTeamPeriods: [],
                homeTeamScore: homeTeam.score,
                date: '',
                startTime: game.gameDateTimeUTC,
              };
            })
      );

      return games;
    } catch (error) {
      console.error('Error in findAll:', error);
      throw new Error('Failed to fetch all games');
    }
  }

  async findTodayGame(): Promise<Game[]> {
    try {
      const url = process.env.NBA_TODAYS_SCOREBOARD_URL;

      if (!url) {
        throw new Error('NBA_TODAYS_SCOREBOARD_URL is not defined');
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.statusText}`);
      }

      const data: Scoreboard = await response.json();

      const games: Game[] = data.scoreboard.games
        .map((game: TodayGameDetail) => ({
          id: game.gameId,
          season: 0,
          status: game.gameStatus.toString(),
          arenaName: '',
          awayTeamId: game.awayTeam.teamId.toString(),
          awayTeamPeriods: game.awayTeam.periods.map((p) => p.score),
          awayTeamScore: game.awayTeam.score,
          homeTeamId: game.homeTeam.teamId.toString(),
          homeTeamPeriods: game.homeTeam.periods.map((p) => p.score),
          homeTeamScore: game.homeTeam.score,
          date: '',
          startTime: game.gameTimeUTC,
        }))
        .sort((a, b) => {
          const dateA = new Date(a.startTime);
          const dateB = new Date(b.startTime);

          return (
            dateA.getTime() - dateB.getTime() || parseInt(a.id) - parseInt(b.id)
          ); // 시간, id 오름차순 정렬
        });

      return games;
    } catch (error) {
      console.error('Error in findTodayGame:', error);
      throw new Error("Failed to fetch today's games");
    }
  }
}
