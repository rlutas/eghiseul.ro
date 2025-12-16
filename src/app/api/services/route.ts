import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)

    // Parse query parameters
    const categoryParam = searchParams.get('category')
    const sort = searchParams.get('sort') || 'display_order'
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100)
    const offset = parseInt(searchParams.get('offset') || '0')

    // Validate category if provided
    type ServiceCategory = 'fiscale' | 'juridice' | 'imobiliare' | 'comerciale' | 'auto' | 'personale'
    const validCategories: ServiceCategory[] = ['fiscale', 'juridice', 'imobiliare', 'comerciale', 'auto', 'personale']
    const category = categoryParam && validCategories.includes(categoryParam as ServiceCategory)
      ? categoryParam as ServiceCategory
      : null

    // Build query
    let query = supabase
      .from('services')
      .select('*', { count: 'exact' })
      .eq('is_active', true)

    // Filter by category
    if (category) {
      query = query.eq('category', category)
    }

    // Sorting
    switch (sort) {
      case 'price_asc':
        query = query.order('base_price', { ascending: true })
        break
      case 'price_desc':
        query = query.order('base_price', { ascending: false })
        break
      case 'popular':
        query = query.order('is_featured', { ascending: false }).order('display_order', { ascending: true })
        break
      default:
        query = query.order('display_order', { ascending: true })
    }

    // Pagination
    query = query.range(offset, offset + limit - 1)

    const { data: services, error, count } = await query

    if (error) {
      console.error('Services fetch error:', error)
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'DATABASE_ERROR',
            message: 'Failed to fetch services'
          }
        },
        { status: 500 }
      )
    }

    // Transform to API response format
    const transformedServices = services?.map(service => ({
      id: service.id,
      slug: service.slug,
      code: service.code,
      name: service.name,
      description: service.description,
      shortDescription: service.short_description,
      category: service.category,
      basePrice: parseFloat(String(service.base_price)),
      currency: service.currency,
      isActive: service.is_active,
      isFeatured: service.is_featured,
      requiresKyc: service.requires_kyc,
      estimatedDays: service.estimated_days,
      urgentAvailable: service.urgent_available,
      urgentDays: service.urgent_days,
      createdAt: service.created_at,
      updatedAt: service.updated_at
    })) || []

    return NextResponse.json({
      success: true,
      data: {
        services: transformedServices,
        pagination: {
          total: count || 0,
          limit,
          offset,
          hasMore: (offset + limit) < (count || 0)
        }
      }
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An unexpected error occurred'
        }
      },
      { status: 500 }
    )
  }
}
