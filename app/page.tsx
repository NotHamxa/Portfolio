import HomeClient from "@/components/HomeClient"
import { getProjects } from "@/lib/db"

export const revalidate = 3600

export default async function Home() {
    const projects = await getProjects()
    return <HomeClient projects={projects.filter(p => p.show)} />
}
