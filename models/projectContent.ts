export type ProjectType = {
    title: string;
    logo: string | null;
    content: string;
    downloadUrl: {
        [key: string]: string;
    } | null;
    githubUrl:string | null;
};