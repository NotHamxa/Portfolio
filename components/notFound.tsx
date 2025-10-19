"use client"

import { Button } from "@/components/ui/button";
import { Ghost } from "lucide-react";

export default function NotFound() {
    return (
        <div className="w-screen h-full overflow-hidden flex flex-col items-center justify-center text-center px-4">
            <Ghost className="w-16 h-16 text-muted-foreground mb-4" />
            <h1 className="text-3xl font-bold mb-2">404 - Page Not Found</h1>
            <p className="text-muted-foreground mb-6">
                The page you are looking for doesn't exist or has been moved.
            </p>
            <Button onClick={()=>{}}>Go to Home</Button>
        </div>
    );
}
