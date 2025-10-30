import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Icon } from "@iconify/react";

type PlatformLinks = {
    android?: string;
    ios?: string;
    windows?: string;
    macos?: string;
    linux?: string;
};

interface DownloadModalProps {
    visible: boolean;
    setVisible: (v: boolean) => void;
    links: PlatformLinks | null;
}

const DownloadModal = ({ visible, setVisible, links }: DownloadModalProps) => {

    if (!links)
        return <></>;

    const platforms = [
        { key: "windows", name: "Windows", icon: "mdi:windows" },
        { key: "macos", name: "macOS", icon: "mdi:apple" },
        { key: "linux", name: "Linux", icon: "mdi:linux" },
        { key: "android", name: "Android", icon: "mdi:android" },
        { key: "ios", name: "iOS", icon: "mdi:apple-ios" },
    ] as const;
    const available = platforms.filter((p) => links[p.key as keyof PlatformLinks]);

    return (
        <Dialog open={visible} onOpenChange={setVisible}>
            <DialogContent className="sm:max-w-md rounded-2xl">
                <DialogHeader>
                    <DialogTitle className="text-xl font-semibold text-center">
                        Choose your platform
                    </DialogTitle>
                </DialogHeader>

                <div className="flex flex-wrap justify-center items-center gap-6 mt-6">
                    {available.map((platform) => (
                        <div
                            key={platform.key}
                            className="flex flex-col items-center justify-center text-center gap-3 border border-border rounded-xl bg-background/70 backdrop-blur-md px-6 py-5 shadow-sm hover:shadow-md transition-all hover:scale-[1.03] w-32"
                        >
                            <Icon
                                icon={platform.icon}
                                className="w-10 h-10 text-foreground/90"
                            />
                            <span className="text-sm font-medium">{platform.name}</span>
                            <Button
                                asChild
                                size="sm"
                                variant="outline"
                                className="mt-1"
                            >
                                <a
                                    href={links[platform.key as keyof PlatformLinks]}
                                    download
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    Download
                                </a>
                            </Button>
                        </div>
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default DownloadModal;
