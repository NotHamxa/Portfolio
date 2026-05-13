import { MongoClient, Collection } from 'mongodb'
import { unstable_cache, revalidateTag, revalidatePath } from 'next/cache'
import { ProjectType } from '@/models/projectContent'

// --- MongoDB client singleton ---
const globalWithMongo = global as typeof global & { _mongoClient?: MongoClient }

async function getCollection(): Promise<Collection | null> {
    const uri = process.env.MONGODB_URI
    if (!uri) return null

    if (!globalWithMongo._mongoClient) {
        globalWithMongo._mongoClient = new MongoClient(uri)
        await globalWithMongo._mongoClient.connect()
    }

    return globalWithMongo._mongoClient.db('Portfolio').collection('projects')
}

// --- Seed data ---
export const seedProjects: ProjectType[] = [
    {
        id: 'volt',
        title: 'Volt',
        excerpt: 'A fast, modern Windows search app that finds files, apps, and web results in one place.',
        date: 'May 2025',
        logo: '/images/volt/logo.png',
        content: `<text>
Volt is a Windows search tool built with React, TypeScript, and Electron.
Quickly find files, apps, and folders, or search the web using bangs (like !gpt or !yt).
</text>

<imgText position="left" src="/images/volt/img1.png">
Pin your most-used links and apps for quick access. Everything you need is just a keystroke away.
</imgText>

<heading>
Web Search
</heading>

<text>
Press Tab to switch between searching your computer and searching the web. Pretty handy.
</text>

<imgText position="right" src="/images/volt/img2.png">
Google suggestions are built in, so you get that familiar autocomplete experience. Works just like you'd expect.
</imgText>

<imgText position="left" src="/images/volt/img3.png">
Use bang commands (!gpt, !g, !yt) to jump straight to ChatGPT, Google, YouTube, etc. Saves time when switching between sites.
</imgText>

<text>
Search history is saved locally, so you can quickly pull up previous searches.
</text>

<heading>
File Search
</heading>

<imgText position="right" src="/images/volt/img4.png">
Add folders to index and Volt will scan them for lightning-fast file searches. No more waiting for Windows Search to catch up - results appear instantly as you type. Works great for project folders, downloads, or anywhere you keep important files.
</imgText>`,
        downloadUrl: {
            windows: 'https://github.com/NotHamxa/Volt/releases/download/v1.1.1/Volt-Setup-1.1.1.exe',
        },
        githubUrl: [{ name: 'Main Repository', link: 'https://github.com/NotHamxa/volt' }],
        show: true,
    },
    {
        id: 'epsilon',
        title: 'Epsilon',
        excerpt: 'The entire tech stack built for the team registrations of epsilon (Alpha College Science Olympiad)',
        date: 'Oct 2024 - Feb 2025',
        logo: '/images/epsilon/logo.png',
        content: `<img>/images/epsilon/epsilonModel.png</img>

<heading>
Backend - Python FastAPI
</heading>

<imgText position="left" src="/images/epsilon/img1.png">
The backend is built with Python and FastAPI. Handles all request processing,
data management, and coordinates between different parts of the system.
Focused on keeping response times fast and making sure everything communicates properly.
</imgText>

<heading>
Frontend - React TS
</heading>

<imgText position="right" src="/images/epsilon/img2.png">
The frontend uses React with TypeScript. Clean, minimal design that's not cluttered.
Responsive across devices, and user data gets saved to the cloud so everything syncs
wherever you log in.
</imgText>

<heading>
Admin Panel - React Electron TS
</heading>

<imgText position="left" src="/images/epsilon/img3.png">
The admin panel is a desktop app built with Electron. Admins can manage registrations,
handle user queries, and coordinate with brand ambassadors all in one place.
Auto-generates ID cards and has a fast QR-based attendance scanner for events.
</imgText>`,
        downloadUrl: null,
        githubUrl: [
            { name: 'Epsilon Frontend', link: 'https://github.com/NotHamxa/EpsilonFrontendReact' },
            { name: 'Epsilon Admin Panel(Desktop)', link: 'https://github.com/NotHamxa/EpsilonAdminPanelElectron' },
            { name: 'Epsilon Admin Panel(Mobile)', link: 'https://github.com/NotHamxa/EpsilonAdminPanelMobile' },
        ],
        show: true,
    },
    {
        id: 'eaf',
        title: 'EAF',
        excerpt: 'An assessment platform where admins can create quizzes using rules.',
        date: 'Dec 2025 - Jan 2026',
        logo: null,
        content: `<text>
EAF is an assessment platform where admins can create quizzes using rules.
Rules define the structure of the quiz — what aspects are being tested, how questions
are scored, and what the final result means.
</text>

<heading>
Rule Builder
</heading>

<imgText position="left" src="/images/eaf/img1.png">
Rules are basically the blueprint for a quiz. You define aspects like Conscientiousness
or Grammar, set which questions fall under each aspect, configure the scoring options,
and set thresholds for what counts as a Pass or Outstanding. Once a rule is set up,
it handles all the grading automatically.
</imgText>

<heading>
Quiz Construction
</heading>

<imgText position="right" src="/images/eaf/img2.png">
Quizzes are built on top of rules. Add questions, write the answer options, and assign
point values to each one. The scoring ties back to the rule so everything stays consistent
across attempts.
</imgText>

<heading>
Timed Quiz Experience
</heading>

<imgText position="left" src="/images/eaf/img3.png">
Candidates take the quiz through a clean timed interface. Supports multiple question types
including drag-to-rank. If the tab gets closed mid-attempt, the quiz auto-resumes from
where they left off so the timer keeps running.
</imgText>

<heading>
Responses & Reports
</heading>

<text>
All submissions are logged with the candidate's details, timestamps, and completion status.
Each response has a full answer transcript and a detailed report that breaks down scores
per aspect and shows how they performed against the rule thresholds.
</text>`,
        downloadUrl: null,
        githubUrl: [],
        show: true,
    },
    {
        id: 'cat',
        title: 'CAT',
        excerpt: 'A discord bot that tracks voice channel activity, rewards users with points, and creates leaderboards for the most engaged members',
        date: 'Jan - Aug 2024',
        logo: '/images/cat/logo.png',
        content: `<text>
Cat is a Discord bot that tracks voice channel activity and rewards active members.
Logs time spent in VC, awards points, and runs leaderboards.
</text>

<imgText position="left" src="/images/cat/img1.png">
Shows everyone how much time they've spent in voice channels. Adds some friendly competition and keeps people engaged.
</imgText>

<heading>
Leaderboards
</heading>

<text>
The bot automatically ranks members by voice channel time. Simple way to recognize the most active people in your server.
</text>

<imgText position="right" src="/images/cat/img2.png">
Members earn points for every hour in VC, which they can spend in a custom shop. Basically turns participation into rewards.
</imgText>

<imgText position="left" src="/images/cat/img3.png">
The shop has stuff like private voice channels, special playtime access, and other perks you can customize. Makes it easy to keep your community active.
</imgText>`,
        downloadUrl: null,
        githubUrl: [{ name: 'Discord Bot', link: 'https://github.com/NotHamxa/RDLN_Discord_Bot' }],
        show: true,
    },
    {
        id: 'expensetracker',
        title: 'ExpenseTracker',
        excerpt: 'A mobile app to track spending, manage budgets, and visualize expenses with intuitive charts and insights.',
        date: 'Oct 2025',
        logo: null,
        content: `<text>
Expense Tracker is a mobile app for managing personal finances. Track spending, set budgets, and see where your money's going.
</text>

<imgText position="left" src="/images/expenseTracker/img1.png">
Categorize expenses, check spending trends, and keep everything organized in one place. Makes it easier to see spending patterns.
</imgText>

<heading>
Smart Budgeting
</heading>

<text>
Set monthly budgets for different categories and get alerts when you're getting close to your limit. Helps stay on track without overthinking it.
</text>

<imgText position="right" src="/images/expenseTracker/img2.png">
Charts and graphs make it clear where your money's going. Add expenses quickly, snap photos of receipts, and everything syncs across devices.
</imgText>

<imgText position="left" src="/images/expenseTracker/img3.png">
The app generates reports showing where you could save money and helps identify spending patterns. Also suggests ways to hit financial goals based on your habits.
</imgText>`,
        downloadUrl: null,
        githubUrl: [],
        show: true,
    },
]

