import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCenterAndFront1702375733428 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const passwordHash =
      '$2a$10$QTnB3EzLUzVnLZs5CEm9..TpCWcylwU3Kp1mWDUI.SFv5Azm7AcC6';

    // Insert two User records with the specified password
    await queryRunner.query(`
      INSERT INTO user (id, name, password, email, admin) VALUES 
      (1, 'Admin User', '${passwordHash}', 'admin@example.com', true),
      (2, 'Regular User', '${passwordHash}', 'user@example.com', false);
    `);

    await queryRunner.query(`
    INSERT INTO front (maxTasks, taskTotal, timeToCompleteAllTasks)
    VALUES (10, 0, 0);
  `);

    // Retrieve the last inserted ID
    const frontIdResult = await queryRunner.query(
      `SELECT LAST_INSERT_ID() as id;`,
    );
    const frontId = frontIdResult[0].id;

    // Insert a Center record linked to the Front record
    await queryRunner.query(`
    INSERT INTO center (name, frontId)
    VALUES ('Main Center', ${frontId});
  `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Implement the down method to reverse the migration if needed
  }
}
