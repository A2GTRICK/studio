
export default function AcademicServices() {
  return (
    <div className="p-6 space-y-6">

      <h1 className="text-2xl font-bold">Academic Services</h1>
      <p className="text-gray-600">
        Get expert help for academic writing, projects, internship work and more.
      </p>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">

        {/* Service Card */}
        <div className="p-6 bg-white border rounded-xl shadow-sm space-y-3">
          <h2 className="text-xl font-semibold">Internship Report Writing</h2>
          <p className="text-gray-600">
            Professionally written internship reports for D.Pharm, B.Pharm & M.Pharm.
          </p>
          <a href="#" className="text-blue-600 font-semibold">Request Service →</a>
        </div>

        <div className="p-6 bg-white border rounded-xl shadow-sm space-y-3">
          <h2 className="text-xl font-semibold">Dissertation / Thesis Help</h2>
          <p className="text-gray-600">
            Complete guidance for thesis writing, formatting and proofreading.
          </p>
          <a href="#" className="text-blue-600 font-semibold">Request Service →</a>
        </div>

        <div className="p-6 bg-white border rounded-xl shadow-sm space-y-3">
          <h2 className="text-xl font-semibold">Project File Preparation</h2>
          <p className="text-gray-600">
            Ready-made and custom pharmacy project files with charts and diagrams.
          </p>
          <a href="#" className="text-blue-600 font-semibold">Request Service →</a>
        </div>

        <div className="p-6 bg-white border rounded-xl shadow-sm space-y-3">
          <h2 className="text-xl font-semibold">Lab Manual Notes</h2>
          <p className="text-gray-600">
            Complete lab manual help for Pharmaceutics, Pharmacology & Chemistry.
          </p>
          <a href="#" className="text-blue-600 font-semibold">Request Service →</a>
        </div>

        <div className="p-6 bg-white border rounded-xl shadow-sm space-y-3">
          <h2 className="text-xl font-semibold">Assignment Help</h2>
          <p className="text-gray-600">
            Get topic-wise assignments prepared with diagrams and references.
          </p>
          <a href="#" className="text-blue-600 font-semibold">Request Service →</a>
        </div>

        <div className="p-6 bg-white border rounded-xl shadow-sm space-y-3">
          <h2 className="text-xl font-semibold">Seminar / PPT Preparation</h2>
          <p className="text-gray-600">
            Beautiful and professional PPT creation for pharmacy seminars.
          </p>
          <a href="#" className="text-blue-600 font-semibold">Request Service →</a>
        </div>

      </div>

    </div>
  );
}
