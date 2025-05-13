// This service handles fetching cryptocurrency data

export interface Cryptocurrency {
  id: string
  name: string
  symbol: string
  price: number
  change: number
  icon: string
  color: string
}

interface CryptoResponse {
  success: boolean
  data: {
    popularTokens: Cryptocurrency[]
    otherTokens: Cryptocurrency[]
  }
}

export async function fetchCryptoData(): Promise<{
  popularTokens: Cryptocurrency[]
  otherTokens: Cryptocurrency[]
}> {
  try {
    // In a real app with a public API, you could fetch directly from the client
    // But for security and to avoid CORS issues, we're using our own API route
    const response = await fetch("/api/crypto")

    if (!response.ok) {
      throw new Error("Failed to fetch cryptocurrency data")
    }

    const data: CryptoResponse = await response.json()

    if (!data.success) {
      throw new Error("API returned unsuccessful response")
    }

    return {
      popularTokens: data.data.popularTokens,
      otherTokens: data.data.otherTokens,
    }
  } catch (error) {
    console.error("Error in fetchCryptoData:", error)
    // Return empty arrays as fallback
    return {
      popularTokens: [],
      otherTokens: [],
    }
  }
}

// Function to simulate real-time updates (for demo purposes)
// In a real app, you might use WebSockets or regular polling
export function simulateRealTimeUpdates(
  tokens: Cryptocurrency[],
  callback: (updatedTokens: Cryptocurrency[]) => void,
): () => void {
  const intervalId = setInterval(() => {
    const updatedTokens = tokens.map((token) => {
      // Generate a small random price change
      const randomChange = Math.random() * 0.4 - 0.2 // Between -0.2% and +0.2%
      const newChange = Number.parseFloat((token.change + randomChange).toFixed(2))

      // Calculate new price based on the change
      const priceChange = token.price * (randomChange / 100)
      const newPrice = Number.parseFloat((token.price + priceChange).toFixed(2))

      return {
        ...token,
        price: newPrice,
        change: newChange,
      }
    })

    callback(updatedTokens)
  }, 5000) // Update every 5 seconds

  // Return a cleanup function
  return () => clearInterval(intervalId)
}
