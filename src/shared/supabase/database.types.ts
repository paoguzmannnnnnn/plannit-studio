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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      carrito_items: {
        Row: {
          cantidad: number
          created_at: string
          evento_id: string
          id: string
          personalizacion: Json
          producto_id: string
        }
        Insert: {
          cantidad?: number
          created_at?: string
          evento_id: string
          id?: string
          personalizacion?: Json
          producto_id: string
        }
        Update: {
          cantidad?: number
          created_at?: string
          evento_id?: string
          id?: string
          personalizacion?: Json
          producto_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "carrito_items_evento_id_fkey"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "eventos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "carrito_items_producto_id_fkey"
            columns: ["producto_id"]
            isOneToOne: false
            referencedRelation: "productos"
            referencedColumns: ["id"]
          },
        ]
      }
      categorias: {
        Row: {
          id: number
          nombre: string
        }
        Insert: {
          id?: never
          nombre: string
        }
        Update: {
          id?: never
          nombre?: string
        }
        Relationships: []
      }
      conversaciones: {
        Row: {
          cliente_id: string
          created_at: string
          emprendimiento_id: string
          id: string
          ultimo_mensaje_at: string | null
        }
        Insert: {
          cliente_id: string
          created_at?: string
          emprendimiento_id: string
          id?: string
          ultimo_mensaje_at?: string | null
        }
        Update: {
          cliente_id?: string
          created_at?: string
          emprendimiento_id?: string
          id?: string
          ultimo_mensaje_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversaciones_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversaciones_emprendimiento_id_fkey"
            columns: ["emprendimiento_id"]
            isOneToOne: false
            referencedRelation: "emprendimientos"
            referencedColumns: ["id"]
          },
        ]
      }
      emprendimiento_zonas: {
        Row: {
          costo_envio_centavos: number
          emprendimiento_id: string
          zona_id: number
        }
        Insert: {
          costo_envio_centavos?: number
          emprendimiento_id: string
          zona_id: number
        }
        Update: {
          costo_envio_centavos?: number
          emprendimiento_id?: string
          zona_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "emprendimiento_zonas_emprendimiento_id_fkey"
            columns: ["emprendimiento_id"]
            isOneToOne: false
            referencedRelation: "emprendimientos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "emprendimiento_zonas_zona_id_fkey"
            columns: ["zona_id"]
            isOneToOne: false
            referencedRelation: "zonas"
            referencedColumns: ["id"]
          },
        ]
      }
      emprendimientos: {
        Row: {
          aprobado: boolean
          created_at: string
          descripcion: string | null
          id: string
          logo_url: string | null
          nombre: string
          owner_id: string
          rating_promedio: number
          total_resenas: number
        }
        Insert: {
          aprobado?: boolean
          created_at?: string
          descripcion?: string | null
          id?: string
          logo_url?: string | null
          nombre: string
          owner_id: string
          rating_promedio?: number
          total_resenas?: number
        }
        Update: {
          aprobado?: boolean
          created_at?: string
          descripcion?: string | null
          id?: string
          logo_url?: string | null
          nombre?: string
          owner_id?: string
          rating_promedio?: number
          total_resenas?: number
        }
        Relationships: [
          {
            foreignKeyName: "emprendimientos_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      eventos: {
        Row: {
          cliente_id: string
          created_at: string
          direccion: string
          fecha_entrega: string
          id: string
          nombre: string
          tipo: string
          zona_id: number
        }
        Insert: {
          cliente_id: string
          created_at?: string
          direccion: string
          fecha_entrega: string
          id?: string
          nombre: string
          tipo: string
          zona_id: number
        }
        Update: {
          cliente_id?: string
          created_at?: string
          direccion?: string
          fecha_entrega?: string
          id?: string
          nombre?: string
          tipo?: string
          zona_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "eventos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "eventos_zona_id_fkey"
            columns: ["zona_id"]
            isOneToOne: false
            referencedRelation: "zonas"
            referencedColumns: ["id"]
          },
        ]
      }
      fechas_bloqueadas: {
        Row: {
          emprendimiento_id: string
          fecha: string
        }
        Insert: {
          emprendimiento_id: string
          fecha: string
        }
        Update: {
          emprendimiento_id?: string
          fecha?: string
        }
        Relationships: [
          {
            foreignKeyName: "fechas_bloqueadas_emprendimiento_id_fkey"
            columns: ["emprendimiento_id"]
            isOneToOne: false
            referencedRelation: "emprendimientos"
            referencedColumns: ["id"]
          },
        ]
      }
      mensajes: {
        Row: {
          autor_id: string
          conversacion_id: string
          created_at: string
          id: string
          imagen_url: string | null
          leido_at: string | null
          pedido_id: string | null
          texto: string | null
        }
        Insert: {
          autor_id: string
          conversacion_id: string
          created_at?: string
          id?: string
          imagen_url?: string | null
          leido_at?: string | null
          pedido_id?: string | null
          texto?: string | null
        }
        Update: {
          autor_id?: string
          conversacion_id?: string
          created_at?: string
          id?: string
          imagen_url?: string | null
          leido_at?: string | null
          pedido_id?: string | null
          texto?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mensajes_autor_id_fkey"
            columns: ["autor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mensajes_conversacion_id_fkey"
            columns: ["conversacion_id"]
            isOneToOne: false
            referencedRelation: "conversaciones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mensajes_pedido_id_fkey"
            columns: ["pedido_id"]
            isOneToOne: false
            referencedRelation: "pedidos"
            referencedColumns: ["id"]
          },
        ]
      }
      ordenes: {
        Row: {
          cliente_id: string
          created_at: string
          evento_id: string
          id: string
          total_centavos: number
        }
        Insert: {
          cliente_id: string
          created_at?: string
          evento_id: string
          id?: string
          total_centavos?: number
        }
        Update: {
          cliente_id?: string
          created_at?: string
          evento_id?: string
          id?: string
          total_centavos?: number
        }
        Relationships: [
          {
            foreignKeyName: "ordenes_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ordenes_evento_id_fkey"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "eventos"
            referencedColumns: ["id"]
          },
        ]
      }
      pedido_items: {
        Row: {
          cantidad: number
          id: string
          pedido_id: string
          personalizacion: Json
          precio_unitario_centavos: number
          producto_id: string
        }
        Insert: {
          cantidad: number
          id?: string
          pedido_id: string
          personalizacion?: Json
          precio_unitario_centavos: number
          producto_id: string
        }
        Update: {
          cantidad?: number
          id?: string
          pedido_id?: string
          personalizacion?: Json
          precio_unitario_centavos?: number
          producto_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pedido_items_pedido_id_fkey"
            columns: ["pedido_id"]
            isOneToOne: false
            referencedRelation: "pedidos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pedido_items_producto_id_fkey"
            columns: ["producto_id"]
            isOneToOne: false
            referencedRelation: "productos"
            referencedColumns: ["id"]
          },
        ]
      }
      pedidos: {
        Row: {
          aceptado_at: string | null
          costo_envio_centavos: number
          emprendimiento_id: string
          estado: Database["public"]["Enums"]["estado_pedido"]
          expira_at: string | null
          fecha_entrega: string
          id: string
          motivo_rechazo: string | null
          orden_id: string
          pagado_at: string | null
          requiere_aceptacion: boolean
          solicitado_at: string
          subtotal_centavos: number
        }
        Insert: {
          aceptado_at?: string | null
          costo_envio_centavos?: number
          emprendimiento_id: string
          estado: Database["public"]["Enums"]["estado_pedido"]
          expira_at?: string | null
          fecha_entrega: string
          id?: string
          motivo_rechazo?: string | null
          orden_id: string
          pagado_at?: string | null
          requiere_aceptacion: boolean
          solicitado_at?: string
          subtotal_centavos: number
        }
        Update: {
          aceptado_at?: string | null
          costo_envio_centavos?: number
          emprendimiento_id?: string
          estado?: Database["public"]["Enums"]["estado_pedido"]
          expira_at?: string | null
          fecha_entrega?: string
          id?: string
          motivo_rechazo?: string | null
          orden_id?: string
          pagado_at?: string | null
          requiere_aceptacion?: boolean
          solicitado_at?: string
          subtotal_centavos?: number
        }
        Relationships: [
          {
            foreignKeyName: "pedidos_emprendimiento_id_fkey"
            columns: ["emprendimiento_id"]
            isOneToOne: false
            referencedRelation: "emprendimientos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pedidos_orden_id_fkey"
            columns: ["orden_id"]
            isOneToOne: false
            referencedRelation: "ordenes"
            referencedColumns: ["id"]
          },
        ]
      }
      producto_fotos: {
        Row: {
          id: string
          orden: number
          producto_id: string
          url: string
        }
        Insert: {
          id?: string
          orden?: number
          producto_id: string
          url: string
        }
        Update: {
          id?: string
          orden?: number
          producto_id?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "producto_fotos_producto_id_fkey"
            columns: ["producto_id"]
            isOneToOne: false
            referencedRelation: "productos"
            referencedColumns: ["id"]
          },
        ]
      }
      productos: {
        Row: {
          activo: boolean
          anticipacion_horas: number
          categoria_id: number
          created_at: string
          cupo_diario: number | null
          descripcion: string | null
          emprendimiento_id: string
          id: string
          nombre: string
          permite_colores: boolean
          permite_referencia: boolean
          permite_texto: boolean
          precio_centavos: number
          stock_por_fecha: number | null
          tipo: Database["public"]["Enums"]["tipo_producto"]
        }
        Insert: {
          activo?: boolean
          anticipacion_horas?: number
          categoria_id: number
          created_at?: string
          cupo_diario?: number | null
          descripcion?: string | null
          emprendimiento_id: string
          id?: string
          nombre: string
          permite_colores?: boolean
          permite_referencia?: boolean
          permite_texto?: boolean
          precio_centavos: number
          stock_por_fecha?: number | null
          tipo: Database["public"]["Enums"]["tipo_producto"]
        }
        Update: {
          activo?: boolean
          anticipacion_horas?: number
          categoria_id?: number
          created_at?: string
          cupo_diario?: number | null
          descripcion?: string | null
          emprendimiento_id?: string
          id?: string
          nombre?: string
          permite_colores?: boolean
          permite_referencia?: boolean
          permite_texto?: boolean
          precio_centavos?: number
          stock_por_fecha?: number | null
          tipo?: Database["public"]["Enums"]["tipo_producto"]
        }
        Relationships: [
          {
            foreignKeyName: "productos_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "categorias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "productos_emprendimiento_id_fkey"
            columns: ["emprendimiento_id"]
            isOneToOne: false
            referencedRelation: "emprendimientos"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          id: string
          nombre: string
          rol: Database["public"]["Enums"]["rol_usuario"]
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          id: string
          nombre: string
          rol?: Database["public"]["Enums"]["rol_usuario"]
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          id?: string
          nombre?: string
          rol?: Database["public"]["Enums"]["rol_usuario"]
        }
        Relationships: []
      }
      resena_fotos: {
        Row: {
          id: string
          resena_id: string
          url: string
        }
        Insert: {
          id?: string
          resena_id: string
          url: string
        }
        Update: {
          id?: string
          resena_id?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "resena_fotos_resena_id_fkey"
            columns: ["resena_id"]
            isOneToOne: false
            referencedRelation: "resenas"
            referencedColumns: ["id"]
          },
        ]
      }
      resenas: {
        Row: {
          cliente_id: string
          comentario: string | null
          created_at: string
          emprendimiento_id: string
          estrellas: number
          id: string
          pedido_id: string
          respondida_at: string | null
          respuesta: string | null
        }
        Insert: {
          cliente_id: string
          comentario?: string | null
          created_at?: string
          emprendimiento_id: string
          estrellas: number
          id?: string
          pedido_id: string
          respondida_at?: string | null
          respuesta?: string | null
        }
        Update: {
          cliente_id?: string
          comentario?: string | null
          created_at?: string
          emprendimiento_id?: string
          estrellas?: number
          id?: string
          pedido_id?: string
          respondida_at?: string | null
          respuesta?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "resenas_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resenas_emprendimiento_id_fkey"
            columns: ["emprendimiento_id"]
            isOneToOne: false
            referencedRelation: "emprendimientos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resenas_pedido_id_fkey"
            columns: ["pedido_id"]
            isOneToOne: true
            referencedRelation: "pedidos"
            referencedColumns: ["id"]
          },
        ]
      }
      transiciones_pedido: {
        Row: {
          actor: Database["public"]["Enums"]["rol_usuario"]
          desde: Database["public"]["Enums"]["estado_pedido"]
          hacia: Database["public"]["Enums"]["estado_pedido"]
        }
        Insert: {
          actor: Database["public"]["Enums"]["rol_usuario"]
          desde: Database["public"]["Enums"]["estado_pedido"]
          hacia: Database["public"]["Enums"]["estado_pedido"]
        }
        Update: {
          actor?: Database["public"]["Enums"]["rol_usuario"]
          desde?: Database["public"]["Enums"]["estado_pedido"]
          hacia?: Database["public"]["Enums"]["estado_pedido"]
        }
        Relationships: []
      }
      zonas: {
        Row: {
          id: number
          nombre: string
        }
        Insert: {
          id?: never
          nombre: string
        }
        Update: {
          id?: never
          nombre?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      _disponibilidad: {
        Args: { p_evento_id: string }
        Returns: {
          costo_envio_centavos: number
          disponibles: number
          producto_id: string
        }[]
      }
      actualizar_emprendimiento: {
        Args: {
          p_descripcion?: string
          p_logo_url?: string
          p_nombre: string
          p_zonas: Json
        }
        Returns: undefined
      }
      cambiar_estado_pedido: {
        Args: {
          p_motivo?: string
          p_nuevo_estado: Database["public"]["Enums"]["estado_pedido"]
          p_pedido_id: string
        }
        Returns: undefined
      }
      crear_emprendimiento: {
        Args: {
          p_descripcion?: string
          p_logo_url?: string
          p_nombre: string
          p_zonas: Json
        }
        Returns: string
      }
      crear_orden: { Args: { p_evento_id: string }; Returns: string }
      dia_local: { Args: { p_momento: string }; Returns: string }
      disponibilidad_evento: {
        Args: { p_evento_id: string }
        Returns: {
          costo_envio_centavos: number
          disponibles: number
          producto_id: string
        }[]
      }
      emprendedor_tiene_evento: {
        Args: { p_evento_id: string }
        Returns: boolean
      }
      es_dueno_emprendimiento: {
        Args: { p_emprendimiento_id: string }
        Returns: boolean
      }
      es_participante: { Args: { p_conversacion_id: string }; Returns: boolean }
      estados_que_ocupan: {
        Args: never
        Returns: Database["public"]["Enums"]["estado_pedido"][]
      }
      expirar_pedidos: { Args: never; Returns: number }
      mi_rol: {
        Args: never
        Returns: Database["public"]["Enums"]["rol_usuario"]
      }
      productos_disponibles: {
        Args: {
          p_evento_id: string
          p_tipo: Database["public"]["Enums"]["tipo_producto"]
        }
        Returns: {
          anticipacion_horas: number
          costo_envio_centavos: number
          disponibles: number
          emprendimiento_id: string
          emprendimiento_nombre: string
          foto_url: string
          nombre: string
          precio_centavos: number
          producto_id: string
          rating_promedio: number
          total_resenas: number
        }[]
      }
    }
    Enums: {
      estado_pedido:
        | "solicitado"
        | "aceptado"
        | "rechazado"
        | "expirado"
        | "pagado"
        | "en_preparacion"
        | "entregado"
        | "completado"
        | "cancelado"
      rol_usuario: "cliente" | "emprendedor"
      tipo_producto: "inmediato" | "personalizable"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      estado_pedido: [
        "solicitado",
        "aceptado",
        "rechazado",
        "expirado",
        "pagado",
        "en_preparacion",
        "entregado",
        "completado",
        "cancelado",
      ],
      rol_usuario: ["cliente", "emprendedor"],
      tipo_producto: ["inmediato", "personalizable"],
    },
  },
} as const
