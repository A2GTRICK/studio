import { db } from "@/firebase/config";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
} from "firebase/firestore";

/**
 * Fetch all active billing plans
 * Admin controls these from Firestore
 */
export async function getBillingPlans() {
  const q = query(
    collection(db, "billing_plans"),
    where("isActive", "==", true),
    orderBy("order", "asc")
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}
