import { useState } from 'react'
import { snapToGrid, snapSizeToGrid, constrainToViewport } from '../utils/grid'
import { getWidgetMinSize } from '../constants/grid'
import { GRID_OFFSET_X, GRID_OFFSET_Y } from '../constants/grid'
import { DEFAULT_HOMEPAGE_LAYOUT, DEFAULT_HOMEPAGE_LAYOUT_MOBILE } from '../utils/setDefaultLayouts'
import { isMobile } from '../utils/mobile'
import AmountSplitWidget from '../components/AmountSplitWidget'
import SwishDetailsWidget from '../components/SwishDetailsWidget'
import RecipientEmailsWidget from '../components/RecipientEmailsWidget'

// Component mapping - exported for use in other components
export const componentMap = {
  'split-amount': AmountSplitWidget,
  'swish-details': SwishDetailsWidget,
  'recipient-emails': RecipientEmailsWidget,
}

export const useWidgets = (view = 'main') => {
  const mobile = isMobile()
  
  // Initialize widget positions from default layouts
  const [widgets, setWidgets] = useState(() => {
    // For game-detail and cv-detail views, return empty array - let their respective views handle initialization
    if (view === 'game-detail' || view === 'cv-detail') {
      return []
    }
    
    try {
      const layoutToUse = mobile ? DEFAULT_HOMEPAGE_LAYOUT_MOBILE : DEFAULT_HOMEPAGE_LAYOUT
      return layoutToUse
        .map(widget => {
          try {
            // Don't enforce usable area bounds when loading saved layouts - just ensure visibility
            const constrainedPos = constrainToViewport(widget.x, widget.y, widget.width, widget.height, { x: 0, y: 0 }, false)
            
            // Always use widget.type to look up component (not widget.id, which may have suffixes like -1, -2)
            const component = componentMap[widget.type]
            
            // Only include widgets with valid components
            if (!component) {
              console.warn(`Widget component not found for type: ${widget.type}, id: ${widget.id}`)
              return null
            }
            
            const settings = widget.settings || {}
            
            // Preserve EXACT saved sizes and positions - don't modify them at all
            // Only ensure they're valid numbers
            const finalWidth = typeof widget.width === 'number' && widget.width > 0 ? widget.width : getWidgetMinSize(widget.type).width
            const finalHeight = typeof widget.height === 'number' && widget.height > 0 ? widget.height : getWidgetMinSize(widget.type).height
            
            return {
              ...widget,
              x: constrainedPos.x,
              y: constrainedPos.y,
              width: finalWidth,
              height: finalHeight,
              component: component,
              locked: widget.locked || false,
              pinned: widget.pinned || false,
              settings: settings
            }
          } catch (error) {
            console.error(`Error creating widget ${widget.id}:`, error)
            return null
          }
        })
        .filter(widget => widget !== null)
    } catch (error) {
      console.error('Error creating default widget layout:', error)
      // Return minimal safe layout
      return [
        {
          id: 'split-amount',
          type: 'split-amount',
          x: snapToGrid(100, GRID_OFFSET_X),
          y: snapToGrid(100, GRID_OFFSET_Y),
          width: snapSizeToGrid(270),
          height: snapSizeToGrid(180),
          component: AmountSplitWidget,
          locked: false,
          pinned: false
        }
      ]
    }
  })

  return [widgets, setWidgets]
}
