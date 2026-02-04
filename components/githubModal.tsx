import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ExternalLink } from "lucide-react"

interface GithubRepo {
    name: string
    link: string
}

interface GithubModalProps {
    visible: boolean
    setVisible: (visible: boolean) => void
    repos: GithubRepo[]
}

export default function GithubModal({ visible, setVisible, repos }: GithubModalProps) {
    const handleRepoClick = (link: string) => {
        window.open(link, '_blank', 'noopener,noreferrer')
        setVisible(false)
    }

    return (
        <Dialog open={visible} onOpenChange={setVisible}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Select Repository</DialogTitle>
                </DialogHeader>
                <div className="space-y-3 py-4">
                    {repos.map((repo, idx) => (
                        <Button
                            key={idx}
                            variant="outline"
                            className="w-full justify-between group"
                            onClick={() => handleRepoClick(repo.link)}
                        >
                            <span className="font-medium">{repo.name}</span>
                            <ExternalLink className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                        </Button>
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    )
}