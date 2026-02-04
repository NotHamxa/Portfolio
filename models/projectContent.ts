export interface GithubRepo {
    name: string
    link: string
}

export interface ProjectType {
    title: string
    logo: string | null
    content: string
    downloadUrl: Record<string, string> | null
    githubUrl: GithubRepo[]
}