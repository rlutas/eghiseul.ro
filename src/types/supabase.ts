export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          first_name: string | null
          last_name: string | null
          cnp: string | null
          phone: string | null
          email: string | null
          kyc_verified: boolean
          two_factor_enabled: boolean
          role: 'customer' | 'admin' | 'partner'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          first_name?: string | null
          last_name?: string | null
          cnp?: string | null
          phone?: string | null
          email?: string | null
          kyc_verified?: boolean
          two_factor_enabled?: boolean
          role?: 'customer' | 'admin' | 'partner'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          first_name?: string | null
          last_name?: string | null
          cnp?: string | null
          phone?: string | null
          email?: string | null
          kyc_verified?: boolean
          two_factor_enabled?: boolean
          role?: 'customer' | 'admin' | 'partner'
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      services: {
        Row: {
          id: string
          slug: string
          code: string
          name: string
          description: string | null
          short_description: string | null
          category: 'fiscale' | 'juridice' | 'imobiliare' | 'comerciale' | 'auto' | 'personale'
          base_price: number
          currency: string
          is_active: boolean
          is_featured: boolean
          requires_kyc: boolean
          estimated_days: number
          urgent_available: boolean
          urgent_days: number
          config: Json
          display_order: number
          meta_title: string | null
          meta_description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          slug: string
          code: string
          name: string
          description?: string | null
          short_description?: string | null
          category: 'fiscale' | 'juridice' | 'imobiliare' | 'comerciale' | 'auto' | 'personale'
          base_price: number
          currency?: string
          is_active?: boolean
          is_featured?: boolean
          requires_kyc?: boolean
          estimated_days?: number
          urgent_available?: boolean
          urgent_days?: number
          config?: Json
          display_order?: number
          meta_title?: string | null
          meta_description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          slug?: string
          code?: string
          name?: string
          description?: string | null
          short_description?: string | null
          category?: 'fiscale' | 'juridice' | 'imobiliare' | 'comerciale' | 'auto' | 'personale'
          base_price?: number
          currency?: string
          is_active?: boolean
          is_featured?: boolean
          requires_kyc?: boolean
          estimated_days?: number
          urgent_available?: boolean
          urgent_days?: number
          config?: Json
          display_order?: number
          meta_title?: string | null
          meta_description?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      service_options: {
        Row: {
          id: string
          service_id: string
          name: string
          description: string | null
          option_type: 'addon' | 'select' | 'input' | 'checkbox'
          price_modifier: number
          is_required: boolean
          is_active: boolean
          choices: Json | null
          display_order: number
          created_at: string
        }
        Insert: {
          id?: string
          service_id: string
          name: string
          description?: string | null
          option_type: 'addon' | 'select' | 'input' | 'checkbox'
          price_modifier?: number
          is_required?: boolean
          is_active?: boolean
          choices?: Json | null
          display_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          service_id?: string
          name?: string
          description?: string | null
          option_type?: 'addon' | 'select' | 'input' | 'checkbox'
          price_modifier?: number
          is_required?: boolean
          is_active?: boolean
          choices?: Json | null
          display_order?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'service_options_service_id_fkey'
            columns: ['service_id']
            referencedRelation: 'services'
            referencedColumns: ['id']
          }
        ]
      }
      orders: {
        Row: {
          id: string
          order_number: number
          user_id: string | null
          service_id: string
          status: 'pending' | 'processing' | 'document_ready' | 'delivered' | 'completed' | 'rejected'
          customer_data: Json
          options: Json | null
          delivery_method: string | null
          delivery_address: Json | null
          total_price: number
          payment_status: 'unpaid' | 'paid' | 'refunded'
          stripe_payment_intent: string | null
          contract_url: string | null
          final_document_url: string | null
          admin_notes: string | null
          status_history: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          order_number?: number
          user_id?: string | null
          service_id: string
          status?: 'pending' | 'processing' | 'document_ready' | 'delivered' | 'completed' | 'rejected'
          customer_data: Json
          options?: Json | null
          delivery_method?: string | null
          delivery_address?: Json | null
          total_price: number
          payment_status?: 'unpaid' | 'paid' | 'refunded'
          stripe_payment_intent?: string | null
          contract_url?: string | null
          final_document_url?: string | null
          admin_notes?: string | null
          status_history?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          order_number?: number
          user_id?: string | null
          service_id?: string
          status?: 'pending' | 'processing' | 'document_ready' | 'delivered' | 'completed' | 'rejected'
          customer_data?: Json
          options?: Json | null
          delivery_method?: string | null
          delivery_address?: Json | null
          total_price?: number
          payment_status?: 'unpaid' | 'paid' | 'refunded'
          stripe_payment_intent?: string | null
          contract_url?: string | null
          final_document_url?: string | null
          admin_notes?: string | null
          status_history?: Json | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'orders_user_id_fkey'
            columns: ['user_id']
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'orders_service_id_fkey'
            columns: ['service_id']
            referencedRelation: 'services'
            referencedColumns: ['id']
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: 'customer' | 'admin' | 'partner'
      order_status: 'pending' | 'processing' | 'document_ready' | 'delivered' | 'completed' | 'rejected'
      payment_status: 'unpaid' | 'paid' | 'refunded'
      service_category: 'fiscale' | 'juridice' | 'imobiliare' | 'comerciale' | 'auto' | 'personale'
      option_type: 'addon' | 'select' | 'input' | 'checkbox'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
