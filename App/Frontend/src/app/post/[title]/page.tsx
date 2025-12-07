import type { Metadata } from 'next';
// import type { IPostItem } from 'src/types/blog'; // Não é mais necessária

// import { kebabCase } from 'es-toolkit'; // Não é mais necessária

import { CONFIG } from 'src/global-config';
// import axios, { endpoints } from 'src/lib/axios'; // Não são mais necessárias
import { getPost, getLatestPosts } from 'src/actions/blog-ssr';

import { PostDetailsHomeView } from 'src/sections/blog/view';

// ----------------------------------------------------------------------

export const metadata: Metadata = { title: `Post details - ${CONFIG.appName}` };

type Props = {
  params: Promise<{ title: string }>;
};

export default async function Page({ params }: Props) {
  const { title } = await params;

  const { post } = await getPost(title);
  const { latestPosts } = await getLatestPosts(title);

  return <PostDetailsHomeView post={post} latestPosts={latestPosts} />;
}

// ----------------------------------------------------------------------

/**
 * Static Exports in Next.js
 *
 * CORREÇÃO PARA O DEPLOY (CLOUDFLARE PAGES):
 * Desativa a geração estática no build para esta rota.
 * Esta é a última correção necessária para o processo de build do Frontend.
 */
export async function generateStaticParams() {
  // ✅ Retorna vazio para que o build na nuvem não tente chamar a API.
  return [];
}