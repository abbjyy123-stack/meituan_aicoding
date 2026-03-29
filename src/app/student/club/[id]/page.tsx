import { clubs } from '@/data/clubs';
import ClubDetailClient from './ClubDetailClient';

export const dynamicParams = false;

export function generateStaticParams() {
  return clubs.map((c) => ({ id: String(c.id) }));
}

export default async function ClubDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const clubId = Number(params.id);
  return <ClubDetailClient clubId={clubId} />;
}
