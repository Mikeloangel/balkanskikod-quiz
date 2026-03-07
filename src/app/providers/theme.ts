import { createTheme } from '@mui/material';

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#0f1115',
      paper: '#151923',
    },
    primary: {
      main: '#6e9bff',
    },
    secondary: {
      main: '#ff7cc8',
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      defaultProps: {
        variant: 'contained',
      },
    },
  },
});
