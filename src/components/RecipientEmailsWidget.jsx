import { useEffect, useMemo, useState } from 'react'
import BaseWidget from './BaseWidget'
import { getCookie, setCookie } from '../utils/cookies'

/* eslint-disable react/prop-types */
export default function RecipientEmailsWidget({ widget }) {
  const [recipientsState, setRecipientsState] = useState(() => ({
    recipientOne: widget?.settings?.recipientOne || '',
    recipientTwo: widget?.settings?.recipientTwo || '',
  }))

  useEffect(() => {
    const cookieRecipients = {
      recipientOne: getCookie('houseStackRecipientOneEmail'),
      recipientTwo: getCookie('houseStackRecipientTwoEmail'),
    }
    const next = {
      recipientOne: widget?.settings?.recipientOne || cookieRecipients.recipientOne || '',
      recipientTwo: widget?.settings?.recipientTwo || cookieRecipients.recipientTwo || '',
    }
    setRecipientsState(next)
    widget?.onSettingsChange?.(next)
  }, [])

  useEffect(() => {
    setRecipientsState({
      recipientOne: widget?.settings?.recipientOne || '',
      recipientTwo: widget?.settings?.recipientTwo || '',
    })
  }, [widget?.settings?.recipientOne, widget?.settings?.recipientTwo])

  const recipients = useMemo(() => {
    const list = [recipientsState.recipientOne, recipientsState.recipientTwo]
    return list.map((value) => value.trim()).filter(Boolean)
  }, [recipientsState])

  const updateRecipient = (field) => (event) => {
    const nextValue = event.target.value
    setRecipientsState((prev) => {
      const next = { ...prev, [field]: nextValue }
      if (field === 'recipientOne') setCookie('houseStackRecipientOneEmail', next.recipientOne)
      if (field === 'recipientTwo') setCookie('houseStackRecipientTwoEmail', next.recipientTwo)
      widget?.onSettingsChange?.(next)
      return next
    })
  }

  return (
    <BaseWidget padding="1.25rem">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', height: '100%' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          <span style={{ fontSize: '0.75rem', letterSpacing: '0.18em', textTransform: 'uppercase', opacity: 0.6 }}>
            Recipient emails
          </span>
          <span style={{ fontSize: '0.75rem', opacity: 0.5 }}>
            Add every email that should receive a Swish payment request.
          </span>
        </div>
        <div style={{ display: 'grid', gap: '0.65rem', flex: 1 }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', fontSize: '0.75rem', opacity: 0.7 }}>
            Housemate 1 email
            <input
              type="email"
              placeholder="one@email.com"
              value={recipientsState.recipientOne}
              onChange={updateRecipient('recipientOne')}
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
            Housemate 2 email
            <input
              type="email"
              placeholder="two@email.com"
              value={recipientsState.recipientTwo}
              onChange={updateRecipient('recipientTwo')}
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.75rem', opacity: 0.6 }}>
            {recipients.length} recipient{recipients.length === 1 ? '' : 's'}
          </span>
          <button
            type="button"
            disabled={recipients.length === 0}
            style={{
              background: recipients.length === 0 ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.15)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: 'canvasText',
              padding: '0.35rem 0.7rem',
              borderRadius: '6px',
              fontSize: '0.75rem',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              fontFamily: 'inherit',
              cursor: recipients.length === 0 ? 'not-allowed' : 'pointer',
            }}
            onClick={(event) => event.preventDefault()}
          >
            Send requests
          </button>
        </div>
      </div>
    </BaseWidget>
  )
}
