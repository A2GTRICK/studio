export default function Notifications() {
  const updates = [
    { title: "New Notes Added", message: "Pharmacognosy Unit 2 updated with diagrams." },
    { title: "New MCQ Set", message: "50 new MCQs added for GPAT Practice." },
    { title: "Service Update", message: "Project File preparation service now open." },
    { title: "Feature Update", message: "Dark Mode coming soon!" },
  ];

  return (
    <div className="p-6 space-y-6">

      <h1 className="text-2xl font-bold">Notifications</h1>
      <p className="text-gray-600">Latest updates from A2G Smart Notes.</p>

      <div className="space-y-4 mt-4">
        {updates.map((u, index) => (
          <div key={index} className="p-4 bg-white border rounded shadow-sm">
            <h2 className="font-semibold text-lg">{u.title}</h2>
            <p className="text-gray-700">{u.message}</p>
          </div>
        ))}
      </div>

    </div>
  );
}
