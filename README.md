# @karcass/migration-commands

<a href="https://github.com/karcass-ts/cli-service">CliService</a> commands for creation, doing and undoing TypeORM migrations.
This commands included by default in <a href="https://github.com/karcass-ts/karcass">karcass</a>.

## Installation

```
npm install @karcass/migration-commands
```

## Usage

index.ts:

```typescript
import { CliService } from '@karcass/cli-service'
import { createConnection } from 'typeorm'
import { CreateMigrationCommand, MigrateCommand, MigrateUndoCommand } from '@karcass/migration-commands'

const cliService = new CliService()
const connection = await createConnection({
    type: 'sqlite',
    database: 'test/test.sqlite',
})
cliService.add(CreateMigrationCommand, () => new CreateMigrationCommand())
cliService.add(MigrateCommand, () => new MigrateCommand(connection))
cliService.add(MigrateUndoCommand, () => new MigrateUndoCommand(connection))

await cliService.run()
```

Output:

```
=== Available commands: ===
  --help                           Show this help
  migrations:generate <path/name>  Create migration with name from argument, e.g. migrations:generate MyBundle/Migrations/MyMigrationName
  migrations:migrate               Doing migrations
  migrations:migrate:undo          Reverts last migration
```

So running `ts-node index.ts migrations:generate test/MyMigration` will create a file with name like `test/1577032764-MyMigration.ts` and contents like:

```typescript
import { MigrationInterface, QueryRunner } from 'typeorm'

export default class MyMigration1577032764233 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<any> {}

    public async down(queryRunner: QueryRunner): Promise<any> {}
}
```

Command `ts-node index.ts migrations:migrate` will apply all non-applied migrations.

Command `ts-noed index.ts migrations:migrate:undo` reverts one last migrated migration.

More about migrations in TypeORM you can read <a href="https://github.com/typeorm/typeorm/blob/master/docs/migrations.md">here</a>.
