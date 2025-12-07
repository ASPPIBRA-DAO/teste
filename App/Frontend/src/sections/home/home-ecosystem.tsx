import { m } from 'framer-motion';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';
import CardHeader from '@mui/material/CardHeader';

import { varFade, MotionViewport } from 'src/components/animate';

// ----------------------------------------------------------------------

export function HomeEcosystem() {
  return (
    <Container
      component={MotionViewport}
      sx={{ py: { xs: 10, md: 15 } }}
    >
      <Stack spacing={3} sx={{ mb: { xs: 8, md: 10 }, textAlign: 'center' }}>
        <m.div variants={varFade('inDown')}>
          <Box component="h2" sx={{ typography: 'h2', color: 'text.primary' }}>
            Ecosystem
          </Box>
        </m.div>

        <m.div variants={varFade('inUp')}>
          <Box sx={{ typography: 'body1', color: 'text.secondary' }}>
            What it is (RWA, DAO) and how it works.
          </Box>
        </m.div>
      </Stack>

      <Box
        sx={{
          gap: 4,
          display: 'grid',
          gridTemplateColumns: {
            xs: 'repeat(1, 1fr)',
            md: 'repeat(2, 1fr)',
          },
        }}
      >
        <m.div variants={varFade('inUp')}>
          <Card>
            <CardHeader title="RWA" sx={{ textAlign: 'center' }} />
          </Card>
        </m.div>

        <m.div variants={varFade('inUp')}>
          <Card>
            <CardHeader title="DAO" sx={{ textAlign: 'center' }} />
          </Card>
        </m.div>
      </Box>
    </Container>
  );
}
