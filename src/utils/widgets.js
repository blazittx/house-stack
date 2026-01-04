// Widget metadata and utilities
export const WIDGET_INFO = {
  'split-amount': { name: 'Split Amount', icon: '$' },
  'swish-details': { name: 'Swish Details', icon: 'S' },
  'recipient-emails': { name: 'Recipient Emails', icon: '@' },
}

export const getWidgetDisplayName = (widgetType) => {
  return WIDGET_INFO[widgetType]?.name || widgetType
}

export const getWidgetIcon = (widgetType) => {
  return WIDGET_INFO[widgetType]?.icon || '??'
}
