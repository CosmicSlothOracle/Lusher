import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
    title: 'Portfolio | Creative Developer',
    description: 'Web Development, App Development, Design & Animation',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <body className={`${ inter.className } bg-dark text-light`}>
                {children}
            </body>
        </html>
    )
}