export default function TestNotePage({ params }: any) {
  return (
    <div style={{ padding: 40 }}>
      <h1>NOTE VIEW PAGE WORKING</h1>
      <p>ID: {params.id}</p>
    </div>
  );
}
