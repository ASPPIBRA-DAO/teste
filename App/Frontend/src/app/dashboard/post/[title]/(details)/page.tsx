import type { Metadata } from 'next';
// import type { IPostItem } from 'src/types/blog'; // Não é mais necessária

// import { kebabCase } from 'es-toolkit'; // Não é mais necessária

import { CONFIG } from 'src/global-config';
import { getPost } from 'src/actions/blog-ssr';
// import axios, { endpoints } from 'src/lib/axios'; // Não são mais necessárias

import { PostDetailsView } from 'src/sections/blog/view';

// ----------------------------------------------------------------------

export const metadata: Metadata = { title: `Post details | Dashboard - ${CONFIG.appName}` };

type Props = {
  params: Promise<{ title: string }>;
};

export default async function Page({ params }: Props) {
  const { title } = await params;

  const { post } = await getPost(title);

  return <PostDetailsView post={post} />;
}

// ----------------------------------------------------------------------

/**
 * Static Exports in Next.js
 *
 * CORREÇÃO FINAL PARA O DEPLOY (CLOUDFLARE PAGES):
 * Retornamos um array vazio [].
 * Isso desabilita a geração estática no build para esta rota, 
 * prevenindo que o Next.js tente conectar na API durante o processo de deploy, 
 * o que causava o erro 'Cannot read properties of undefined (reading 'slice')'.
 */
export async function generateStaticParams() {
  // ✅ Retorna vazio para desabilitar a geração estática no build
  return [];

  /* CÓDIGO ORIGINAL COMENTADO PARA REFERÊNCIA:
  const res = await axios.get(endpoints.post.list);
  const data: IPostItem[] = CONFIG.isStaticExport ? res.data.posts : res.data.posts.slice(0, 1);

  return data.map((post) => ({
    title: kebabCase(post.title),
  }));
  */
}