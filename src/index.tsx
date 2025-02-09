import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import reportWebVitals from './reportWebVitals';
import { HashRouter as Router, Routes, Route, Outlet } from 'react-router-dom';

import About from './pages/about/About';
import Header from './components/Layout/Header/Header';
import Footer from './components/Layout/Footer/Footer';

import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';

import PostPage from './components/Post/PostPage';
import PostList from './components/Post/PostList';

// Ant Design CSS 임포트
// import 'antd/dist/antd.css';  // Ant Design 스타일 임포트

const customTheme = createTheme({
  typography: {
    fontFamily: "'DOSGothic', sans-serif",
  },
  palette: {
    background: { default: "#ffffff" },
    primary: { main: "#cccccc" },
    text: { primary: "#000000" },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        colorInherit: {
          backgroundColor: "#121212",
          color: "#64B5F6",
          boxShadow: "none",
          borderBottom: "1px solid #424242",
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        root: {
          fontSize: "1.5rem", // AppBar 내부 Typography 글씨 크기 키우기
        },
      },
    },
  },
});

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);


const PageLayout = () => {
  return (
    <div style={{ margin: "12px" }}>
      <Outlet />
    </div>
  );
};

root.render(
  <React.StrictMode>
    <ThemeProvider theme={customTheme}>
      <CssBaseline />
      <Router>
        <Header />

        <Routes>
          <Route element={<PageLayout />}>
            <Route path="/" element={<PostList/>} />
            <Route path="/about" element={<About />} />
            <Route path="/posts/:slug" element={<PostPage />} />
          </Route>
        </Routes>

        <Footer />
      </Router>
    </ThemeProvider>
  </React.StrictMode>
);

// 웹 성능 측정
reportWebVitals();
