import './globals.css'

export const metadata = {
  title: 'Financify',
  description: 'Financify – Smart finance and workforce tracking',
  icons: {
    icon: '/logo/logo.png',
    shortcut: '/logo/logo.png',
    apple: '/logo/logo.png',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/logo/logo.png" type="image/png" />
        <link rel="apple-touch-icon" href="/logo/logo.png" />
      </head>
      <body>
        {children}
      </body>
    </html>
  )
}