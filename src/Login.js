import React from 'react';
import { Button, Container, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    background: 'url(/Users/liavalter/Projects/SpoifySummary/spotify-summary/src/design_obj/background.svg) no-repeat center center fixed',
    backgroundSize: 'cover',
  },
  button: {
    marginTop: theme.spacing(2),
  },
}));

const Login = () => {
  const classes = useStyles();

  const handleLogin = () => {
    const clientId = 'e069322ba24d414daa79e311b6157d30';
    const redirectUri = 'http://example.org/summary';
    const scopes = ['user-library-read'];
    const authUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=token&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scopes.join('%20')}`;
    window.location = authUrl;
  };

  return (
    <Container className={classes.root}>
      <Typography variant="h3" component="h1" gutterBottom>
        Welcome to Your Spotify Dashboard
      </Typography>
      <Button
        variant="contained"
        color="primary"
        className={classes.button}
        onClick={handleLogin}
      >
        Log in with Spotify
      </Button>
    </Container>
  );
};

export default Login;
