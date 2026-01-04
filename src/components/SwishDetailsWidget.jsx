import { useEffect, useState } from 'react'
import BaseWidget from './BaseWidget'
import { getCookie, setCookie } from '../utils/cookies'

/* eslint-disable react/prop-types */
export default function SwishDetailsWidget({ widget }) {
  const [details, setDetails] = useState(() => ({
    swishNumber: widget?.settings?.swishNumber || '',
    swishName: widget?.settings?.swishName || '',
    swishMessage: widget?.settings?.swishMessage || '',
  }))

  useEffect(() => {
    const cookieDetails = {
      swishNumber: getCookie('houseStackSwishNumber'),
      swishName: getCookie('houseStackSwishName'),
      swishMessage: getCookie('houseStackSwishMessage'),
    }
    const next = {
      swishNumber: widget?.settings?.swishNumber || cookieDetails.swishNumber || '',
      swishName: widget?.settings?.swishName || cookieDetails.swishName || '',
      swishMessage: widget?.settings?.swishMessage || cookieDetails.swishMessage || '',
    }
    setDetails(next)
    widget?.onSettingsChange?.(next)
  }, [])

  useEffect(() => {
    setDetails({
      swishNumber: widget?.settings?.swishNumber || '',
      swishName: widget?.settings?.swishName || '',
      swishMessage: widget?.settings?.swishMessage || '',
    })
  }, [widget?.settings?.swishMessage, widget?.settings?.swishName, widget?.settings?.swishNumber])

  const updateField = (field) => (event) => {
    const nextValue = event.target.value
    setDetails((prev) => {
      const next = { ...prev, [field]: nextValue }
      if (field === 'swishNumber') setCookie('houseStackSwishNumber', next.swishNumber)
      if (field === 'swishName') setCookie('houseStackSwishName', next.swishName)
      if (field === 'swishMessage') setCookie('houseStackSwishMessage', next.swishMessage)
      widget?.onSettingsChange?.(next) 
      return next
    })
  }

  return (
    <BaseWidget padding="1.25rem">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', height: '100%' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          <span style={{ fontSize: '0.75rem', letterSpacing: '0.18em', textTransform: 'uppercase', opacity: 0.6 }}>
            Swish details
          </span>
          <span style={{ fontSize: '0.75rem', opacity: 0.5 }}>
            These values are used in the payment request link.
          </span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', flex: 1 }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', fontSize: '0.75rem', opacity: 0.7 }}>
            Swish number
            <input
              type="tel"
              placeholder="07x xxx xx xx"
              value={details.swishNumber}
              onChange={updateField('swishNumber')}
              style={{
                background: 'transparent',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '6px',
                color: 'canvasText',
                padding: '0.45rem 0.6rem',
                fontSize: '0.9rem',
                fontFamily: 'inherit',
              }}
            />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', fontSize: '0.75rem', opacity: 0.7 }}>
            Payee name
            <input
              type="text"
              placeholder="Name shown in Swish"
              value={details.swishName}
              onChange={updateField('swishName')}
              style={{
                background: 'transparent',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '6px',
                color: 'canvasText',
                padding: '0.45rem 0.6rem',
                fontSize: '0.9rem',
                fontFamily: 'inherit',
              }}
            />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', fontSize: '0.75rem', opacity: 0.7 }}>
            Message
            <input
              type="text"
              placeholder="Dinner, rent, utilities..."
              value={details.swishMessage}
              onChange={updateField('swishMessage')}
              style={{
                background: 'transparent',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '6px',
                color: 'canvasText',
                padding: '0.45rem 0.6rem',
                fontSize: '0.9rem',
                fontFamily: 'inherit',
              }}
            />
          </label>
        </div>
      </div>
    </BaseWidget>
  )
}
