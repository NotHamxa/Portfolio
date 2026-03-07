export interface GithubRepo {
    name: string
    link: string
}

export interface ProjectType {
    id: string
    title: string
    excerpt: string
    date: string
    logo: string | null
    content: string
    downloadUrl: Record<string, string> | null
    githubUrl: GithubRepo[]
}
