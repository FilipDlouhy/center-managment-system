import { MigrationInterface, QueryRunner } from 'typeorm';

export class $npmConfigName1702375733428 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('UPDATE front SET maxTasks = 10');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
