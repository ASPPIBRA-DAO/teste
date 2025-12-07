import type { Breakpoint } from '@mui/material/styles';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Divider from '@mui/material/Divider';
import { styled } from '@mui/material/styles';
import Container from '@mui/material/Container';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { _socials } from 'src/_mock'; 

import { Logo } from 'src/components/logo';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

const LINKS = [
  // ✅ 2. COLUNA — ECOSSISTEMA
  {
    headline: 'ECOSSISTEMA',
    children: [
      { name: 'Governança Descentralizada (DAO)', href: '#' },
      { name: 'Tokenomics e Incentivos', href: '#' },
      { name: 'Ativos do Mundo Real (RWA)', href: '#' },
      { name: 'Roteiro Estratégico', href: '#' },
    ],
  },
  // ✅ 3. COLUNA — RECURSOS
  {
    headline: 'TRANSPARÊNCIA E RECURSOS',
    children: [
      { name: 'Whitepaper (Visão Completa)', href: '#' },
      { name: 'Documentação Técnica', href: '#' },
      { name: 'Relatórios de Auditoria', href: '#' },
      { name: 'Termos de Serviço', href: '#' },
    ],
  },
  // ✅ 4. COLUNA — SUPORTE DIRETO 
  {
    headline: 'SUPORTE DIRETO',
    children: [{ name: 'help@asppibra.dao', href: 'mailto:help@asppibra.dao' }],
    hasTokenContract: true, 
  },
];

const ASPPIBRA_SOCIALS = [
  { label: 'Twitter', value: 'twitter', icon: 'socials:twitter' },
  { label: 'LinkedIn', value: 'linkedin', icon: 'socials:linkedin' },
  { label: 'Instagram', value: 'instagram', icon: 'socials:instagram' },
  { label: 'GitHub', value: 'github', icon: 'socials:github' },
  { label: 'Telegram', value: 'telegram', icon: 'ic:baseline-telegram' }, 
];

// ----------------------------------------------------------------------

const FooterRoot = styled('footer')(({ theme }) => ({
  position: 'relative',
  backgroundColor: '#000000', 
}));

export type FooterProps = React.ComponentProps<typeof FooterRoot>;

