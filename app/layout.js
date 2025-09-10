import './globals.css'

export const metadata = {
  title: 'Financify',
  description: 'Financify – Smart finance and workforce tracking',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  )
}