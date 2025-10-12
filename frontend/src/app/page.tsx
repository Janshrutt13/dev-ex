import Link from 'next/link';
 

const HomePage = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-white">
      {/* Navbar */}
      <nav className="w-full p-4 border-b border-gray-700">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Dev-Ex</h1>
          <div className="space-x-4">
            <Link href="/login" className="px-4 py-2 rounded-md hover:bg-gray-800 transition-colors">
              Log In
            </Link>
            <Link href="/signup" className="px-4 py-2 bg-blue-600 rounded-md hover:bg-blue-700 transition-colors font-semibold">
              Sign Up
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Hero Section */}
      <main className="flex-grow flex items-center justify-center text-center">
        <div className="container mx-auto px-4 py-16">
          <h2 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-4">
            Track Your Code. Build Your Discipline.
          </h2>
          <p className="max-w-2xl mx-auto text-lg text-gray-400 mb-8">
            Join a community of developers, commit to a coding challenge, maintain your streak, and find collaborators for your next big idea.
          </p>
          <Link
            href="/signup"
            className="inline-block bg-blue-600 text-white font-bold text-lg px-8 py-4 rounded-lg hover:bg-blue-700 transition-transform transform hover:scale-105"
          >
            Start Your Challenge
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full p-4 border-t border-gray-700 text-center text-gray-500">
        <p>&copy; {new Date().getFullYear()} Dev-Ex. Built for the community.</p>
      </footer>
    </div>
  );
};

export default HomePage;