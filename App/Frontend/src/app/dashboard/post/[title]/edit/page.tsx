import type { Metadata } from 'next';
import type { IPostItem } from 'src/types/blog';

import { kebabCase } from 'es-toolkit';

import { CONFIG } from 'src/global-config';
import { getPost } from 'src/actions/blog-ssr';
import axios, { endpoints } from 'src/lib/axios';

import { PostEditView } from 'src/sections/blog/view';

// ----------------------------------------------------------------------

export const metadata: Metadata = { title: `Post edit | Dashboard - ${CONFIG.appName}` };

type Props = {
  params: Promise<{ title: string }>;
};

export default async function Page({ params }: Props) {
  const { title } = await params;

  const { post } = await getPost(title);

  return <PostEditView post={post} />;
}

// ----------------------------------------------------------------------

/**
 * Static Exports in Next.js
 *
 * CORREÇÃO PARA O DEPLOY (CLOUDFLARE PAGES):
 * Alteramos esta função para retornar vazio [].
 * Isso impede que o build tente conectar na API para listar todos os posts,
 * o que causava erro 500/ECONNREFUSED durante o deploy.
 *
 * As páginas serão geradas sob demanda quando o usuário acessar.
 */
export async function generateStaticParams() {
  // ✅ Retornar vazio faz o Next.js pular a geração estática desta rota no build
  return [];

  /* CÓDIGO ANTIGO (QUE QUEBRAVA O BUILD):
  const res = await axios.get(endpoints.post.list);
  const data: IPostItem[] = CONFIG.isStaticExport ? res.data.posts : res.data.posts.slice(0, 1);

  return data.map((post) => ({
    title: kebabCase(post.title),
  }));
  */
}