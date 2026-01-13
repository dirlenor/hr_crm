export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      attendances: {
        Row: {
          clock_in: string | null
          clock_in_location: Json | null
          clock_in_photo_url: string | null
          clock_out: string | null
          clock_out_location: Json | null
          clock_out_photo_url: string | null
          created_at: string | null
          date: string
          employee_id: string
          id: string
          late_minutes: number | null
          notes: string | null
          org_id: string
          ot_minutes: number | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          clock_in?: string | null
          clock_in_location?: Json | null
          clock_in_photo_url?: string | null
          clock_out?: string | null
          clock_out_location?: Json | null
          clock_out_photo_url?: string | null
          created_at?: string | null
          date: string
          employee_id: string
          id?: string
          late_minutes?: number | null
          notes?: string | null
          org_id: string
          ot_minutes?: number | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          clock_in?: string | null
          clock_in_location?: Json | null
          clock_in_photo_url?: string | null
          clock_out?: string | null
          clock_out_location?: Json | null
          clock_out_photo_url?: string | null
          created_at?: string | null
          date?: string
          employee_id?: string
          id?: string
          late_minutes?: number | null
          notes?: string | null
          org_id?: string
          ot_minutes?: number | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      departments: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          org_id: string
          parent_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          org_id: string
          parent_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          org_id?: string
          parent_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      employees: {
        Row: {
          avatar_url: string | null
          bank_account: string | null
          bank_name: string | null
          base_salary: number | null
          created_at: string | null
          created_by: string | null
          department_id: string | null
          email: string | null
          employee_code: string | null
          employment_type: string | null
          end_date: string | null
          first_name: string
          id: string
          invite_code: string | null
          invite_expires_at: string | null
          invite_sent_at: string | null
          last_name: string
          line_user_id: string | null
          nickname: string | null
          org_id: string
          phone: string | null
          position_id: string | null
          social_security_id: string | null
          start_date: string
          status: string | null
          tax_id: string | null
          updated_at: string | null
          updated_by: string | null
          user_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          bank_account?: string | null
          bank_name?: string | null
          base_salary?: number | null
          created_at?: string | null
          created_by?: string | null
          department_id?: string | null
          email?: string | null
          employee_code?: string | null
          employment_type?: string | null
          end_date?: string | null
          first_name: string
          id?: string
          invite_code?: string | null
          invite_expires_at?: string | null
          invite_sent_at?: string | null
          last_name: string
          line_user_id?: string | null
          nickname?: string | null
          org_id: string
          phone?: string | null
          position_id?: string | null
          social_security_id?: string | null
          start_date?: string
          status?: string | null
          tax_id?: string | null
          updated_at?: string | null
          updated_by?: string | null
          user_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          bank_account?: string | null
          bank_name?: string | null
          base_salary?: number | null
          created_at?: string | null
          created_by?: string | null
          department_id?: string | null
          email?: string | null
          employee_code?: string | null
          employment_type?: string | null
          end_date?: string | null
          first_name?: string
          id?: string
          invite_code?: string | null
          invite_expires_at?: string | null
          invite_sent_at?: string | null
          last_name?: string
          line_user_id?: string | null
          nickname?: string | null
          org_id?: string
          phone?: string | null
          position_id?: string | null
          social_security_id?: string | null
          start_date?: string
          status?: string | null
          tax_id?: string | null
          updated_at?: string | null
          updated_by?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      holidays: {
        Row: {
          created_at: string | null
          date: string
          id: string
          is_paid: boolean | null
          name: string
          org_id: string
        }
        Insert: {
          created_at?: string | null
          date: string
          id?: string
          is_paid?: boolean | null
          name: string
          org_id: string
        }
        Update: {
          created_at?: string | null
          date?: string
          id?: string
          is_paid?: boolean | null
          name?: string
          org_id?: string
        }
        Relationships: []
      }
      leave_balances: {
        Row: {
          created_at: string | null
          employee_id: string
          id: string
          leave_type_id: string
          total_days: number | null
          updated_at: string | null
          used_days: number | null
          year: number
        }
        Insert: {
          created_at?: string | null
          employee_id: string
          id?: string
          leave_type_id: string
          total_days?: number | null
          updated_at?: string | null
          used_days?: number | null
          year: number
        }
        Update: {
          created_at?: string | null
          employee_id?: string
          id?: string
          leave_type_id?: string
          total_days?: number | null
          updated_at?: string | null
          used_days?: number | null
          year?: number
        }
        Relationships: []
      }
      leave_requests: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string | null
          document_url: string | null
          employee_id: string
          end_date: string
          id: string
          leave_type_id: string
          org_id: string
          reason: string | null
          rejection_reason: string | null
          start_date: string
          status: string | null
          total_days: number
          updated_at: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          document_url?: string | null
          employee_id: string
          end_date: string
          id?: string
          leave_type_id: string
          org_id: string
          reason?: string | null
          rejection_reason?: string | null
          start_date: string
          status?: string | null
          total_days: number
          updated_at?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          document_url?: string | null
          employee_id?: string
          end_date?: string
          id?: string
          leave_type_id?: string
          org_id?: string
          reason?: string | null
          rejection_reason?: string | null
          start_date?: string
          status?: string | null
          total_days?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      leave_types: {
        Row: {
          advance_days: number | null
          created_at: string | null
          days_per_year: number | null
          id: string
          is_paid: boolean | null
          name: string
          name_en: string | null
          org_id: string
          requires_approval: boolean | null
          requires_document: boolean | null
        }
        Insert: {
          advance_days?: number | null
          created_at?: string | null
          days_per_year?: number | null
          id?: string
          is_paid?: boolean | null
          name: string
          name_en?: string | null
          org_id: string
          requires_approval?: boolean | null
          requires_document?: boolean | null
        }
        Update: {
          advance_days?: number | null
          created_at?: string | null
          days_per_year?: number | null
          id?: string
          is_paid?: boolean | null
          name?: string
          name_en?: string | null
          org_id?: string
          requires_approval?: boolean | null
          requires_document?: boolean | null
        }
        Relationships: []
      }
      org_invite_codes: {
        Row: {
          code: string
          created_at: string | null
          created_by: string | null
          expires_at: string | null
          id: string
          max_uses: number | null
          org_id: string
          role_id: string | null
          used_count: number | null
        }
        Insert: {
          code: string
          created_at?: string | null
          created_by?: string | null
          expires_at?: string | null
          id?: string
          max_uses?: number | null
          org_id: string
          role_id?: string | null
          used_count?: number | null
        }
        Update: {
          code?: string
          created_at?: string | null
          created_by?: string | null
          expires_at?: string | null
          id?: string
          max_uses?: number | null
          org_id?: string
          role_id?: string | null
          used_count?: number | null
        }
        Relationships: []
      }
      orgs: {
        Row: {
          created_at: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      ot_requests: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string | null
          date: string
          employee_id: string
          end_time: string
          hours: number
          id: string
          org_id: string
          reason: string | null
          start_time: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          date: string
          employee_id: string
          end_time: string
          hours: number
          id?: string
          org_id: string
          reason?: string | null
          start_time: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          date?: string
          employee_id?: string
          end_time?: string
          hours?: number
          id?: string
          org_id?: string
          reason?: string | null
          start_time?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      payroll_items: {
        Row: {
          absent_deduction: number | null
          allowances: number | null
          base_salary: number | null
          bonus: number | null
          created_at: string | null
          employee_id: string
          gross_salary: number | null
          id: string
          late_deduction: number | null
          net_salary: number | null
          notes: string | null
          org_id: string
          ot_amount: number | null
          ot_hours: number | null
          other_deduction: number | null
          other_income: number | null
          payroll_period_id: string
          social_security: number | null
          tax: number | null
          total_deduction: number | null
          updated_at: string | null
        }
        Insert: {
          absent_deduction?: number | null
          allowances?: number | null
          base_salary?: number | null
          bonus?: number | null
          created_at?: string | null
          employee_id: string
          gross_salary?: number | null
          id?: string
          late_deduction?: number | null
          net_salary?: number | null
          notes?: string | null
          org_id: string
          ot_amount?: number | null
          ot_hours?: number | null
          other_deduction?: number | null
          other_income?: number | null
          payroll_period_id: string
          social_security?: number | null
          tax?: number | null
          total_deduction?: number | null
          updated_at?: string | null
        }
        Update: {
          absent_deduction?: number | null
          allowances?: number | null
          base_salary?: number | null
          bonus?: number | null
          created_at?: string | null
          employee_id?: string
          gross_salary?: number | null
          id?: string
          late_deduction?: number | null
          net_salary?: number | null
          notes?: string | null
          org_id?: string
          ot_amount?: number | null
          ot_hours?: number | null
          other_deduction?: number | null
          other_income?: number | null
          payroll_period_id?: string
          social_security?: number | null
          tax?: number | null
          total_deduction?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      payroll_periods: {
        Row: {
          created_at: string | null
          created_by: string | null
          end_date: string
          id: string
          name: string
          org_id: string
          pay_date: string | null
          start_date: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          end_date: string
          id?: string
          name: string
          org_id: string
          pay_date?: string | null
          start_date: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          end_date?: string
          id?: string
          name?: string
          org_id?: string
          pay_date?: string | null
          start_date?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      permissions: {
        Row: {
          description: string | null
          id: string
          key: string
        }
        Insert: {
          description?: string | null
          id?: string
          key: string
        }
        Update: {
          description?: string | null
          id?: string
          key?: string
        }
        Relationships: []
      }
      positions: {
        Row: {
          created_at: string | null
          department_id: string | null
          id: string
          level: number | null
          name: string
          org_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          department_id?: string | null
          id?: string
          level?: number | null
          name: string
          org_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          department_id?: string | null
          id?: string
          level?: number | null
          name?: string
          org_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          auth_provider: string | null
          avatar_url: string | null
          created_at: string | null
          display_name: string | null
          email: string | null
          id: string
          line_user_id: string | null
          org_id: string
          status: string | null
        }
        Insert: {
          auth_provider?: string | null
          avatar_url?: string | null
          created_at?: string | null
          display_name?: string | null
          email?: string | null
          id: string
          line_user_id?: string | null
          org_id: string
          status?: string | null
        }
        Update: {
          auth_provider?: string | null
          avatar_url?: string | null
          created_at?: string | null
          display_name?: string | null
          email?: string | null
          id?: string
          line_user_id?: string | null
          org_id?: string
          status?: string | null
        }
        Relationships: []
      }
      role_permissions: {
        Row: {
          permission_id: string
          role_id: string
        }
        Insert: {
          permission_id: string
          role_id: string
        }
        Update: {
          permission_id?: string
          role_id?: string
        }
        Relationships: []
      }
      roles: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          org_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          org_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          org_id?: string
        }
        Relationships: []
      }
      salary_structures: {
        Row: {
          base_salary_max: number
          base_salary_min: number
          created_at: string | null
          id: string
          org_id: string
          ot_holiday_multiplier: number | null
          ot_rate_multiplier: number | null
          position_id: string | null
          updated_at: string | null
        }
        Insert: {
          base_salary_max?: number
          base_salary_min?: number
          created_at?: string | null
          id?: string
          org_id: string
          ot_holiday_multiplier?: number | null
          ot_rate_multiplier?: number | null
          position_id?: string | null
          updated_at?: string | null
        }
        Update: {
          base_salary_max?: number
          base_salary_min?: number
          created_at?: string | null
          id?: string
          org_id?: string
          ot_holiday_multiplier?: number | null
          ot_rate_multiplier?: number | null
          position_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          role_id: string
          user_id: string
        }
        Insert: {
          role_id: string
          user_id: string
        }
        Update: {
          role_id?: string
          user_id?: string
        }
        Relationships: []
      }
      work_schedules: {
        Row: {
          break_minutes: number | null
          created_at: string | null
          id: string
          late_threshold_minutes: number | null
          name: string
          org_id: string
          work_days: string[] | null
          work_end_time: string
          work_start_time: string
        }
        Insert: {
          break_minutes?: number | null
          created_at?: string | null
          id?: string
          late_threshold_minutes?: number | null
          name: string
          org_id: string
          work_days?: string[] | null
          work_end_time?: string
          work_start_time?: string
        }
        Update: {
          break_minutes?: number | null
          created_at?: string | null
          id?: string
          late_threshold_minutes?: number | null
          name?: string
          org_id?: string
          work_days?: string[] | null
          work_end_time?: string
          work_start_time?: string
        }
        Relationships: []
      }
      employee_schedules: {
        Row: {
          created_at: string | null
          effective_date: string
          employee_id: string
          id: string
          schedule_id: string
        }
        Insert: {
          created_at?: string | null
          effective_date?: string
          employee_id: string
          id?: string
          schedule_id: string
        }
        Update: {
          created_at?: string | null
          effective_date?: string
          employee_id?: string
          id?: string
          schedule_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_default_roles_for_org: {
        Args: { org_id_param: string }
        Returns: undefined
      }
      create_org_with_profile: {
        Args: {
          auth_provider?: string
          avatar_url?: string
          display_name?: string
          line_user_id?: string
          org_name: string
          user_email: string
          user_id: string
        }
        Returns: string
      }
      get_current_employee_id: { Args: Record<string, never>; Returns: string }
      get_user_org_id: { Args: { user_id: string }; Returns: string }
      has_permission: {
        Args: { permission_key: string; user_id: string }
        Returns: boolean
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
