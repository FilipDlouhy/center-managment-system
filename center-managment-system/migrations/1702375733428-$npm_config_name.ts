import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCenterAndFront1702375733428 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create 'user' table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS user (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        password VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        admin BOOLEAN NOT NULL
      );
    `);

    // Create 'front' table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS front (
        id INT AUTO_INCREMENT PRIMARY KEY,
        maxTasks INT NOT NULL,
        taskTotal INT NOT NULL,
        timeToCompleteAllTasks INT NOT NULL
      );
    `);

    // Create 'center' table
    // Create 'center' table
    await queryRunner.query(`
  CREATE TABLE IF NOT EXISTS center (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    frontId INT,
    CONSTRAINT FK_Center_FrontId FOREIGN KEY (frontId) REFERENCES front(id)
  );
`);

    // Create 'task' table
    await queryRunner.query(`
  CREATE TABLE IF NOT EXISTS task (
    id INT AUTO_INCREMENT PRIMARY KEY,
    description VARCHAR(255) NOT NULL,
    status VARCHAR(255) NOT NULL,
    createdAt TIMESTAMP NOT NULL,
    whenAddedToTheFront TIMESTAMP NULL,
    processedAt INT NOT NULL,
    userId INT,
    frontId INT,
    CONSTRAINT FK_Task_UserId FOREIGN KEY (userId) REFERENCES user(id),
    CONSTRAINT FK_Task_FrontId FOREIGN KEY (frontId) REFERENCES front(id)
  );
`);

    // Insert user records
    const passwordHash =
      '$2a$10$QTnB3EzLUzVnLZs5CEm9..TpCWcylwU3Kp1mWDUI.SFv5Azm7AcC6';
    await queryRunner.query(`
      INSERT INTO user (name, password, email, admin) VALUES 
      ('Admin User', '${passwordHash}', 'admin@example.com', true),
      ('Regular User', '${passwordHash}', 'user@example.com', false);
    `);

    // Insert front record
    await queryRunner.query(`
      INSERT INTO front (maxTasks, taskTotal, timeToCompleteAllTasks)
      VALUES (10, 0, 0);
    `);

    // Retrieve the last inserted ID for front
    const frontIdResult = await queryRunner.query(
      `SELECT LAST_INSERT_ID() as id;`,
    );
    const frontId = frontIdResult[0].id;

    // Insert center record linked to the front record
    await queryRunner.query(`
      INSERT INTO center (name, frontId)
      VALUES ('Main Center', ${frontId});
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Implement the down method to reverse the migration if needed
  }
}