export function Footer({
  sx,
  layoutQuery = 'md',
  ...other
}: FooterProps & { layoutQuery?: Breakpoint }) {
  const TOKEN_ADDRESS = '0x71C...8976F';

  return (
    <FooterRoot sx={sx} {...other}>
      <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.12)' }} />

      <Container
        sx={(theme) => ({
          pb: 5,
          pt: 10,
          textAlign: 'center',
          color: 'common.white', 
          [theme.breakpoints.up(layoutQuery)]: { textAlign: 'unset' },
        })}
      >
        <Logo sx={{ mx: { xs: 'auto', md: 'inherit' } }} />
        <Typography 
            component="div" 
            variant="overline" 
            sx={{ 
              mt: 1, 
              color: 'success.main',
              mb: 1, 
              display: 'block' 
            }}
          >
            🟢 PLATAFORMA ATIVA
          </Typography>


        <Grid
          container
          sx={[
            (theme) => ({
              mt: 3, 
              gap: 5,
              justifyContent: 'center',
              [theme.breakpoints.up(layoutQuery)]: { justifyContent: 'space-between', gap: 'unset' },
            }),
          ]}
        >
          {/* Coluna Principal da ASPPIBRA-DAO (Descrição) */}
          <Grid size={{ xs: 12, [layoutQuery]: 3 }}>
            <Typography
              variant="h6"
              fontWeight="bold"
              sx={(theme) => ({
                mx: 'auto',
                maxWidth: 280,
                mb: 1.5,
                [theme.breakpoints.up(layoutQuery)]: { mx: 'unset' },
              })}
            >
              Construindo o futuro dos Ativos Reais (RWA) no mundo digital.
            </Typography>

            <Typography
              variant="body2"
              sx={(theme) => ({
                mx: 'auto',
                maxWidth: 280,
                lineHeight: 1.7,
                [theme.breakpoints.up(layoutQuery)]: { mx: 'unset' },
              })}
            >
              Impulsionada por Governança Descentralizada (DAO), Transparência Web3 e o poder da Inteligência Artificial.
            </Typography>

            {/* Ícones Sociais */}
            <Box
              sx={(theme) => ({
                mt: 4, 
                mb: 5,
                display: 'flex',
                justifyContent: 'center',
                gap: 1,
                [theme.breakpoints.up(layoutQuery)]: { mb: 0, justifyContent: 'flex-start' },
              })}
            >
              {ASPPIBRA_SOCIALS.map((social) => (
                <IconButton 
                  key={social.label} 
                  sx={{ 
                    color: 'common.white', 
                    p: 0.8,
                    fontSize: 24,
                  }}
                >
                  <Iconify icon={social.icon} />
                </IconButton>
              ))}
            </Box>
          </Grid>

          {/* Colunas de Links (ECOSSISTEMA, RECURSOS, SUPORTE) */}
          <Grid size={{ xs: 12, [layoutQuery]: 8 }}>
            <Box
              sx={(theme) => ({
                gap: { xs: 5, md: 8 }, 
                display: 'flex',
                flexDirection: 'column',
                [theme.breakpoints.up(layoutQuery)]: { flexDirection: 'row', justifyContent: 'flex-end' },
              })}
            >
              {LINKS.map((list) => (
                <Box
                  key={list.headline}
                  sx={(theme) => ({
                    gap: 1.5,
                    width: 1,
                    display: 'flex',
                    alignItems: 'center',
                    flexDirection: 'column',
                    [theme.breakpoints.up(layoutQuery)]: { alignItems: 'flex-start' }, 
                  })}
                >
                  <Typography component="div" variant="overline" sx={{ mb: 1 }}>
                    {list.headline}
                  </Typography>

                  {list.children.map((link) => (
                    <Link
                      key={link.name}
                      component={RouterLink}
                      href={link.href}
                      variant="body1" 
                      sx={{ 
                        color: 'text.secondary', 
                        lineHeight: 1.8,
                        '&:hover': { color: 'primary.main' } 
                      }}
                    >
                      {link.name}
                    </Link>
                  ))}

                  {/* Renderização do Token Contract na coluna SUPORTE DIRETO */}
                  {list.hasTokenContract && (
                    <Box sx={{ mt: 3, textAlign: 'left', width: '100%' }}>
                      <Typography variant="overline" display="block" sx={{ mb: 0.5 }}>
                        TOKEN CONTRACT (ERC-20)
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography variant="body1" fontWeight="bold" sx={{ color: 'success.main', mr: 1 }}>
                              {TOKEN_ADDRESS}
                          </Typography>
                          <IconButton size="small" sx={{ color: 'common.white', '&:hover': { color: 'primary.main' } }}>
                              <ContentCopyIcon sx={{ width: 16, height: 16 }} />
                          </IconButton>
                      </Box>
                    </Box>
                  )}
                </Box>
              ))}
            </Box>
          </Grid>
        </Grid>

        {/* ✅ 5. RODAPÉ FINAL */}
        <Box
          sx={(theme) => ({
            mt: 10,
            pt: 3,
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            justifyContent: 'space-between',
            flexDirection: 'column',
            gap: 1,
            [theme.breakpoints.up('sm')]: { flexDirection: 'row' },
          })}
        >
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            © 2025 ASPPIBRA-DAO. Todos os direitos reservados.
          </Typography>
          <Box>
            <Link
              href="#"
              variant="body2"
              sx={{ color: 'text.secondary', mr: 3, '&:hover': { color: 'primary.main' } }}
            >
              Política de Privacidade
            </Link>
            <Link 
              href="#" 
              variant="body2" 
              sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main' } }}
            >
              Política de Cookies
            </Link>
          </Box>
        </Box>
      </Container>
    </FooterRoot>
  );
}

// ----------------------------------------------------------------------

export function HomeFooter({ sx, ...other }: FooterProps) {
  return (
    <FooterRoot
      sx={[
        {
          py: 5,
          textAlign: 'center',
          backgroundColor: '#000000',
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      <Container>
        <Logo />
        <Box sx={{ mt: 1, typography: 'caption', color: 'common.white' }}>
          © 2025 ASPPIBRA-DAO. Todos os direitos reservados.
        </Box>
      </Container>
    </FooterRoot>
  );
}
