import { AbstractConsoleCommand } from '@karcass/cli-service'
import { Connection } from 'typeorm'

export class MigrateCommand extends AbstractConsoleCommand {
    public static meta = { name: 'migrations:migrate', description: 'Doing migrations' }

    public constructor(protected connection: Connection) {
        super()
    }

    public async execute() {
        let migrations: { name: string }[]
        try {
            migrations = await this.connection.runMigrations()
        } catch (err) {
            return console.error(err)
        }
        if (migrations.length) {
            for (const migration of migrations) {
                console.log(`Migration ${migration.name} applied`)
            }
        } else {
            console.log('No new migrations')
        }
    }

}
