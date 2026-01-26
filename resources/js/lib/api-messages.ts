export type ErrorBag = Record<string, string[] | string | null | undefined>

const pushMessage = (messages: string[], value: unknown) => {
  if (Array.isArray(value)) {
    value.forEach((item) => pushMessage(messages, item))
    return
  }
  if (value === null || value === undefined) return
  const str = String(value).trim()
  if (!str) return
  messages.push(str)
}

export const extractMessages = (payload: any): string[] => {
  const messages: string[] = []
  if (!payload) return messages

  if (typeof payload.message === "string") {
    pushMessage(messages, payload.message)
  }

  if (payload.errors && typeof payload.errors === "object") {
    Object.values(payload.errors as ErrorBag).forEach((value) => pushMessage(messages, value))
  }

  // Backward-compat: some endpoints return validation errors in "message"
  if (payload.message && typeof payload.message === "object") {
    Object.values(payload.message as ErrorBag).forEach((value) => pushMessage(messages, value))
  }

  // Deduplicate while preserving order
  return messages.filter((msg, idx) => messages.indexOf(msg) === idx)
}

export const getFirstMessage = (payload: any, fallback: string): string => {
  const messages = extractMessages(payload)
  return messages[0] || fallback
}

export const getFieldErrorMessage = (value: unknown): string | null => {
  if (Array.isArray(value)) {
    const first = value.find((item) => item !== null && item !== undefined && String(item).trim() !== "")
    return first !== undefined ? String(first) : null
  }
  if (value === null || value === undefined) return null
  const str = String(value).trim()
  return str.length > 0 ? str : null
}
