/**
 * Wraps an API call in try/catch and handles errors consistently.
 * @param {Function} apiCall - Function that performs the API call (async).
 * @param {String} [errorMessage] - Optional message to log for context.
 * @returns {Promise<any|null>} The API result or null on failure.
 */
export async function safeApiCall(apiCall, errorMessage = 'API call failed') {
  try {
    return await apiCall()
  } catch (error) {
    console.error(errorMessage, error)
    return null
  }
}