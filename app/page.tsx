import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-100 via-blue-100 to-green-100">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <header className="text-center mb-16">
          <h1 
            className="text-5xl md:text-7xl font-bold mb-4 text-blue-800"
            style={{ fontFamily: 'var(--font-pixel)' }}
          >
            DoctorSim
          </h1>
          <p className="text-xl md:text-2xl text-gray-700">
            Learn Healthcare Through Gaming
          </p>
        </header>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="dialog-box bg-white p-8 mb-8 rounded-lg shadow-xl">
            <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">
              🏥 Welcome to the Doctor's Office! 🎮
            </h2>
            <p className="text-lg mb-4 text-gray-800">
              Step into the shoes of a doctor in this fun, 8-bit style educational game. 
              Patients will approach your desk with questions about health, insurance, and medical care. 
              Your mission: provide the best answers and learn along the way!
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <div className="dialog-box bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-bold mb-3 text-gray-800">🎨 Retro Pixel Art</h3>
              <p className="text-gray-800">Enjoy a nostalgic Pokemon-style gaming experience with animated characters and smooth transitions.</p>
            </div>
            
            <div className="dialog-box bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-bold mb-3 text-gray-800">💡 Hint System</h3>
              <p className="text-gray-800">Stuck on a question? Click the notepad on your desk for helpful hints to guide your learning.</p>
            </div>
            
            <div className="dialog-box bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-bold mb-3 text-gray-800">🤖 AI Analysis</h3>
              <p className="text-gray-800">Receive personalized feedback on your knowledge gaps and recommendations for improvement.</p>
            </div>
            
            <div className="dialog-box bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-bold mb-3 text-gray-800">📊 Track Progress</h3>
              <p className="text-gray-800">Monitor your learning journey with detailed analytics and visual progress charts.</p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Link href="/game">
              <button className="pixel-button bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-8 rounded-lg text-lg w-full sm:w-auto">
                Play Now
              </button>
            </Link>
            
            <Link href="/auth/login">
              <button className="pixel-button bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 px-8 rounded-lg text-lg w-full sm:w-auto">
                Login
              </button>
            </Link>
          </div>

          {/* Topics Covered */}
          <div className="dialog-box bg-white p-8 rounded-lg shadow-xl">
            <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">📚 Topics Covered</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <ul className="space-y-2 text-gray-800">
                <li>✅ Preventive Care</li>
                <li>✅ Insurance Basics</li>
                <li>✅ Medication Management</li>
                <li>✅ Common Conditions</li>
              </ul>
              <ul className="space-y-2 text-gray-800">
                <li>✅ Appointment Preparation</li>
                <li>✅ Health Guidelines</li>
                <li>✅ Medical Procedures</li>
                <li>✅ Patient Rights</li>
              </ul>
            </div>
          </div>

          {/* Demo Info */}
          <div className="mt-8 text-center text-sm text-gray-600 bg-yellow-50 p-4 rounded-lg border-2 border-yellow-300">
            <p className="font-semibold mb-2">🎮 Try Demo Account:</p>
            <p>Email: patient@example.com | Password: patient123</p>
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center mt-16 text-gray-600">
          <p>© 2024 DoctorSim - Making Healthcare Education Fun</p>
        </footer>
      </div>
    </div>
  );
}
