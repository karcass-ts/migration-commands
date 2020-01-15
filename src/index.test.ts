import { CreateMigrationCommand, MigrateCommand, MigrateUndoCommand } from './'
import { Cli } from '@karcass/cli'
import { createConnection, Connection, QueryRunner, Table } from 'typeorm'
import assert from 'assert'
import { execSync } from 'child_process'
import fs from 'fs'

const cli = new Cli()
let connection!: Connection

execSync('rm -Rf ./test')

it('Must initialize with no errors', async () => {
    connection = await createConnection({
        type: 'sqlite',
        database: 'test/test.sqlite',
    })
    if (!connection) {
        assert.fail('sqlite connection is not established')
    }
    cli.add(CreateMigrationCommand, () => new CreateMigrationCommand())
    cli.add(MigrateCommand, () => new MigrateCommand(connection))
    cli.add(MigrateUndoCommand, () => new MigrateUndoCommand(connection))
    cli.run()
})
it('Must create migration, and it must be valid', async function() {
    process.argv[2] = 'migrations:generate'
    process.argv[3] = 'test/testingname'
    await cli.run()
    const file = fs.readdirSync('test').find(d => d.indexOf('testingname'))
    if (!file) {
        return assert.fail('Migration not generated')
    }
    this.timeout(10000)
    execSync('node_modules/.bin/tsc test/' + file)
})
it('Must apply two migrations', async () => {
    const migrations = {
        ['Migration' + Date.now()]: class {
            public async up(queryRunner: QueryRunner): Promise<any> {
                await queryRunner.createTable(new Table({ name: 'table1', columns: [{ name: 'col1', type: 'integer' }] }))
            }
            public async down(queryRunner: QueryRunner): Promise<any> {
                await queryRunner.dropTable('table1')
            }
        },
        ['Migration' + (Date.now() + 100)]: class {
            public async up(queryRunner: QueryRunner): Promise<any> {
                await queryRunner.createTable(new Table({ name: 'table2', columns: [{ name: 'col1', type: 'integer' }] }))
            }
            public async down(queryRunner: QueryRunner): Promise<any> {
                await queryRunner.dropTable('table2')
            }
        },
    }
    connection.migrations.push(...Object.values(migrations).map(constructor => new constructor()))
    process.argv[2] = 'migrations:migrate'
    await cli.run()
    if (!await connection.query('SELECT COUNT(*) from table1')) {
        assert.fail('table1 was not created')
    }
    if (!await connection.query('SELECT COUNT(*) from table2')) {
        assert.fail('table2 was not created')
    }
})
it('Must revert one migration', async () => {
    process.argv[2] = 'migrations:migrate:undo'
    await cli.run()
    try {
        await connection.query('SELECT COUNT(*) from table2')
    } catch (err) {
        if (err.message.indexOf('table2')) {
            return
        }
    }
    assert.fail('table2 was not dropped')
})
