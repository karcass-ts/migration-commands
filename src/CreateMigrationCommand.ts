import { AbstractConsoleCommand } from '@karcass/cli'
import fs from 'fs'
import path from 'path'
import { ConsoleColors } from '@karcass/cli/lib/AbstractConsoleCommand'

export class CreateMigrationCommand extends AbstractConsoleCommand {
    public static meta = {
        name: 'migrations:generate',
        description: 'Create migration with name from argument, e.g. migrations:generate MyBundle/Migrations/MyMigrationName',
        usage: 'migrations:generate <path/name>',
    }

    public async execute() {
        const arg = process.argv[3]
        if (!arg) {
            return this.writeLn('Argument "path/name" must be provided', ConsoleColors.FgRed)
        }
        const argParts = arg.split(path.sep)
        const fileName = argParts[argParts.length - 1]
        const stamp = Date.now()
        const timestamp = Math.round(stamp / 1000)
        const dirname = path.join(...argParts.slice(0, -1))
        this.mkdirDeep(dirname)
        const filename = path.join(dirname, `${timestamp}-${fileName}.ts`)
        let str = 'import { MigrationInterface, QueryRunner } from \'typeorm\'\n\n'
        str += `export default class ${fileName}${stamp} implements MigrationInterface {\n\n`
        str += '    public async up(queryRunner: QueryRunner): Promise<any> {}\n\n'
        str += '    public async down(queryRunner: QueryRunner): Promise<any> {}\n\n'
        str += '}\n'
        fs.writeFileSync(filename, str)

        console.log(`New migration placed into ${filename}`)
    }

    protected mkdirDeep(dir: string) {
        const parts = dir.split(path.sep)
        const cursor = []
        for (const part of parts) {
            cursor.push(part)
            const ph = path.join(...cursor)
            if (!fs.existsSync(ph)) {
                fs.mkdirSync(ph)
            }
        }
    }

}
