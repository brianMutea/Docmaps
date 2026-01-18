import { createServerClient } from '@docmaps/auth/server';
import { HomeClient } from '@/components/home-client';
import type { Map as MapType } from '@docmaps/database';

interface PageProps {
  searchParams: {
    q?: string;
    sort?: 'views' | 'date' | 'title';
    page?: string;
  };
}

export default async function HomePage({ searchParams }: PageProps) {
  const supabase = createServerClient();
  const query = searchParams.q || '';
  const sort = searchParams.sort || 'views';
  const page = parseInt(searchParams.page || '1', 10);
  const limit = 12;
  const offset = (page - 1) * limit;

  // Fetch featured maps (only on first page without search)
  let featuredMaps: MapType[] = [];
  if (!query && page === 1) {
    const { data: featured } = await supabase
      .from('maps')
      .select('*')
      .eq('status', 'published')
      .eq('featured', true)
      .order('view_count', { ascending: false })
      .limit(6);
    
    featuredMaps = (featured as MapType[]) || [];
  }

  // Build query for regular maps
  let dbQuery = supabase
    .from('maps')
    .select('*', { count: 'exact' })
    .eq('status', 'published');

  // Add search filter
  if (query) {
    dbQuery = dbQuery.or(
      `title.ilike.%${query}%,description.ilike.%${query}%,product_name.ilike.%${query}%`
    );
  }

  // Add sorting
  switch (sort) {
    case 'views':
      dbQuery = dbQuery.order('view_count', { ascending: false });
      break;
    case 'date':
      dbQuery = dbQuery.order('updated_at', { ascending: false });
      break;
    case 'title':
      dbQuery = dbQuery.order('title', { ascending: true });
      break;
  }

  // Add pagination
  dbQuery = dbQuery.range(offset, offset + limit - 1);

  const { data: maps, count, error } = await dbQuery;

  if (error) {
    console.error('Error fetching maps:', error);
  }

  const totalPages = count ? Math.ceil(count / limit) : 0;

  return (
    <HomeClient
      maps={(maps as MapType[]) || []}
      featuredMaps={featuredMaps}
      query={query}
      sort={sort}
      currentPage={page}
      totalPages={totalPages}
      totalCount={count || 0}
    />
  );
}
