import { NextResponse } from "next/server";
import { getTopAccounts } from "@/server/services/subgraphClient";
import {
  getWalletPositions,
  getWalletActivity,
  getProfile,
  getActiveEvents,
} from "@/server/services/polymarketClient";

export async function GET() {
  const results: Record<string, unknown> = {};
  const errors: Record<string, string> = {};

  // Step 1: Top accounts from subgraph
  try {
    const accounts = await getTopAccounts(10);
    results.topAccounts = accounts;
    console.log("✅ Subgraph top accounts:", accounts.length);

    if (accounts.length > 0) {
      const address = accounts[0].id;
      results.testAddress = address;
      console.log("🔍 Testing with wallet:", address);

      // Step 2: Positions from Data API
      try {
        const positions = await getWalletPositions(address);
        results.positions = positions.slice(0, 5); // first 5 only
        console.log("✅ Positions:", positions.length);
      } catch (e) {
        errors.positions = String(e);
        console.error("❌ Positions error:", e);
      }

      // Step 3: Activity from Data API
      try {
        const activity = await getWalletActivity(address, 20);
        results.activity = activity.slice(0, 5);
        console.log("✅ Activity:", activity.length);
      } catch (e) {
        errors.activity = String(e);
        console.error("❌ Activity error:", e);
      }

      // Step 4: Profile from Data API
      try {
        const profile = await getProfile(address);
        results.profile = profile;
        console.log("✅ Profile:", profile);
      } catch (e) {
        errors.profile = String(e);
        console.error("❌ Profile error:", e);
      }
    }
  } catch (e) {
    errors.topAccounts = String(e);
    console.error("❌ Top accounts error:", e);
  }

  // Step 5: Active events from Gamma API
  try {
    const events = await getActiveEvents("Sports", 5);
    results.sportsEvents = events.slice(0, 3);
    console.log("✅ Sports events:", events.length);
  } catch (e) {
    errors.sportsEvents = String(e);
    console.error("❌ Sports events error:", e);
  }

  return NextResponse.json({
    success: Object.keys(errors).length === 0,
    errors,
    results,
  });
}
