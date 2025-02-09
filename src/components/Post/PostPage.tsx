import React from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import yaml from 'js-yaml';
import rehypeRaw from 'rehype-raw'; // Import rehype-raw
import { PostMetadata } from './types';

const PostPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const [metadata, setMetadata] = React.useState<PostMetadata>({
    title: '',
    summary: '',
    tags: [],
    slug: slug ?? '',
    date: '',
    year: ''
  });

  const [markdownContent, setMarkdownContent] = React.useState<string>('');

  React.useEffect(() => {
    const parseMetadata = (markdown: string): PostMetadata => {
      const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---/;
      const match = markdown.match(frontmatterRegex);
      if (match) {
        const metadataString = match[1];
        try {
          const metadata: Partial<PostMetadata> = yaml.load(metadataString) as Partial<PostMetadata>;
          if (typeof metadata.tags === 'string') {
            metadata.tags = [metadata.tags];
          } else if (!Array.isArray(metadata.tags)) {
            metadata.tags = [];
          }

          if (metadata.date) {
            const date = new Date(metadata.date);
            const formattedDate = date.toISOString().split('T')[0];
            metadata.date = formattedDate;

            const year = metadata.date.slice(0, 4);
            metadata.year = year;        
          }

          return {
            title: metadata.title || '',
            summary: metadata.summary || '',
            tags: metadata.tags || [],
            slug: slug || '',
            date: metadata.date || '',
            year: metadata.year || ''
          };
        } catch (error) {
          console.error('Error parsing metadata:', error);
        }
      }
    
      return { title: '', summary: '', year: '', tags: [], slug: '', date: '' };
    };

    const removeMetadata = (markdown: string): string => {
      const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n?/;
      const content = markdown.replace(frontmatterRegex, '').trim();
      return content;
    };

    const replaceYouTubeLinks = (markdown: string): string => {
      const youtubeLinkRegex = /\[.*?\]\((https:\/\/www\.youtube\.com\/watch\?v=([a-zA-Z0-9_-]+))\)|^(https:\/\/www\.youtube\.com\/watch\?v=([a-zA-Z0-9_-]+))$/gm;
    
      return markdown.replace(youtubeLinkRegex, (match, _, markdownVideoId, standaloneVideoLink, standaloneVideoId) => {
        const videoId = markdownVideoId || standaloneVideoId;
        return `<iframe width="1024" height="576" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe>\n`;
      });
    };
    
    const fetchMarkdown = async (): Promise<{ metadata: PostMetadata; markdownContent: string }> => {
      try {
        const response = await fetch(process.env.PUBLIC_URL + `/posts/${slug}.md`);
        if (!response.ok) {
          throw new Error('Failed to fetch markdown file');
        }
        const markdown = await response.text();

        const metadata: PostMetadata = parseMetadata(markdown);
        let markdownContent = removeMetadata(markdown);
        markdownContent = replaceYouTubeLinks(markdownContent);

        return { metadata, markdownContent };
      } catch (error) {
        console.error('Error fetching markdown:', error);
        return { metadata: { title: '', summary: '', year: '', tags: [], slug: slug ?? '', date: '' }, markdownContent: '' };
      }
    };

    fetchMarkdown().then(({ metadata, markdownContent }) => {
      setMetadata(metadata);
      setMarkdownContent(markdownContent);
    });

    const searchParams = new URLSearchParams(location.search);
    const tagsFromParams = searchParams.getAll('tags');
    setMetadata(prevMetadata => ({
      ...prevMetadata,
      tags: tagsFromParams
    }));
  }, [slug, location.search]);

  const onClickTag = (tag: string) => {
    const searchParams = new URLSearchParams(location.search);
    searchParams.set('tags', tag);

    navigate({ pathname: '/', search: searchParams.toString() });
  };
  
  const onClickYear = (year: string) => {
    const searchParams = new URLSearchParams(location.search);
    searchParams.set('years', year);

    navigate({ pathname: '/', search: searchParams.toString() });
  };

  return (
    <div>
      <h1>{metadata.title}</h1>
      <p>{metadata.summary}</p>
      <p>
        Tags: {metadata.tags.map(tag => (
          <button
            key={tag}
            onClick={() => onClickTag(tag)}
            style={{ fontWeight: metadata.tags.includes(tag) ? 'bold' : 'normal' }}
          >
            {tag}
          </button>
        ))}
      </p>
      { metadata.date && <p>Date: {metadata.date}</p> }
      { metadata.year &&           
        <p>Year: 
          <button
            key={metadata.year}
            onClick={() => onClickYear(metadata.year)}
          >
            {metadata.year}
          </button>
        </p>
      }
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
        {markdownContent}
      </ReactMarkdown>
    </div>
  );
};

export default PostPage;
