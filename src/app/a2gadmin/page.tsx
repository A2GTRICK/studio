export default function AdminHome() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">A2G Admin Dashboard</h1>
      <p>Quick links:</p>
      <ul className="list-disc ml-6 mt-2">
        <li><a href="/a2gadmin/tests" className="text-blue-600">Manage Tests</a></li>
        <li><a href="/a2gadmin/notifications" className="text-blue-600">Notifications</a></li>
      </ul>
    </div>
  );
}