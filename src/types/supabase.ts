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
      }
      services: {
        Row: {
          id: string
          slug: string
          name: string
          description: string | null
          base_price: number
          is_active: boolean
          requires_kyc: boolean
          config: Json
          created_at: string
        }
        Insert: {
          id?: string
          slug: string
          name: string
          description?: string | null
          base_price: number
          is_active?: boolean
          requires_kyc?: boolean
          config: Json
          created_at?: string
        }
        Update: {
          id?: string
          slug?: string
          name?: string
          description?: string | null
          base_price?: number
          is_active?: boolean
          requires_kyc?: boolean
          config?: Json
          created_at?: string
        }
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
          created_at?: string
          updated_at?: string
        }
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
    }
  }
}
