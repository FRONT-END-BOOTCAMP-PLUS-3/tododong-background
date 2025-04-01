import cron from 'node-cron';
import { migrateScheduleToLocalUsecase } from './application/usecases/migrateScheduleToLocalUsecase.js';
import { migrateTodayGamesToLocalUsecase } from './application/usecases/migrateTodayGamesToLocalUsecase.js';
import { NbaOfficialGameRpository } from './infrastructure/repositories/nba-official/NbaOfficialGameRepository.js';
import { PrGameRepository } from './infrastructure/repositories/prisma/PrGameRepository.js';

const externalRepository = new NbaOfficialGameRpository();
const localRepository = new PrGameRepository();

// 매시간 0분마다 실행 (UTC 기준)
cron.schedule(
  '*/10 * * * * *',
  async () => {
    console.log('[NBA Today Migration] 시작: ', new Date().toISOString());

    try {
      await migrateTodayGamesToLocalUsecase(externalRepository, localRepository);
      console.log('[NBA Today Migration] 성공적으로 완료됨.');
    } catch (error) {
      console.error('[NBA Today Migration] 오류 발생:', error);
    }
  },
  {
    timezone: 'Etc/UTC',
  }
);

// 매일 자정마다 실행 (UTC 기준)
cron.schedule(
  '0 0 * * *',
  async () => {
    console.log('[NBA Season Migration] 시작: ', new Date().toISOString());

    try {
      await migrateScheduleToLocalUsecase(externalRepository, localRepository);
      console.log('[NBA Season Migration] 성공적으로 완료됨.');
    } catch (error) {
      console.error('[NBA Season Migration] 오류 발생:', error);
    }
  },
  {
    timezone: 'Etc/UTC',
  }
);

console.log('[NBA Migration] 스케줄러 실행 중...');
