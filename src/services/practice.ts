export async function createTest(data: any) {
  try {
    const res = await fetch("/api/a2gadmin/tests", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return await res.json();
  } catch (err: any) {
    return { error: "NETWORK_ERROR", details: err?.message || "" };
  }
}

export async function listTests() {
  try {
    const res = await fetch("/api/a2gadmin/tests", { credentials: "include" });
    return await res.json();
  } catch (err: any) {
    return { error: "NETWORK_ERROR", details: err?.message || "" };
  }
}

export async function bulkUploadQuestions(testId: string, sections: any[]) {
  try {
    const res = await fetch("/api/a2gadmin/tests/questions", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ testId, sections }),
    });
    return await res.json();
  } catch (err: any) {
    return { error: "NETWORK_ERROR", details: err?.message || "" };
  }
}
export default {};