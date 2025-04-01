import { GameRepository } from '../../../domain/repositories/GameRepository.js';
import { prisma } from '../../../utils/prisma.js';
import { Game, PrismaClient } from '@prisma/client';

export class PrGameRepository implements GameRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  // 저장 또는 업데이트하는 함수
  async saveGames(games: Game[]): Promise<void> {
    try {
      const upsertGames = games.map((game) => {
        return this.prisma.game.upsert({
          where: { id: game.id },
          update: {
            season: game.season,
            status: game.status,
            arenaName: game.arenaName,
            awayTeamId: game.awayTeamId,
            awayTeamScore: game.awayTeamScore,
            homeTeamId: game.homeTeamId,
            homeTeamScore: game.homeTeamScore,
            date: game.date,
            startTime: game.startTime,
          },
          create: {
            id: game.id,
            season: game.season,
            status: game.status,
            arenaName: game.arenaName,
            awayTeamId: game.awayTeamId,
            awayTeamScore: game.awayTeamScore,
            homeTeamId: game.homeTeamId,
            homeTeamScore: game.homeTeamScore,
            date: game.date,
            startTime: game.startTime,
          },
        });
      });

      await prisma.$transaction(upsertGames);
    } catch (error) {
      console.error(error);
    } finally {
      await this.prisma.$disconnect();
    }
  }

  async updateTodayGames(games: Game[]): Promise<void> {
    try {
      const updateTodayGames = games.map((game) => {
        return this.prisma.game.update({
          where: { id: game.id },
          data: {
            status: game.status,
            awayTeamPeriods: game.awayTeamPeriods,
            awayTeamScore: game.awayTeamScore,
            homeTeamPeriods: game.homeTeamPeriods,
            homeTeamScore: game.homeTeamScore,
          },
        });
      });

      await this.prisma.$transaction(updateTodayGames);
    } catch (error) {
      console.error(error);
    } finally {
      await this.prisma.$disconnect();
    }
  }
}
