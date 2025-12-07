import type { Metadata } from 'next';
// import type { IProductItem } from 'src/types/product'; // Não é mais necessária

import { CONFIG } from 'src/global-config';
// import axios, { endpoints } from 'src/lib/axios'; // Não são mais necessárias
import { getProduct } from 'src/actions/product-ssr';

import { ProductShopDetailsView } from 'src/sections/product/view';

// ----------------------------------------------------------------------

export const metadata: Metadata = { title: `Product details - ${CONFIG.appName}` };

type Props = {
  params: Promise<{ id: string }>;
};

export default async function Page({ params }: Props) {
  const { id } = await params;

  const { product } = await getProduct(id);

  return <ProductShopDetailsView product={product} />;
}

// ----------------------------------------------------------------------

/**
 * Static Exports in Next.js
 *
 * CORREÇÃO PARA O DEPLOY (CLOUDFLARE PAGES):
 * Retornamos um array vazio para o Next.js pular a geração estática
 * desta rota no momento do build, evitando o erro de conexão/TypeError.
 */
export async function generateStaticParams() {
  // ✅ Retorna vazio para desabilitar a geração estática
  return [];
}