
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  
  "graphql_public": {
          Tables: {
            [_ in never]: never
          }
          Views: {
            [_ in never]: never
          }
          Functions: {
            "graphql":
{ Args: { "extensions"?: Json,"operationName"?: string,"query"?: string,"variables"?: Json }; Returns: Json
                           }
          }
          Enums: {
            [_ in never]: never
          }
          CompositeTypes: {
            [_ in never]: never
          }
        },"public": {
          Tables: {
            "bookmarks": {
                  Row: {
                    "created_at": string,"resource_id": number,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"resource_id": number,"user_id": string
                  }
                  Update: {
                    "created_at"?: string,"resource_id"?: number,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "bookmarks_resource_id_fkey"
      columns: ["resource_id"]
isOneToOne: false
      referencedRelation: "resources"
      referencedColumns: ["id"]
    }
                  ]
                },"departments": {
                  Row: {
                    "accent": string,"created_at": string,"description": string,"icon": string,"id": number,"is_published": boolean,"name": string,"slug": string,"sort_order": number,"tagline": string,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "accent"?: string,"created_at"?: string,"description"?: string,"icon"?: string,"id"?: never,"is_published"?: boolean,"name": string,"slug": string,"sort_order"?: number,"tagline"?: string,"updated_at"?: string
                  }
                  Update: {
                    "accent"?: string,"created_at"?: string,"description"?: string,"icon"?: string,"id"?: never,"is_published"?: boolean,"name"?: string,"slug"?: string,"sort_order"?: number,"tagline"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    
                  ]
                },"learning_milestones": {
                  Row: {
                    "completed_at": string,"stage_id": number,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "completed_at"?: string,"stage_id": number,"user_id": string
                  }
                  Update: {
                    "completed_at"?: string,"stage_id"?: number,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "learning_milestones_stage_id_fkey"
      columns: ["stage_id"]
isOneToOne: false
      referencedRelation: "roadmap_stages"
      referencedColumns: ["id"]
    }
                  ]
                },"profiles": {
                  Row: {
                    "avatar_path": string | null,"bio": string,"created_at": string,"display_name": string,"headline": string,"id": string,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "avatar_path"?: string | null,"bio"?: string,"created_at"?: string,"display_name"?: string,"headline"?: string,"id": string,"updated_at"?: string
                  }
                  Update: {
                    "avatar_path"?: string | null,"bio"?: string,"created_at"?: string,"display_name"?: string,"headline"?: string,"id"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    
                  ]
                },"resource_technologies": {
                  Row: {
                    "resource_id": number,"technology_id": number
                  }
                  ComputedFields: never
                  Insert: {
                    "resource_id": number,"technology_id": number
                  }
                  Update: {
                    "resource_id"?: number,"technology_id"?: number
                  }
                  Relationships: [
                    {
      foreignKeyName: "resource_technologies_resource_id_fkey"
      columns: ["resource_id"]
isOneToOne: false
      referencedRelation: "resources"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "resource_technologies_technology_id_fkey"
      columns: ["technology_id"]
isOneToOne: false
      referencedRelation: "technologies"
      referencedColumns: ["id"]
    }
                  ]
                },"resources": {
                  Row: {
                    "created_at": string,"created_by": string | null,"curator_note": string | null,"department_id": number,"description": string,"duration_label": string | null,"id": number,"is_featured": boolean,"language": string,"level": Database["public"]['Enums']["difficulty_level"],"pricing": Database["public"]['Enums']["pricing_model"],"published_at": string | null,"publisher": string,"search": unknown,"slug": string,"source_kind": Database["public"]['Enums']["source_kind"],"status": Database["public"]['Enums']["content_status"],"subcategory_id": number | null,"title": string,"type": Database["public"]['Enums']["resource_type"],"updated_at": string,"url": string | null,"url_checked_at": string | null,"url_http_status": number | null,"url_status": Database["public"]['Enums']["url_check_status"]
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"created_by"?: string | null,"curator_note"?: string | null,"department_id": number,"description": string,"duration_label"?: string | null,"id"?: never,"is_featured"?: boolean,"language"?: string,"level": Database["public"]['Enums']["difficulty_level"],"pricing"?: Database["public"]['Enums']["pricing_model"],"published_at"?: string | null,"publisher": string,"search"?: never,"slug": string,"source_kind": Database["public"]['Enums']["source_kind"],"status"?: Database["public"]['Enums']["content_status"],"subcategory_id"?: number | null,"title": string,"type": Database["public"]['Enums']["resource_type"],"updated_at"?: string,"url"?: string | null,"url_checked_at"?: string | null,"url_http_status"?: number | null,"url_status"?: Database["public"]['Enums']["url_check_status"]
                  }
                  Update: {
                    "created_at"?: string,"created_by"?: string | null,"curator_note"?: string | null,"department_id"?: number,"description"?: string,"duration_label"?: string | null,"id"?: never,"is_featured"?: boolean,"language"?: string,"level"?: Database["public"]['Enums']["difficulty_level"],"pricing"?: Database["public"]['Enums']["pricing_model"],"published_at"?: string | null,"publisher"?: string,"search"?: never,"slug"?: string,"source_kind"?: Database["public"]['Enums']["source_kind"],"status"?: Database["public"]['Enums']["content_status"],"subcategory_id"?: number | null,"title"?: string,"type"?: Database["public"]['Enums']["resource_type"],"updated_at"?: string,"url"?: string | null,"url_checked_at"?: string | null,"url_http_status"?: number | null,"url_status"?: Database["public"]['Enums']["url_check_status"]
                  }
                  Relationships: [
                    {
      foreignKeyName: "resources_department_id_fkey"
      columns: ["department_id"]
isOneToOne: false
      referencedRelation: "departments"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "resources_subcategory_id_fkey"
      columns: ["subcategory_id"]
isOneToOne: false
      referencedRelation: "subcategories"
      referencedColumns: ["id"]
    }
                  ]
                },"roadmap_resources": {
                  Row: {
                    "is_optional": boolean,"position": number,"resource_id": number,"stage_id": number
                  }
                  ComputedFields: never
                  Insert: {
                    "is_optional"?: boolean,"position"?: number,"resource_id": number,"stage_id": number
                  }
                  Update: {
                    "is_optional"?: boolean,"position"?: number,"resource_id"?: number,"stage_id"?: number
                  }
                  Relationships: [
                    {
      foreignKeyName: "roadmap_resources_resource_id_fkey"
      columns: ["resource_id"]
isOneToOne: false
      referencedRelation: "resources"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "roadmap_resources_stage_id_fkey"
      columns: ["stage_id"]
isOneToOne: false
      referencedRelation: "roadmap_stages"
      referencedColumns: ["id"]
    }
                  ]
                },"roadmap_stage_technologies": {
                  Row: {
                    "stage_id": number,"technology_id": number
                  }
                  ComputedFields: never
                  Insert: {
                    "stage_id": number,"technology_id": number
                  }
                  Update: {
                    "stage_id"?: number,"technology_id"?: number
                  }
                  Relationships: [
                    {
      foreignKeyName: "roadmap_stage_technologies_stage_id_fkey"
      columns: ["stage_id"]
isOneToOne: false
      referencedRelation: "roadmap_stages"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "roadmap_stage_technologies_technology_id_fkey"
      columns: ["technology_id"]
isOneToOne: false
      referencedRelation: "technologies"
      referencedColumns: ["id"]
    }
                  ]
                },"roadmap_stages": {
                  Row: {
                    "created_at": string,"estimated_duration": string | null,"id": number,"position": number,"projects": NonNullable<Json>,"roadmap_id": number,"skills": (string)[],"summary": string,"title": string,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"estimated_duration"?: string | null,"id"?: never,"position": number,"projects"?: NonNullable<Json>,"roadmap_id": number,"skills"?: (string)[],"summary"?: string,"title": string,"updated_at"?: string
                  }
                  Update: {
                    "created_at"?: string,"estimated_duration"?: string | null,"id"?: never,"position"?: number,"projects"?: NonNullable<Json>,"roadmap_id"?: number,"skills"?: (string)[],"summary"?: string,"title"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "roadmap_stages_roadmap_id_fkey"
      columns: ["roadmap_id"]
isOneToOne: false
      referencedRelation: "roadmaps"
      referencedColumns: ["id"]
    }
                  ]
                },"roadmaps": {
                  Row: {
                    "certifications": NonNullable<Json>,"created_at": string,"department_id": number | null,"description": string,"estimated_duration": string | null,"icon": string,"id": number,"is_featured": boolean,"level": Database["public"]['Enums']["difficulty_level"],"outcomes": (string)[],"prerequisites": (string)[],"slug": string,"sort_order": number,"status": Database["public"]['Enums']["content_status"],"summary": string,"title": string,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "certifications"?: NonNullable<Json>,"created_at"?: string,"department_id"?: number | null,"description"?: string,"estimated_duration"?: string | null,"icon"?: string,"id"?: never,"is_featured"?: boolean,"level"?: Database["public"]['Enums']["difficulty_level"],"outcomes"?: (string)[],"prerequisites"?: (string)[],"slug": string,"sort_order"?: number,"status"?: Database["public"]['Enums']["content_status"],"summary"?: string,"title": string,"updated_at"?: string
                  }
                  Update: {
                    "certifications"?: NonNullable<Json>,"created_at"?: string,"department_id"?: number | null,"description"?: string,"estimated_duration"?: string | null,"icon"?: string,"id"?: never,"is_featured"?: boolean,"level"?: Database["public"]['Enums']["difficulty_level"],"outcomes"?: (string)[],"prerequisites"?: (string)[],"slug"?: string,"sort_order"?: number,"status"?: Database["public"]['Enums']["content_status"],"summary"?: string,"title"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "roadmaps_department_id_fkey"
      columns: ["department_id"]
isOneToOne: false
      referencedRelation: "departments"
      referencedColumns: ["id"]
    }
                  ]
                },"subcategories": {
                  Row: {
                    "created_at": string,"department_id": number,"description": string,"id": number,"name": string,"slug": string,"sort_order": number,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"department_id": number,"description"?: string,"id"?: never,"name": string,"slug": string,"sort_order"?: number,"updated_at"?: string
                  }
                  Update: {
                    "created_at"?: string,"department_id"?: number,"description"?: string,"id"?: never,"name"?: string,"slug"?: string,"sort_order"?: number,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "subcategories_department_id_fkey"
      columns: ["department_id"]
isOneToOne: false
      referencedRelation: "departments"
      referencedColumns: ["id"]
    }
                  ]
                },"subcategory_technologies": {
                  Row: {
                    "sort_order": number,"subcategory_id": number,"technology_id": number
                  }
                  ComputedFields: never
                  Insert: {
                    "sort_order"?: number,"subcategory_id": number,"technology_id": number
                  }
                  Update: {
                    "sort_order"?: number,"subcategory_id"?: number,"technology_id"?: number
                  }
                  Relationships: [
                    {
      foreignKeyName: "subcategory_technologies_subcategory_id_fkey"
      columns: ["subcategory_id"]
isOneToOne: false
      referencedRelation: "subcategories"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "subcategory_technologies_technology_id_fkey"
      columns: ["technology_id"]
isOneToOne: false
      referencedRelation: "technologies"
      referencedColumns: ["id"]
    }
                  ]
                },"technologies": {
                  Row: {
                    "created_at": string,"department_id": number,"description": string,"icon": string,"id": number,"is_featured": boolean,"is_published": boolean,"name": string,"official_url": string | null,"short_description": string,"slug": string,"sort_order": number,"topics": (string)[],"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"department_id": number,"description"?: string,"icon"?: string,"id"?: never,"is_featured"?: boolean,"is_published"?: boolean,"name": string,"official_url"?: string | null,"short_description"?: string,"slug": string,"sort_order"?: number,"topics"?: (string)[],"updated_at"?: string
                  }
                  Update: {
                    "created_at"?: string,"department_id"?: number,"description"?: string,"icon"?: string,"id"?: never,"is_featured"?: boolean,"is_published"?: boolean,"name"?: string,"official_url"?: string | null,"short_description"?: string,"slug"?: string,"sort_order"?: number,"topics"?: (string)[],"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "technologies_department_id_fkey"
      columns: ["department_id"]
isOneToOne: false
      referencedRelation: "departments"
      referencedColumns: ["id"]
    }
                  ]
                },"user_progress": {
                  Row: {
                    "completed_at": string | null,"resource_id": number,"started_at": string,"status": Database["public"]['Enums']["progress_status"],"updated_at": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "completed_at"?: string | null,"resource_id": number,"started_at"?: string,"status"?: Database["public"]['Enums']["progress_status"],"updated_at"?: string,"user_id": string
                  }
                  Update: {
                    "completed_at"?: string | null,"resource_id"?: number,"started_at"?: string,"status"?: Database["public"]['Enums']["progress_status"],"updated_at"?: string,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "user_progress_resource_id_fkey"
      columns: ["resource_id"]
isOneToOne: false
      referencedRelation: "resources"
      referencedColumns: ["id"]
    }
                  ]
                },"user_roadmaps": {
                  Row: {
                    "completed_at": string | null,"roadmap_id": number,"started_at": string,"status": Database["public"]['Enums']["roadmap_enrollment_status"],"updated_at": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "completed_at"?: string | null,"roadmap_id": number,"started_at"?: string,"status"?: Database["public"]['Enums']["roadmap_enrollment_status"],"updated_at"?: string,"user_id": string
                  }
                  Update: {
                    "completed_at"?: string | null,"roadmap_id"?: number,"started_at"?: string,"status"?: Database["public"]['Enums']["roadmap_enrollment_status"],"updated_at"?: string,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "user_roadmaps_roadmap_id_fkey"
      columns: ["roadmap_id"]
isOneToOne: false
      referencedRelation: "roadmaps"
      referencedColumns: ["id"]
    }
                  ]
                },"user_roles": {
                  Row: {
                    "granted_at": string,"granted_by": string | null,"role": Database["public"]['Enums']["app_role"],"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "granted_at"?: string,"granted_by"?: string | null,"role": Database["public"]['Enums']["app_role"],"user_id": string
                  }
                  Update: {
                    "granted_at"?: string,"granted_by"?: string | null,"role"?: Database["public"]['Enums']["app_role"],"user_id"?: string
                  }
                  Relationships: [
                    
                  ]
                }
          }
          Views: {
            [_ in never]: never
          }
          Functions: {
            "search_catalog":
{ Args: { "per_group"?: number,"q": string }; Returns: Json
                           },
"search_resources":
{ Args: { "p_department"?: string,"p_levels"?: (Database["public"]['Enums']["difficulty_level"])[],"p_limit"?: number,"p_offset"?: number,"p_pricing"?: (Database["public"]['Enums']["pricing_model"])[],"p_sort"?: string,"p_technology"?: string,"p_types"?: (Database["public"]['Enums']["resource_type"])[],"q"?: string }; Returns: {
              "department_name": string,"department_slug": string,"description": string,"duration_label": string,"id": number,"is_featured": boolean,"language": string,"level": Database["public"]['Enums']["difficulty_level"],"pricing": Database["public"]['Enums']["pricing_model"],"published_at": string,"publisher": string,"rank": number,"slug": string,"source_kind": Database["public"]['Enums']["source_kind"],"technologies": Json,"title": string,"total_count": number,"type": Database["public"]['Enums']["resource_type"],"url": string
            }[]
                           }
          }
          Enums: {
            "app_role": "admin"|"editor","content_status": "draft"|"pending"|"published"|"archived","difficulty_level": "beginner"|"intermediate"|"advanced","pricing_model": "free"|"freemium"|"paid"|"unknown","progress_status": "in_progress"|"completed","resource_type": "documentation"|"video"|"course"|"tutorial"|"book"|"university_lecture"|"interactive"|"repository"|"certification"|"lab"|"article","roadmap_enrollment_status": "active"|"paused"|"completed","source_kind": "official"|"community","url_check_status": "unchecked"|"ok"|"redirected"|"broken"|"blocked"
          }
          CompositeTypes: {
            [_ in never]: never
          }
        }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  "graphql_public": {
          Enums: {
            
          }
        },"public": {
          Enums: {
            "app_role": ["admin", "editor"],"content_status": ["draft", "pending", "published", "archived"],"difficulty_level": ["beginner", "intermediate", "advanced"],"pricing_model": ["free", "freemium", "paid", "unknown"],"progress_status": ["in_progress", "completed"],"resource_type": ["documentation", "video", "course", "tutorial", "book", "university_lecture", "interactive", "repository", "certification", "lab", "article"],"roadmap_enrollment_status": ["active", "paused", "completed"],"source_kind": ["official", "community"],"url_check_status": ["unchecked", "ok", "redirected", "broken", "blocked"]
          }
        }
} as const
