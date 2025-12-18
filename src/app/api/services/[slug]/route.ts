import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface RouteParams {
  params: Promise<{ slug: string }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params
    const supabase = await createClient()

    // Fetch service by slug
    const { data: service, error: serviceError } = await supabase
      .from('services')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .single()

    if (serviceError || !service) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'SERVICE_NOT_FOUND',
            message: `Service with slug '${slug}' not found`
          }
        },
        { status: 404 }
      )
    }

    // Fetch service options
    const { data: options } = await supabase
      .from('service_options')
      .select('*')
      .eq('service_id', service.id)
      .eq('is_active', true)
      .order('display_order', { ascending: true })

    // Transform response
    const transformedService = {
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
      config: service.config,
      metaTitle: service.meta_title,
      metaDescription: service.meta_description,
      options: options?.map(opt => ({
        id: opt.id,
        code: opt.code,
        name: opt.name,
        description: opt.description,
        type: opt.price_type,
        price: parseFloat(String(opt.price)),
        isRequired: opt.is_required,
        config: opt.config,
        displayOrder: opt.display_order
      })) || [],
      createdAt: service.created_at,
      updatedAt: service.updated_at
    }

    return NextResponse.json({
      success: true,
      data: {
        service: transformedService
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
