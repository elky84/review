import React from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import yaml from 'js-yaml';
import rehypeRaw from 'rehype-raw'; // Import rehype-raw
import { Heading, PostMetadata } from './types';
import { Outliner } from './Outliner';
import { Components } from 'react-markdown';

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

  const [headings, setHeadings] = React.useState<Heading[]>([]);

  const extractHeadings = React.useCallback((markdown: string): Heading[] => {
    const lines = markdown.split('\n');
    const headings: Heading[] = [];

    lines.forEach(line => {
      const match = /^(#{1,6})\s+(.*)/.exec(line);
      if (match) {
        const level = match[1].length;
        const text = match[2].trim();
        const id = slugify(text);
        headings.push({ id, text, level });
      }
    });

    return headings;
  }, []);

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

      const headings = extractHeadings(markdownContent);
      setHeadings(headings);
    });

    const searchParams = new URLSearchParams(location.search);

    const tagsFromParams = searchParams.getAll('tags');
      setMetadata(prevMetadata => ({
        ...prevMetadata,
        tags: tagsFromParams
      }));
    }, [slug, location.search, extractHeadings]);
    
    const onClickTag = (tag: string) => {
      const searchParams = new URLSearchParams(location.search);
      searchParams.set('tags', tag);

      navigate({ pathname: '/', search: searchParams.toString() });
    };

    const slugify = (text: string): string => {
      return text
        .toLowerCase()
        .trim()
        .replace(/[\s]+/g, '-')
        .replace(/[^\p{L}\p{N}-]+/gu, '')
    };

    const extractText = (children: React.ReactNode): string => {
      if (!children) return '';
      if (typeof children === 'string') return children;
      if (Array.isArray(children)) {
        return children.map(extractText).join('');
      }
      if (typeof children === 'object' && 'props' in children) {
        return extractText(children.props.children);
      }
      return '';
    };

  const renderers: Components = {
    h1: ({ node, ...props }) => {
      const text = extractText(props.children);
      const id = slugify(text);
      return (
        <h1 id={id} style={{ scrollMarginTop: '80px' }}>
          {props.children}
        </h1>
      );
    },
    h2: ({ node, ...props }) => {
      const text = extractText(props.children);
      const id = slugify(text);
      return (
        <h2 id={id} style={{ scrollMarginTop: '80px' }}>
          {props.children}
        </h2>
      );
    },
    h3: ({ node, ...props }) => {
      const text = extractText(props.children);
      const id = slugify(text);
      return (
        <h3 id={id} style={{ scrollMarginTop: '80px' }}>
          {props.children}
        </h3>
      );
    },
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
            style={{ fontWeight: metadata.tags.includes(tag) ? 'bold' : 'normal', margin: 4 }}
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
      <div style={{ display: 'flex' }}>
        <div style={{ flex: 1, paddingRight: '260px' }}>
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw]}
            components={renderers}
          >
            {markdownContent}
          </ReactMarkdown>
        </div>
        <Outliner headings={headings} />
      </div>
    </div>
  );
};

export default PostPage;
