"use client"

import React from 'react'
import ErrorBoundary from './error-boundary'
import { initErrorHandler } from '../lib/error-handler'

interface ClientErrorBoundaryProps {
  children: React.ReactNode
}

export default function ClientErrorBoundary({ children }: ClientErrorBoundaryProps) {
  // Initialize error handler on client side
  React.useEffect(() => {
    initErrorHandler();
  }, []);
  
  return (
    <ErrorBoundary>
      {children}
    </ErrorBoundary>
  )
} 