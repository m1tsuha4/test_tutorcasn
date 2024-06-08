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
      Account: {
        Row: {
          access_token: string | null
          expires_at: number | null
          id: string
          id_token: string | null
          refresh_token: string | null
          scope: string | null
          session_state: string | null
          token_type: string | null
          type: string
          userId: string
        }
        Insert: {
          access_token?: string | null
          expires_at?: number | null
          id: string
          id_token?: string | null
          refresh_token?: string | null
          scope?: string | null
          session_state?: string | null
          token_type?: string | null
          type: string
          userId: string
        }
        Update: {
          access_token?: string | null
          expires_at?: number | null
          id?: string
          id_token?: string | null
          refresh_token?: string | null
          scope?: string | null
          session_state?: string | null
          token_type?: string | null
          type?: string
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "Account_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      Category: {
        Row: {
          id: string
          name: string
        }
        Insert: {
          id: string
          name: string
        }
        Update: {
          id?: string
          name?: string
        }
        Relationships: []
      }
      Cordinate: {
        Row: {
          height: number
          highlightedBoundingRectangleId: string | null
          highlightedRectangleId: string | null
          id: string
          markerId: string | null
          pageNumber: number | null
          width: number
          x1: number
          x2: number
          y1: number
          y2: number
        }
        Insert: {
          height: number
          highlightedBoundingRectangleId?: string | null
          highlightedRectangleId?: string | null
          id: string
          markerId?: string | null
          pageNumber?: number | null
          width: number
          x1: number
          x2: number
          y1: number
          y2: number
        }
        Update: {
          height?: number
          highlightedBoundingRectangleId?: string | null
          highlightedRectangleId?: string | null
          id?: string
          markerId?: string | null
          pageNumber?: number | null
          width?: number
          x1?: number
          x2?: number
          y1?: number
          y2?: number
        }
        Relationships: [
          {
            foreignKeyName: "Cordinate_highlightedBoundingRectangleId_fkey"
            columns: ["highlightedBoundingRectangleId"]
            isOneToOne: false
            referencedRelation: "Highlight"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Cordinate_highlightedRectangleId_fkey"
            columns: ["highlightedRectangleId"]
            isOneToOne: false
            referencedRelation: "Highlight"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Cordinate_markerId_fkey"
            columns: ["markerId"]
            isOneToOne: false
            referencedRelation: "Marker"
            referencedColumns: ["id"]
          },
        ]
      }
      Document: {
        Row: {
          createdAt: string
          id: string
          isUploaded: boolean
          isVectorised: boolean
          note: string | null
          subCategoryId: string | null
          title: string
          url: string
        }
        Insert: {
          createdAt?: string
          id: string
          isUploaded?: boolean
          isVectorised?: boolean
          note?: string | null
          subCategoryId?: string | null
          title: string
          url: string
        }
        Update: {
          createdAt?: string
          id?: string
          isUploaded?: boolean
          isVectorised?: boolean
          note?: string | null
          subCategoryId?: string | null
          title?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "Document_subCategoryId_fkey"
            columns: ["subCategoryId"]
            isOneToOne: false
            referencedRelation: "Subcategory"
            referencedColumns: ["id"]
          },
        ]
      }
      Feedback: {
        Row: {
          contact_email: string | null
          createdAt: string
          id: string
          message: string
          type: string
          userId: string | null
        }
        Insert: {
          contact_email?: string | null
          createdAt?: string
          id: string
          message: string
          type: string
          userId?: string | null
        }
        Update: {
          contact_email?: string | null
          createdAt?: string
          id?: string
          message?: string
          type?: string
          userId?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "Feedback_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      Flashcard: {
        Row: {
          answer: string
          createdAt: string
          documentId: string
          id: string
          question: string
        }
        Insert: {
          answer: string
          createdAt?: string
          documentId: string
          id: string
          question: string
        }
        Update: {
          answer?: string
          createdAt?: string
          documentId?: string
          id?: string
          question?: string
        }
        Relationships: [
          {
            foreignKeyName: "Flashcard_documentId_fkey"
            columns: ["documentId"]
            isOneToOne: false
            referencedRelation: "Document"
            referencedColumns: ["id"]
          },
        ]
      }
      FlashcardAttempt: {
        Row: {
          correctResponse: string | null
          createdAt: string
          flashcardId: string
          id: string
          incorrectResponse: string | null
          moreInfo: string | null
          userId: string
          userResponse: string
        }
        Insert: {
          correctResponse?: string | null
          createdAt?: string
          flashcardId: string
          id: string
          incorrectResponse?: string | null
          moreInfo?: string | null
          userId: string
          userResponse: string
        }
        Update: {
          correctResponse?: string | null
          createdAt?: string
          flashcardId?: string
          id?: string
          incorrectResponse?: string | null
          moreInfo?: string | null
          userId?: string
          userResponse?: string
        }
        Relationships: [
          {
            foreignKeyName: "FlashcardAttempt_flashcardId_fkey"
            columns: ["flashcardId"]
            isOneToOne: false
            referencedRelation: "Flashcard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "FlashcardAttempt_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      Highlight: {
        Row: {
          createdAt: string
          documentId: string
          id: string
          pageNumber: number | null
          type: Database["public"]["Enums"]["HighlightTypeEnum"]
        }
        Insert: {
          createdAt?: string
          documentId: string
          id: string
          pageNumber?: number | null
          type: Database["public"]["Enums"]["HighlightTypeEnum"]
        }
        Update: {
          createdAt?: string
          documentId?: string
          id?: string
          pageNumber?: number | null
          type?: Database["public"]["Enums"]["HighlightTypeEnum"]
        }
        Relationships: [
          {
            foreignKeyName: "Highlight_documentId_fkey"
            columns: ["documentId"]
            isOneToOne: false
            referencedRelation: "Document"
            referencedColumns: ["id"]
          },
        ]
      }
      Marker: {
        Row: {
          count: number
          documentId: string
          id: string
          keyword: string
          messageId: string | null
        }
        Insert: {
          count: number
          documentId: string
          id: string
          keyword: string
          messageId?: string | null
        }
        Update: {
          count?: number
          documentId?: string
          id?: string
          keyword?: string
          messageId?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "Marker_documentId_fkey"
            columns: ["documentId"]
            isOneToOne: false
            referencedRelation: "Document"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Marker_messageId_fkey"
            columns: ["messageId"]
            isOneToOne: false
            referencedRelation: "Message"
            referencedColumns: ["id"]
          },
        ]
      }
      Message: {
        Row: {
          createdAt: string
          documentId: string
          id: string
          isUserMessage: boolean
          text: string
          userId: string | null
        }
        Insert: {
          createdAt?: string
          documentId: string
          id: string
          isUserMessage: boolean
          text: string
          userId?: string | null
        }
        Update: {
          createdAt?: string
          documentId?: string
          id?: string
          isUserMessage?: boolean
          text?: string
          userId?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "Message_documentId_fkey"
            columns: ["documentId"]
            isOneToOne: false
            referencedRelation: "Document"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Message_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      Subcategory: {
        Row: {
          categoryId: string
          id: string
          name: string
        }
        Insert: {
          categoryId: string
          id: string
          name: string
        }
        Update: {
          categoryId?: string
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "Subcategory_categoryId_fkey"
            columns: ["categoryId"]
            isOneToOne: false
            referencedRelation: "Category"
            referencedColumns: ["id"]
          },
        ]
      }
      User: {
        Row: {
          createdAt: string
          email: string | null
          emailVerified: string | null
          id: string
          image: string | null
          name: string
          password: string
          Role: Database["public"]["Enums"]["Role"]
        }
        Insert: {
          createdAt?: string
          email?: string | null
          emailVerified?: string | null
          id: string
          image?: string | null
          name: string
          password: string
          Role?: Database["public"]["Enums"]["Role"]
        }
        Update: {
          createdAt?: string
          email?: string | null
          emailVerified?: string | null
          id?: string
          image?: string | null
          name?: string
          password?: string
          Role?: Database["public"]["Enums"]["Role"]
        }
        Relationships: []
      }
      UserDocument: {
        Row: {
          documentId: string
          userId: string
        }
        Insert: {
          documentId: string
          userId: string
        }
        Update: {
          documentId?: string
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "UserDocument_documentId_fkey"
            columns: ["documentId"]
            isOneToOne: false
            referencedRelation: "Document"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "UserDocument_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
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
      HighlightTypeEnum: "TEXT" | "IMAGE"
      Role: "ADMIN" | "USER" | "PREMIUM"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never
