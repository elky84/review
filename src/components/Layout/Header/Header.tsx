
import { Link as RouterLink } from 'react-router-dom';

import { AppBar, Toolbar, Typography, Button, Container, Box } from "@mui/material";;

const Header = () => {
  return (
    <>
      <AppBar position="static" color="inherit">
        <Container maxWidth="lg">
          <Toolbar disableGutters>
            <Box sx={{ flexGrow: 1, display: "flex", alignItems: "center" }}>
              <Typography variant="h6" noWrap component="div" 
                sx={{ flexGrow: 1, color: "primary.main", fontSize: "2rem" }}>
                Review
              </Typography>
            </Box>
            {["/", "/about"].map((path, index) => (
                <Button key={index} color="inherit" component={RouterLink} to={path} 
                  sx={{ color: "primary.main", fontSize: "1.5rem" }}>
                    {["Home", "About"][index]}
                </Button>
            ))}
          </Toolbar>
        </Container>
      </AppBar>
    </>
  );
}
  
export default Header;