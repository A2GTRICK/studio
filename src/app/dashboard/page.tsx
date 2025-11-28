export default function Dashboard() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Welcome back 👋</h1>
      <p className="text-gray-600">Your Pharmacy Learning Partner — A2G Smart Notes</p>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        
        <a href="/dashboard/mcq-practice" className="p-5 border rounded-xl hover:bg-gray-50">
          <h2 className="text-xl font-semibold">MCQ Practice</h2>
          <p className="text-gray-600 text-sm mt-2">
            Practice GPAT, NIPER & D.Pharm MCQs
          </p>
        </a>

        <a href="/dashboard/ai-notes" className="p-5 border rounded-xl hover:bg-gray-50">
          <h2 className="text-xl font-semibold">AI Notes Generator</h2>
          <p className="text-gray-600 text-sm mt-2">
            Generate detailed notes instantly
          </p>
        </a>

        <a href="/dashboard/ai-mcq-generator" className="p-5 border rounded-xl hover:bg-gray-50">
          <h2 className="text-xl font-semibold">AI MCQ Generator</h2>
          <p className="text-gray-600 text-sm mt-2">
            Create high-quality exam questions
          </p>
        </a>

      </div>

      {/* Services Section */}
      <div className="p-6 border rounded-xl mt-8">
        <h2 className="text-xl font-bold mb-2">Academic Services</h2>
        <p className="text-gray-600 text-sm">
          Internship reports, dissertations, lab manuals & project help.
        </p>
        <a href="/dashboard/services" className="text-blue-600 font-semibold mt-3 block">
          View Services →
        </a>
      </div>

      {/* Premium */}
      <div className="p-6 border rounded-xl">
        <h2 className="text-xl font-bold">Go Premium</h2>
        <p className="text-gray-600 text-sm">
          Unlock unlimited AI usage & premium notes.
        </p>
        <a href="/dashboard/premium" className="text-blue-600 font-semibold mt-3 block">
          Upgrade Now →
        </a>
      </div>
    </div>
  );
}