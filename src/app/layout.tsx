import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'WebSlingers Sketchpad - Spider-Man Drawing Game',
  description: 'A real-time multiplayer drawing and guessing game themed around Spider-Man characters, locations, and gadgets.',
  keywords: 'spiderman, drawing, game, multiplayer, sketchpad, webslingers',
  authors: [{ name: 'WebSlingers Team' }],
  viewport: 'width=device-width, initial-scale=1',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}
