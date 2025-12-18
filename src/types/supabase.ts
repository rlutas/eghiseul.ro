export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          created_at: string
          error_message: string | null
          id: string
          ip_address: string
          metadata: Json | null
          resource_id: string | null
          resource_type: string | null
          status: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          error_message?: string | null
          id?: string
          ip_address: string
          metadata?: Json | null
          resource_id?: string | null
          resource_type?: string | null
          status: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          error_message?: string | null
          id?: string
          ip_address?: string
          metadata?: Json | null
          resource_id?: string | null
          resource_type?: string | null
          status?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      order_history: {
        Row: {
          changed_by: string | null
          created_at: string | null
          event_type: string
          id: string
          ip_address: unknown
          metadata: Json | null
          new_value: Json | null
          notes: string | null
          old_value: Json | null
          order_id: string | null
          user_agent: string | null
        }
        Insert: {
          changed_by?: string | null
          created_at?: string | null
          event_type: string
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          new_value?: Json | null
          notes?: string | null
          old_value?: Json | null
          order_id?: string | null
          user_agent?: string | null
        }
        Update: {
          changed_by?: string | null
          created_at?: string | null
          event_type?: string
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          new_value?: Json | null
          notes?: string | null
          old_value?: Json | null
          order_id?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_history_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_history_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          actual_completion_date: string | null
          admin_notes: string | null
          assigned_to: string | null
          base_price: number
          cancelled_at: string | null
          contract_signed_at: string | null
          contract_url: string | null
          created_at: string | null
          currency: string | null
          customer_data: Json
          delivery_address: Json | null
          delivery_method: string | null
          delivery_price: number | null
          delivery_tracking_number: string | null
          delivery_tracking_url: string | null
          discount_amount: number | null
          encrypted_ci_number: string | null
          encrypted_ci_series: string | null
          encrypted_cnp: string | null
          estimated_completion_date: string | null
          final_document_uploaded_at: string | null
          final_document_url: string | null
          id: string
          internal_status_notes: Json | null
          invoice_issued_at: string | null
          invoice_number: string | null
          invoice_url: string | null
          kyc_documents: Json | null
          kyc_rejection_reason: string | null
          kyc_verified_at: string | null
          kyc_verified_by: string | null
          friendly_order_id: string | null
          abandoned_email_sent_at: string | null
          options_price: number | null
          order_number: string
          paid_at: string | null
          partner_id: string | null
          payment_method: string | null
          payment_status: string | null
          pii_encrypted_at: string | null
          refunded_at: string | null
          selected_options: Json | null
          service_id: string | null
          status: string | null
          stripe_charge_id: string | null
          stripe_payment_intent_id: string | null
          submitted_at: string | null
          tax_amount: number | null
          total_price: number
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          actual_completion_date?: string | null
          admin_notes?: string | null
          assigned_to?: string | null
          base_price: number
          cancelled_at?: string | null
          contract_signed_at?: string | null
          contract_url?: string | null
          created_at?: string | null
          currency?: string | null
          customer_data?: Json
          delivery_address?: Json | null
          delivery_method?: string | null
          delivery_price?: number | null
          delivery_tracking_number?: string | null
          delivery_tracking_url?: string | null
          discount_amount?: number | null
          encrypted_ci_number?: string | null
          encrypted_ci_series?: string | null
          encrypted_cnp?: string | null
          estimated_completion_date?: string | null
          final_document_uploaded_at?: string | null
          final_document_url?: string | null
          id?: string
          internal_status_notes?: Json | null
          invoice_issued_at?: string | null
          invoice_number?: string | null
          invoice_url?: string | null
          kyc_documents?: Json | null
          kyc_rejection_reason?: string | null
          kyc_verified_at?: string | null
          kyc_verified_by?: string | null
          friendly_order_id?: string | null
          abandoned_email_sent_at?: string | null
          options_price?: number | null
          order_number: string
          paid_at?: string | null
          partner_id?: string | null
          payment_method?: string | null
          payment_status?: string | null
          pii_encrypted_at?: string | null
          refunded_at?: string | null
          selected_options?: Json | null
          service_id?: string | null
          status?: string | null
          stripe_charge_id?: string | null
          stripe_payment_intent_id?: string | null
          submitted_at?: string | null
          tax_amount?: number | null
          total_price: number
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          actual_completion_date?: string | null
          admin_notes?: string | null
          assigned_to?: string | null
          base_price?: number
          cancelled_at?: string | null
          contract_signed_at?: string | null
          contract_url?: string | null
          created_at?: string | null
          currency?: string | null
          customer_data?: Json
          delivery_address?: Json | null
          delivery_method?: string | null
          delivery_price?: number | null
          delivery_tracking_number?: string | null
          delivery_tracking_url?: string | null
          discount_amount?: number | null
          encrypted_ci_number?: string | null
          encrypted_ci_series?: string | null
          encrypted_cnp?: string | null
          estimated_completion_date?: string | null
          final_document_uploaded_at?: string | null
          final_document_url?: string | null
          id?: string
          internal_status_notes?: Json | null
          invoice_issued_at?: string | null
          invoice_number?: string | null
          invoice_url?: string | null
          kyc_documents?: Json | null
          kyc_rejection_reason?: string | null
          kyc_verified_at?: string | null
          kyc_verified_by?: string | null
          friendly_order_id?: string | null
          abandoned_email_sent_at?: string | null
          options_price?: number | null
          order_number?: string
          paid_at?: string | null
          partner_id?: string | null
          payment_method?: string | null
          payment_status?: string | null
          pii_encrypted_at?: string | null
          refunded_at?: string | null
          selected_options?: Json | null
          service_id?: string | null
          status?: string | null
          stripe_charge_id?: string | null
          stripe_payment_intent_id?: string | null
          submitted_at?: string | null
          tax_amount?: number | null
          total_price?: number
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_kyc_verified_by_fkey"
            columns: ["kyc_verified_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          cnp: string | null
          created_at: string | null
          email: string | null
          first_name: string | null
          id: string
          kyc_verified: boolean | null
          last_name: string | null
          phone: string | null
          role: string | null
          two_factor_enabled: boolean | null
          updated_at: string | null
        }
        Insert: {
          cnp?: string | null
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          id: string
          kyc_verified?: boolean | null
          last_name?: string | null
          phone?: string | null
          role?: string | null
          two_factor_enabled?: boolean | null
          updated_at?: string | null
        }
        Update: {
          cnp?: string | null
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          id?: string
          kyc_verified?: boolean | null
          last_name?: string | null
          phone?: string | null
          role?: string | null
          two_factor_enabled?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      service_options: {
        Row: {
          code: string
          config: Json | null
          created_at: string | null
          description: string | null
          display_order: number | null
          icon: string | null
          id: string
          is_active: boolean | null
          is_required: boolean | null
          max_quantity: number | null
          name: string
          price: number
          price_type: string | null
          service_id: string | null
          updated_at: string | null
        }
        Insert: {
          code: string
          config?: Json | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          is_required?: boolean | null
          max_quantity?: number | null
          name: string
          price: number
          price_type?: string | null
          service_id?: string | null
          updated_at?: string | null
        }
        Update: {
          code?: string
          config?: Json | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          is_required?: boolean | null
          max_quantity?: number | null
          name?: string
          price?: number
          price_type?: string | null
          service_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_options_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          base_price: number
          category: string
          code: string
          config: Json
          created_at: string | null
          currency: string | null
          description: string | null
          display_order: number | null
          estimated_days: number | null
          id: string
          is_active: boolean | null
          is_featured: boolean | null
          meta_description: string | null
          meta_title: string | null
          name: string
          requires_kyc: boolean | null
          short_description: string | null
          slug: string
          updated_at: string | null
          urgent_available: boolean | null
          urgent_days: number | null
        }
        Insert: {
          base_price: number
          category: string
          code: string
          config?: Json
          created_at?: string | null
          currency?: string | null
          description?: string | null
          display_order?: number | null
          estimated_days?: number | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          meta_description?: string | null
          meta_title?: string | null
          name: string
          requires_kyc?: boolean | null
          short_description?: string | null
          slug: string
          updated_at?: string | null
          urgent_available?: boolean | null
          urgent_days?: number | null
        }
        Update: {
          base_price?: number
          category?: string
          code?: string
          config?: Json
          created_at?: string | null
          currency?: string | null
          description?: string | null
          display_order?: number | null
          estimated_days?: number | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          meta_description?: string | null
          meta_title?: string | null
          name?: string
          requires_kyc?: boolean | null
          short_description?: string | null
          slug?: string
          updated_at?: string | null
          urgent_available?: boolean | null
          urgent_days?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_order_total: { Args: { p_order_id: string }; Returns: number }
      cleanup_old_audit_logs: { Args: never; Returns: number }
      decrypt_pii: {
        Args: { ciphertext: string; encryption_key: string }
        Returns: string
      }
      encrypt_pii: {
        Args: { encryption_key: string; plaintext: string }
        Returns: string
      }
      get_order_decrypted_pii: {
        Args: { p_encryption_key: string; p_order_id: string }
        Returns: {
          ci_number: string
          ci_series: string
          cnp: string
        }[]
      }
      get_order_statistics: {
        Args: { p_end_date?: string; p_start_date?: string }
        Returns: {
          avg_order_value: number
          completed_orders: number
          completion_rate: number
          pending_orders: number
          total_orders: number
          total_revenue: number
        }[]
      }
      is_admin: { Args: never; Returns: boolean }
      is_partner: { Args: never; Returns: boolean }
      log_audit_entry: {
        Args: {
          p_action: string
          p_error_message?: string
          p_ip_address?: string
          p_metadata?: Json
          p_resource_id?: string
          p_resource_type?: string
          p_status: string
          p_user_agent?: string
          p_user_id?: string
        }
        Returns: string
      }
      mask_ci_number: { Args: { ci_number: string }; Returns: string }
      mask_cnp: { Args: { cnp: string }; Returns: string }
      migrate_pii_to_encrypted: {
        Args: { encryption_key: string }
        Returns: {
          error_count: number
          migrated_count: number
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
