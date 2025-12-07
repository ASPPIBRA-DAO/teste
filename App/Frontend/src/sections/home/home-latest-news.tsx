import { m } from 'framer-motion';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';

import { varFade, MotionViewport } from 'src/components/animate';

// ----------------------------------------------------------------------

export function HomeLatestNews() {
  return (
    <Container
      component={MotionViewport}
      sx={{ py: { xs: 10, md: 15 } }}
    >
      <Stack spacing={3} sx={{ mb: { xs: 8, md: 10 }, textAlign: 'center' }}>
        <m.div variants={varFade('inDown')}>
          <Box component="h2" sx={{ typography: 'h2', color: 'text.primary' }}>
            Latest News
          </Box>
        </m.div>

        <m.div variants={varFade('inUp')}>
          <Box sx={{ typography: 'body1', color: 'text.secondary' }}>
            Recent updates.
          </Box>
        </m.div>
      </Stack>
    </Container>
  );
}
