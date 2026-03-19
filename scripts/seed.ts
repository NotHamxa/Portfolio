/**
 * Seed script — writes all default projects to MongoDB.
 * Run after adding MONGODB_URI to your .env.local:
 *
 *   pnpm seed
 */

import { MongoClient } from 'mongodb'
import { seedProjects } from '../lib/db'

async function main() {
    const uri = process.env.MONGODB_URI
    if (!uri) {
        console.error('Error: MONGODB_URI is not set. Add it to your .env.local and run again.')
        process.exit(1)
    }

    console.log('Connecting to MongoDB...')
    const client = new MongoClient(uri)
    await client.connect()

    const col = client.db('Portfolio').collection('projects')

    const existing = await col.countDocuments()
    if (existing > 0) {
        console.log(`Collection already has ${existing} document(s).`)
        const answer = process.argv.includes('--force')
        if (!answer) {
            console.log('Pass --force to overwrite. Exiting.')
            await client.close()
            return
        }
        console.log('--force passed, overwriting...')
        await col.deleteMany({})
    }

    await col.insertMany(seedProjects as Record<string, unknown>[])
    console.log(`Seeded ${seedProjects.length} projects into portfolio.projects`)

    await client.close()
}

main().catch(err => {
    console.error(err)
    process.exit(1)
})
