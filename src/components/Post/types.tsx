export interface PostData {
    title: string;
    summary: string;
    tags: string[];
    slug: string;
    date: string;
}

export interface PostListProps {
}
  
export type PostMetadata = {
    title: string;
    summary: string;
    tags: string[];
    slug: string;
    date: string;
    year: string;
};

export type Heading = {
  id: string;
  text: string;
  level: number;
};
