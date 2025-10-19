import SockJS from 'sockjs-client'
import { Client } from '@stomp/stompjs'

let stompClient = null
let ticketSubscription = null
let detailSubscriptions = {}

// Allow relative URL in dev if VITE_BACKEND_URL is not set.
const API_URL = import.meta.env.VITE_BACKEND_URL
const WS_ENDPOINT = `${API_URL ? API_URL : ''}/ws`
const TICKETS_TOPIC = '/topic/tickets'

// Small helper to protect against malformed payloads
const safeParseJSON = (str) => {
  try {
    return JSON.parse(str)
  } catch (e) {
    console.warn('[websocket] Failed to parse message body as JSON', e)
    return null
  }
}

function ensureConnected(onConnectCallback) {
  if (stompClient && stompClient.connected) {
    onConnectCallback()
    return
  }

  if (stompClient) {
    stompClient.deactivate()
    stompClient = null
  }

  stompClient = new Client({
    webSocketFactory: () => new SockJS(WS_ENDPOINT),
    // WHY: Built-in reconnect (ms). Keeps the connection resilient.
    reconnectDelay: 5000,

    debug: (str) => {
      if (import.meta.env.DEV) console.log(`[WebSocket] ${str}`)
    },
    onConnect: () => {
      if (import.meta.env.DEV) console.log('[websocket] Connected')
      onConnectCallback()
    },
    onStompError: (frame) => {
      console.warn('[websocket] STOMP error', frame?.headers || frame)
    },
    onWebSocketClose: (evt) => {
      if (import.meta.env.DEV) console.log('[websocket] Socket closed', evt?.reason || evt)
    }
  })

  stompClient.activate()
}

/**
 * Connect (singleton) and subscribe to ticket updates.
 *
 * @param {(ticketUpdate: any) => void} onTicketUpdate callback for parsed messages
 */
export function connectToTickets(onTicketUpdate) {
  if (typeof onTicketUpdate !== 'function') {
    console.warn('[websocket] connectToTickets expects a function callback')
    return
  }

  // Prevent duplicate connections
  if (ticketSubscription) return

  ensureConnected(() => {
    if (ticketSubscription) {
      ticketSubscription.unsubscribe()
      ticketSubscription = null
    }

    ticketSubscription = stompClient.subscribe(TICKETS_TOPIC, (message) => {
      const data = safeParseJSON(message.body)
      if (data !== null) onTicketUpdate(data)
    })
  })
}

export function disconnectFromTickets({ full = false } = {}) {
  try {
    if (ticketSubscription) {
      ticketSubscription.unsubscribe()
      ticketSubscription = null
    }

    if (full && stompClient) {
      // `deactivate()` returns a Promise; we intentionally don’t await to keep API sync.
      stompClient.deactivate()
      stompClient = null
    }
  } catch (e) {
    console.warn('[websocket] Error during disconnect', e)
    if (full) {
      stompClient = null
    }
    ticketSubscription = null
  }
}

export function connectToTicketDetail(ticketId, onUpdate) {
  ensureConnected(() => {
    const topic = `/topic/tickets/${ticketId}`

    // Unsubscribe if already subscribed
    if (detailSubscriptions[ticketId]) {
      detailSubscriptions[ticketId].unsubscribe()
    }

    const sub = stompClient.subscribe(topic, (message) => {
      const data = safeParseJSON(message.body)
      if (data !== null) onUpdate(data)
    })

    detailSubscriptions[ticketId] = sub
    console.log(`[websocket] Subscribed to ${topic}`)
  })
}

export function disconnectFromTicketDetail(ticketId) {
  if (detailSubscriptions[ticketId]) {
    detailSubscriptions[ticketId].unsubscribe()
    delete detailSubscriptions[ticketId]
    console.log(`[websocket] Unsubscribed from /topic/tickets/${ticketId}`)
  }
}