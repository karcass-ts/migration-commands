import { AbstractConsoleCommand } from '@karcass/cli-service'
import { Connection } from 'typeorm'

export class MigrateUndoCommand extends AbstractConsoleCommand {
    public static meta = { name: 'migrations:migrate:undo', description: 'Reverts last migration' }

    public constructor(protected connection: Connection) {
        super()
    }

    public async execute() {
        const tableName = this.connection.options.migrationsTableName ? this.connection.options.migrationsTableName : 'migrations'
        const migrations = await this.connection.query('SELECT * FROM ' + tableName)
        if (!migrations.length) {
            return console.log('There is no migrations to undo')
        }
        try {
            await this.connection.undoLastMigration()
        } catch (err) {
            return console.error(err)
        }
        console.log(`Migration ${migrations[migrations.length - 1].name} reverted`)
    }

}