function toProject(doc: Record<string, unknown>): ProjectType {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { _id, ...rest } = doc
    return rest as ProjectType
}

// --- Cached read path ---
async function fetchProjectsFromDb(): Promise<ProjectType[]> {
    const col = await getCollection()
    if (!col) return seedProjects

    const docs = await col.find({}).toArray()
    if (docs.length === 0) {
        await col.insertMany(seedProjects as Record<string, unknown>[])
        return seedProjects
    }
    return docs.map(toProject)
}

const getCachedProjects = unstable_cache(
    fetchProjectsFromDb,
    ['projects-list'],
    { tags: ['projects'], revalidate: 3600 }
)

function invalidateProjects() {
    revalidateTag('projects', 'default')
    revalidatePath('/')
    revalidatePath('/project/[slug]', 'page')
}

export async function getProjects({ fresh = false }: { fresh?: boolean } = {}): Promise<ProjectType[]> {
    return fresh ? fetchProjectsFromDb() : getCachedProjects()
}

export async function getProject(slug: string, opts?: { fresh?: boolean }): Promise<ProjectType | null> {
    const projects = await getProjects(opts)
    return projects.find(p => p.id === slug || p.title.toLowerCase() === slug) ?? null
}

export async function createProject(data: Omit<ProjectType, 'id'>): Promise<ProjectType> {
    const col = await getCollection()
    if (!col) throw new Error('MongoDB not configured')

    const id = data.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    const project: ProjectType = { show: true, ...data, id }
    await col.insertOne(project as Record<string, unknown>)
    invalidateProjects()
    return project
}

export async function updateProject(id: string, updates: Partial<Omit<ProjectType, 'id'>>): Promise<ProjectType | null> {
    const col = await getCollection()
    if (!col) throw new Error('MongoDB not configured')

    const existing = await col.findOne({ id })
    if (!existing) return null

    const updated = { ...toProject(existing), ...updates }
    await col.replaceOne({ id }, updated as Record<string, unknown>)
    invalidateProjects()
    return updated
}

export async function deleteProject(id: string): Promise<boolean> {
    const col = await getCollection()
    if (!col) throw new Error('MongoDB not configured')

    const result = await col.deleteOne({ id })
    if (result.deletedCount === 0) return false
    invalidateProjects()
    return true
}

export async function saveProjects(projects: ProjectType[]): Promise<void> {
    const col = await getCollection()
    if (!col) throw new Error('MongoDB not configured')

    await col.deleteMany({})
    if (projects.length > 0) {
        await col.insertMany(projects as Record<string, unknown>[])
    }
    invalidateProjects()
}

export async function reorderProjects(ids: string[]): Promise<void> {
    const projects = await fetchProjectsFromDb()
    const map = new Map(projects.map(p => [p.id, p]))
    const reordered = ids.map(id => map.get(id)).filter(Boolean) as ProjectType[]
    await saveProjects(reordered)
}
