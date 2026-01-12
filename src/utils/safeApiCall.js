
export async function safeApiCall(apiCall, errorMessage = 'API call failed') {
  try {
    return await apiCall()
  } catch (error) {
    console.error(errorMessage, error)
    return null
  }
}