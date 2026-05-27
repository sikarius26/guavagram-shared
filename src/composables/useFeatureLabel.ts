// Map PlatformFeatureTypeEnum (numeric ids from Guava Platform) → human label.
// NO es "datos de planes hardcoded" — los planes (precio, daysTrial, qué
// features incluye, plan name/description) vienen 100% del catálogo de Guava
// vía `billingPlansAvailable`. Esto es solo i18n: traducir el id numérico del
// enum a un texto que el usuario entienda en la UI.
//
// Si Guava añade un feature nuevo (id 54+), añade una línea aquí. Si falta,
// `featureLabel()` devuelve "Feature #54" — la card sigue funcionando.

// Enum values mirrored from
// guavagram-admin/app/services/apis/models/platform-feature-type-enum.ts
// (el enum es código generado por NSwag desde el backend; no se considera
// "hardcoded de negocio").
const FEATURE_LABELS: Record<number, string> = {
  1: 'Carta digital',
  2: 'Pedidos en sala',
  3: 'Pagos en local',
  4: 'Inventario',
  5: 'Empleados y turnos',
  6: 'Documentos',
  7: 'Proveedores',
  8: 'Reservas',
  9: 'Márgenes',
  10: 'CRM',
  11: 'Cola virtual',
  12: 'Campañas',
  13: 'Pedidos online',
  14: 'Cierres de caja',
  15: 'Eventos',
  16: 'Automatizaciones de marketing',
  17: 'KDS (cocina)',
  18: 'Empleados',
  19: 'Cupones',
  20: 'Asistente IA',
  21: 'Informes avanzados',
  22: 'Forecasting',
  23: 'Multi-local',
  24: 'Planificación de inventario',
  25: 'Tareas de empleados',
  26: 'Generación de turnos',
  27: 'Generación con IA',
  28: 'Fotos en la carta',
  29: 'Página de perfil',
  30: 'Notificaciones SMS al cliente',
  31: 'Reservas online',
  32: 'Reseñas',
  33: 'Agente telefónico',
  34: 'Notificaciones email al cliente',
  35: 'Verificación de reservas',
  36: 'Finanzas',
  37: 'Pedidos a proveedores',
  38: 'Operaciones de inventario',
  39: 'Recetas',
  40: 'Resumen diario por email',
  41: 'Registro de actividad',
  42: 'Enlaces de pago',
  43: 'Pagos en reservas',
  44: 'Análisis de competencia',
  45: 'Lista de espera',
  46: 'Equipamiento',
  47: 'Feedback de clientes',
  48: 'Mensajes a clientes',
  49: 'Agente WhatsApp',
  50: 'Tarjetas regalo',
  51: 'Programa de fidelización',
  52: 'Plantillas imprimibles',
  53: 'Gestión web',
}

export function featureLabel(featureTypeId: number | undefined | null): string {
  if (featureTypeId == null) return ''
  return FEATURE_LABELS[featureTypeId] ?? `Feature #${featureTypeId}`
}

// Material Design Icons por module key (GuavaModule). Igual razonamiento que
// FEATURE_LABELS: i18n/UI, no datos de planes — el name/price/features viene
// 100% del catálogo. Si añades un módulo nuevo en MODULE_TO_FEATURE, añade
// su icono aquí.
const MODULE_ICONS: Record<string, string> = {
  orders: 'mdi-shopping-outline',
  bookings: 'mdi-calendar-check',
  marketing: 'mdi-bullhorn-outline',
  inventory: 'mdi-package-variant',
  employees: 'mdi-account-group-outline',
  analytics: 'mdi-chart-line',
}

export function moduleIcon(module: string | undefined | null): string {
  if (!module) return 'mdi-rocket-launch-outline'
  return MODULE_ICONS[module] ?? 'mdi-rocket-launch-outline'
}

export function useFeatureLabel() {
  return { featureLabel, moduleIcon }
}
