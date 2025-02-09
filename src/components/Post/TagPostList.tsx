import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { PostData } from './types';
import { Tag } from "antd";

const Card = styled.div`
  background-color: #1f1f1f;
  color: #ffffff;
  border-radius: 10px;
  overflow: hidden;
  margin-right: 20px;
  margin-bottom: 20px;
  padding: 20px;
  display: block;
  text-decoration: none;
`;

const CardContent = styled.div`
  padding: 15px;
`;

const Title = styled(Link)`
  font-size: 24px;
  color: #4d7bf3;
  text-decoration: none;

  &:hover {
    color: #82a4f8;
  }
`;

const TagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  margin-top: 10px;
`;

const TagPostList: React.FC = () => {
  const [postsData, setPostsData] = useState<PostData[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  useEffect(() => {
    fetch('/postsData.json')
      .then(response => response.json())
      .then(data => setPostsData(data))
      .catch(error => console.error('Error fetching posts data:', error));
  }, []);

  // Extract all unique tags from postsData
  const allTags = Array.from(new Set(postsData.flatMap(post => post.tags)));

  const handleClick = (slug: string) => {
    // Fetch Markdown content based on the slug
    fetch(`/posts/${slug}.md`)
      .then(response => response.text())
      .then(markdown => {
        // Replace this with logic to display markdown content
        console.log(markdown);
      })
      .catch(error => console.error('Error fetching markdown file:', error));
  };

  const handleTagClick = (tag: string) => {
    // Toggle the tag in selectedTags state
    setSelectedTags(prevTags =>
      prevTags.includes(tag)
        ? prevTags.filter(t => t !== tag)
        : [...prevTags, tag]
    );

    // Update query parameter 'tags'
    const queryParams = new URLSearchParams();
    selectedTags.forEach(t => queryParams.append('tags', t));
    window.history.replaceState({}, '', `?${queryParams.toString()}`);
  };

  // Filter posts based on selected tags
  const filteredPosts = postsData.filter(post =>
    selectedTags.every(tag => post.tags.includes(tag))
  );

  return (
    <>
      {/* Display all tags */}
      <TagsContainer>
        {allTags.map(tag => (
            <Tag.CheckableTag
            key={tag}
            checked={selectedTags.includes(tag)}
            onClick={() => handleTagClick(tag)}
          >
            {tag}
          </Tag.CheckableTag>
        ))}
      </TagsContainer>

      {/* Display filtered posts */}
      {filteredPosts.map(post => (
        <Card key={post.slug}>
          <CardContent>
            <Title to={`/posts/${encodeURIComponent(post.slug)}`} onClick={() => handleClick(post.slug)}>
              {post.title} - {post.date}
            </Title>
            <p>{post.summary}</p>
            <TagsContainer>
              {post.tags.map(tag => (
                <Tag
                  key={tag}
                  className={selectedTags.includes(tag) ? 'selected' : ''}
                  onClick={() => handleTagClick(tag)}
                >
                  {tag}
                </Tag>
              ))}
            </TagsContainer>
          </CardContent>
        </Card>
      ))}
      {filteredPosts.length === 0 && (
        <p>No posts match the selected tags.</p>
      )}
    </>
  );
};

export default TagPostList;
