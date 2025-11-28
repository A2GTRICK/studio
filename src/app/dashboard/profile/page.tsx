export default function Profile() {
  const user = {
    name: "A2G Buddy",
    email: "student@example.com",
    plan: "Free Plan",
  };

  return (
    <div className="p-6 space-y-6">

      <h1 className="text-2xl font-bold">My Profile</h1>
      <p className="text-gray-600">Your personal information</p>

      <div className="p-6 bg-white border rounded-xl shadow-sm space-y-4 max-w-md">

        <div>
          <p className="text-gray-500 text-sm">Name</p>
          <p className="font-semibold">{user.name}</p>
        </div>

        <div>
          <p className="text-gray-500 text-sm">Email</p>
          <p className="font-semibold">{user.email}</p>
        </div>

        <div>
          <p className="text-gray-500 text-sm">Current Plan</p>
          <p className="font-semibold">{user.plan}</p>
        </div>

      </div>

    </div>
  );
}
