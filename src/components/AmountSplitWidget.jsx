import { useEffect, useMemo, useState } from 'react'
import BaseWidget from './BaseWidget'

/* eslint-disable react/prop-types */
export default function AmountSplitWidget({ widget }) {
  const [amountInput, setAmountInput] = useState(() => widget?.settings?.amount || '')

  useEffect(() => {
    const nextValue = widget?.settings?.amount ?? ''
    if (nextValue !== amountInput) {
      setAmountInput(nextValue)
    }
  }, [widget?.settings?.amount, amountInput])

  const { amountValue, perPerson, isValid } = useMemo(() => {
    const normalized = amountInput.replace(',', '.')
    const parsed = Number.parseFloat(normalized)
    const valid = Number.isFinite(parsed) && parsed >= 0
    return {
      amountValue: valid ? parsed : 0,
      perPerson: valid ? parsed / 3 : 0,
      isValid: valid,
    }
  }, [amountInput])

  const formatMoney = (value) => value.toFixed(2)

  const handleAmountChange = (event) => {
    const nextValue = event.target.value
    setAmountInput(nextValue)
    widget?.onSettingsChange?.({ amount: nextValue })
  }

  return (
    <BaseWidget padding="1.25rem">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', height: '100%' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          <span style={{ fontSize: '0.75rem', letterSpacing: '0.18em', textTransform: 'uppercase', opacity: 0.6 }}>
            Split amount
          </span>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <input
              type="number"
              min="0"
              step="0.01"
              value={amountInput}
              onChange={handleAmountChange}
              placeholder="0.00"
              style={{
                width: '100%',
                background: 'transparent',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '6px',
                color: 'canvasText',
                padding: '0.5rem 0.75rem',
                fontSize: '1.25rem',
                fontFamily: 'inherit',
              }}
            />
            <span style={{ fontSize: '0.85rem', opacity: 0.6 }}>SEK</span>
          </div>
          <span style={{ fontSize: '0.75rem', opacity: 0.5 }}>
            The total is split evenly between 3 housemates.
          </span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', flex: 1 }}>
          {['Housemate 1', 'Housemate 2', 'Housemate 3'].map((label) => (
            <div
              key={label}
              style={{
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '8px',
                padding: '0.75rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                background: 'rgba(255, 255, 255, 0.02)',
              }}
            >
              <span style={{ fontSize: '0.7rem', letterSpacing: '0.12em', textTransform: 'uppercase', opacity: 0.5 }}>
                {label}
              </span>
              <span style={{ fontSize: '1.1rem', fontWeight: 600 }}>
                {isValid ? `${formatMoney(perPerson)} SEK` : '--'}
              </span>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', opacity: 0.6 }}>
          <span>Total</span>
          <span>{isValid ? `${formatMoney(amountValue)} SEK` : '--'}</span>
        </div>
      </div>
    </BaseWidget>
  )
}
