"use client"

import type React from "react"
import "./globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import ClientErrorBoundary from '@/app/components/client-error-boundary'
import EthereumProtection from '@/app/components/EthereumProtection'
import { EthereumProtectionScript } from '@/app/head-scripts'

const inter = Inter({ subsets: ["latin"] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh" suppressHydrationWarning>
      <head>
        <link rel="icon" href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAA21BMVEUAAAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD///+y7nSYAAAAR3RSTlMAAQIDBQYHCAkKCw0ODxASExQVFhcYGRobHB0eHyEiJCUmJygpKissLS4vMDEyMzQ1Njc4OTo7PD0+P0BBQkNERUZHSElKwhzQDQAAAAFiS0dEAIgFHUgAAAAJcEhZcwAACxMAAAsTAQCanBgAAAAHdElNRQfnBQUVMRRRQGH2AAACvklEQVQ4y2NgGLqAEUqxQCgmRiYorcrMwsoGlcDCwsrGzoFQxcnFzcPLxy8AYgsKCYuIMlCkXkxcQlJKWkZWTl5BUUlZRVVNnYEi9RqaWto6unr6BoZGxiamZuYWlgyUqbeytrG1s3dwdHJ2cXVz9/D0YiDLAG8fXz//gMCg4JDQsPCIyKjoGAby1MfGxSckJiWnpKalpWdkZmXn5FKgPi+/oLCouKS0rLyisqq6praOAvX1DY1NzS2tbe0dnV3dPb19/RQYMGHipEmTp0ydNn3GzFmz58ydR4EBC+YvWLho8ZKly5avWLlq9Zq1FKhft37Dxk2bt2zZun3Hzl27c/dQaMDevfsO7D946PCRnTuPHjtOwQEnTp46febsufMXLl66fOUqBQZcu37j5q3bd+7eu//g4aPHFBjw5Omz5y9evnr95u279+8/UGDAx0+fv3z99v3Hzx8/f/3+Q4EB//79B4KNBP5TYMBGCv1HKBP9/w8yAJE0/v//D8nV/0EGwJMWzIB/0Lzz/z80xcAMACuHGQDWBs6csOQFUgdWAjIAnDXhCSd4wtc/Bnbw6T/EzEADgOGBmhnBwAB1ALCYgRsAD2BgPoVXR5AqimQMgPoXnPcg7qBYBlYdQSUoiWJwEkWkdXAyA2d3SJ6DZXiIg4A+AKd7SAKClIGQAVCvgWsEmApx8X9EugcacP/+3v+wZISoEUBZFW4AKDn9f//eEmEAtGYApmJx0P9/f98iDUA0UIHFFjS9/f/7G9FKAXZSgGsEpXVg0v93H6pZANpOhRmASPJ/3r9DGIBoLMOaeJACIIEB8i2svQ5vMsMUgmsDcNMBpdUA1myHN12QtRkxWu4YLSeMThhGaxnUDIGUStBaS9DWGk57FaM9jtkgQDRL0Npk6G0yrEYJXqsIq+VC0HTC7JoQdMwIuqaE3VOi/unw7V8DAJjH8iLKXwZ9AAAAJXRFWHRkYXRlOmNyZWF0ZQAyMDIzLTA1LTA1VDIxOjQ5OjIwKzAwOjAwAVVpdQAAACV0RVh0ZGF0ZTptb2RpZnkAMjAyMy0wNS0wNVQyMTo0OToyMCswMDowMHAI0ckAAAAASUVORK5CYII=" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <meta httpEquiv="Content-Security-Policy" content="frame-ancestors 'self'" />
        <EthereumProtectionScript />
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <EthereumProtection />
          <ClientErrorBoundary>
          {children}
          </ClientErrorBoundary>
        </ThemeProvider>
      </body>
    </html>
  )
}
