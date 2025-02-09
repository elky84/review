import React, { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { PostData, PostListProps } from './types';
import { Tag } from "antd";

const Card = styled.div`
  background-color:rgb(213, 226, 235);
  color: #ffffff;
  border-radius: 10px;
  overflow: hidden;
  margin-right: 20px;
  margin-top: 20px;
  padding: 20px;
  display: block;
  text-decoration: none;
`;

const CardContent = styled.div`
  padding: 15px;
`;

const Title = styled(Link)`
  font-size: 24px;
  color:rgb(12, 33, 88);
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

interface StyledTagProps {
  checked: boolean;
}

const StyledTag = styled(Tag.CheckableTag)<StyledTagProps>`
  background-color: ${({ checked }) => (checked ? '#4d7bf3' : '#e0e0e0')};
  color: ${({ checked }) => (checked ? 'white' : '#333')};
  padding: 5px 10px;
  margin: 5px;
  border-radius: 5px;
  cursor: pointer;
  border: none;
`;

const SearchInput = styled.input`
  padding: 10px;
  margin: 20px;
  width: 100%;
  max-width: 400px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 5px;
`;

const PostList: React.FC<PostListProps> = () => {
  const [postsData, setPostsData] = useState<PostData[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedYears, setSelectedYears] = useState<string[]>([]);
  const [years, setYears] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isExpanded, setIsExpanded] = useState(false);

  const allTags = Array.from(new Set(postsData.flatMap(post => post.tags)));
  
  const updateQueryParams = useCallback(() => {
    const queryParams = new URLSearchParams();
    selectedTags.forEach(t => queryParams.append('tags', t));
    selectedYears.forEach(y => queryParams.append('years', y));
    const queryString = queryParams.toString();
    window.history.replaceState({}, '', queryString ? `?${queryString}` : window.location.pathname);
  }, [selectedTags, selectedYears]);
  
  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);

    const urlTags = queryParams.getAll("tags");
    const urlYears = queryParams.getAll("years");

    if (urlTags.length > 0) setSelectedTags(urlTags);
    if (urlYears.length > 0) setSelectedYears(urlYears);

    fetch(process.env.PUBLIC_URL + '/postsData.json')
      .then(response => response.json())
      .then((data: PostData[]) => {
        const sortedData = data.sort((a: PostData, b: PostData) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setPostsData(sortedData);
      })
      .catch(error => console.error('Error fetching posts data:', error));
  }, []);

  useEffect(() => {
    updateQueryParams();
  }, [selectedYears, selectedTags, updateQueryParams]);

  useEffect(() => {
    const yearsSet = new Set(postsData.map(post => post.date.slice(0, 4)));
    setYears(Array.from(yearsSet));
  }, [postsData]);

  const handleClick = (slug: string) => {
    fetch(`/posts/${slug}.md`)
      .then(response => response.text())
      .then(markdown => {
        console.log(markdown);
      })
      .catch(error => console.error('Error fetching markdown file:', error));
  };

  const handleTagClick = (tag: string) => {
    const updatedTags = selectedTags.includes(tag)
      ? selectedTags.filter(t => t !== tag)
      : [...selectedTags, tag];
    setSelectedTags(updatedTags);
  };

  const handleYearToggle = (year: string) => {
    const updatedYears = selectedYears.includes(year)
      ? selectedYears.filter(y => y !== year)
      : [...selectedYears, year];
    setSelectedYears(updatedYears);
  };

  const filteredPosts = postsData.filter(post => {
    const title = post.title || ''; // title이 undefined일 경우 빈 문자열로 대체
    const summary = post.summary || ''; // summary가 undefined일 경우 빈 문자열로 대체
  
    const matchesTag = selectedTags.every(tag => post.tags.includes(tag));
    const matchesYear = selectedYears.length === 0 || selectedYears.includes(post.date.slice(0, 4));

    // 검색어를 '|'로 나눈 후 각각을 조건으로 검사
    const searchTerms = searchQuery.split('|').map(term => term.trim().toLowerCase());
    const matchesSearch = searchTerms.every(term => 
      title.toString().toLowerCase().includes(term) || summary.toString().toLowerCase().includes(term)
    );
  
    return matchesTag && matchesYear && matchesSearch;
  });
  

  return (
    <>
      <SearchInput
        type="text"
        placeholder="Search posts..."
        value={searchQuery}
        onChange={e => setSearchQuery(e.target.value)} // 검색 상태 업데이트
      />
      <div>
        <button onClick={() => setIsExpanded(!isExpanded)}>
          {isExpanded ? "Tag 접기" : "Tag 펼치기"}
        </button>

        {isExpanded && (
          <>
            <TagsContainer>
              {years.map((year) => (
                <StyledTag
                  checked={selectedYears.includes(year)}
                  key={year}
                  onClick={() => handleYearToggle(year)}
                >
                  {year}
                </StyledTag>
              ))}
            </TagsContainer>

            <TagsContainer>
              {allTags.map((tag) => (
                <StyledTag
                  key={tag}
                  checked={selectedTags.includes(tag)}
                  onClick={() => handleTagClick(tag)}
                >
                  {tag}
                </StyledTag>
              ))}
            </TagsContainer>
          </>
        )}
      </div>
      {filteredPosts.length > 0 ? (
        filteredPosts.map(post => (
          <Card key={post.slug}>
            <CardContent>
              <Title to={`/posts/${encodeURIComponent(post.slug)}`} onClick={() => handleClick(post.slug)}>
                {post.title} - {post.date}
              </Title>
              <p>{post.summary}</p>
              <TagsContainer>
                {post.tags.map(tag => (
                  <StyledTag
                    key={tag}
                    checked={selectedTags.includes(tag)}
                    onClick={() => handleTagClick(tag)}
                  >
                    {tag}
                  </StyledTag>
                ))}
              </TagsContainer>
            </CardContent>
          </Card>
        ))
      ) : (
        <p>No posts match the selected.</p>
      )}
    </>
  );
};

export default PostList;
