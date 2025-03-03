import Link from 'next/link'
import Image from 'next/image'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function ForgotPassword() {
  return (
    <main className="min-h-screen flex flex-col">
      <Header />

      {/* Main Content */}
      <div className="flex-grow flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">Forgot Your Password?</h2>
            <p className="text-gray-600">
              Enter your email address and we'll send you a link to reset your password.
            </p>
          </div>

          {/* Forgot Password Form */}
          <form className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 to-orange-500 text-white py-2 px-4 rounded-md hover:from-purple-700 hover:to-orange-600 transition-colors font-medium"
            >
              Send Reset Link
            </button>
          </form>

          <div className="text-center mt-6">
            <p className="text-gray-600">
              Remember your password?{' '}
              <Link href="/login" className="text-purple-600 hover:text-purple-500 font-medium">
                Back to login
              </Link>
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
} 