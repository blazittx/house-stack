import { useEffect, useMemo, useState } from 'react'
import BaseWidget from './BaseWidget'
import { getCookie, setCookie } from '../utils/cookies'

/* eslint-disable react/prop-types */
export default function RecipientEmailsWidget({ widget }) {
  const [recipientsState, setRecipientsState] = useState(() => ({
    recipientOne: widget?.settings?.recipientOne || '',
    recipientTwo: widget?.settings?.recipientTwo || '',
  }))
  const [isSending, setIsSending] = useState(false)
  const [sendStatus, setSendStatus] = useState('')

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
    setSendStatus('')
    setRecipientsState((prev) => {
      const next = { ...prev, [field]: nextValue }
      if (field === 'recipientOne') setCookie('houseStackRecipientOneEmail', next.recipientOne)
      if (field === 'recipientTwo') setCookie('houseStackRecipientTwoEmail', next.recipientTwo)
      widget?.onSettingsChange?.(next)
      return next
    })
  }

  const handleSend = async () => {
    if (recipients.length === 0 || isSending) return
    setIsSending(true)
    setSendStatus('')

    const amountRaw = getCookie('houseStackAmount')
    const amountValue = Number.parseFloat(amountRaw.replace(',', '.'))
    const swishNumber = getCookie('houseStackSwishNumber')
    const swishName = getCookie('houseStackSwishName')
    const swishMessage = getCookie('houseStackSwishMessage')

    try {
      const response = await fetch('/.netlify/functions/send-receipt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipients,
          amount: Number.isFinite(amountValue) ? amountValue : null,
          swishNumber,
          swishName,
          swishMessage,
        }),
      })

      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(data?.error || 'Failed to send')
      }
      setSendStatus('Sent! Check your inbox.')
    } catch (error) {
      setSendStatus(error.message || 'Failed to send. Try again.')
    } finally {
      setIsSending(false)
    }
  }

  const amountRaw = getCookie('houseStackAmount')
  const parsedAmount = Number.parseFloat(amountRaw.replace(',', '.'))
  const swishNumber = getCookie('houseStackSwishNumber')
  const canSend = recipients.length > 0 && Number.isFinite(parsedAmount) && parsedAmount > 0 && swishNumber

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
            disabled={!canSend || isSending}
            style={{
              background: !canSend || isSending ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.15)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: 'canvasText',
              padding: '0.35rem 0.7rem',
              borderRadius: '6px',
              fontSize: '0.75rem',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              fontFamily: 'inherit',
              cursor: !canSend || isSending ? 'not-allowed' : 'pointer',
            }}
            onClick={(event) => {
              event.preventDefault()
              handleSend()
            }}
          >
            {isSending ? 'Sending...' : 'Send requests'}
          </button>
        </div>
        {!canSend && (
          <span style={{ fontSize: '0.7rem', opacity: 0.5 }}>
            Add recipients, amount, and Swish number to enable sending.
          </span>
        )}
        {sendStatus && (
          <span style={{ fontSize: '0.75rem', opacity: 0.6 }}>
            {sendStatus}
          </span>
        )}
      </div>
    </BaseWidget>
  )
}
