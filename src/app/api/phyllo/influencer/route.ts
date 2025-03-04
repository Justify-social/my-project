import { NextRequest, NextResponse } from "next/server";

const PHYLLO_CLIENT_ID = process.env.NEXT_PUBLIC_PHYLLO_CLIENT_ID;
const PHYLLO_SECRET = process.env.PHYLLO_SECRET || process.env.NEXT_PUBLIC_PHYLLO_SECRET;
if (!PHYLLO_CLIENT_ID || !PHYLLO_SECRET) {
  throw new Error("Missing Phyllo credentials in environment variables");
}
const PHYLLO_AUTH = Buffer.from(`${PHYLLO_CLIENT_ID}:${PHYLLO_SECRET}`).toString("base64");

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const handle = searchParams.get("handle");
  const platform = searchParams.get("platform");
  const sdkToken = searchParams.get("sdkToken");
  const user_id = searchParams.get("user_id");

  if (!handle || !platform || !sdkToken || !user_id) {
    return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
  }

  try {
    // Fetch accounts for the given user_id
    const accountsResponse = await fetch(
      `https://api.staging.getphyllo.com/v1/accounts?user_id=${user_id}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${PHYLLO_AUTH}`,
        },
      }
    );

    if (!accountsResponse.ok) {
      throw new Error(`Failed to fetch accounts: ${accountsResponse.status}`);
    }

    const accounts = await accountsResponse.json();
    const account = accounts.data.find(
      (acc: any) => acc.platform === platform.toLowerCase()
    );

    if (!account) {
      return NextResponse.json({ error: "No connected account found for this platform" }, { status: 404 });
    }

    // Fetch profile data
    const profileResponse = await fetch(
      `https://api.staging.getphyllo.com/v1/profiles?account_id=${account.id}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${PHYLLO_AUTH}`,
        },
      }
    );
    if (!profileResponse.ok) {
      throw new Error(`Failed to fetch profile: ${profileResponse.status}`);
    }
    const profile = await profileResponse.json();
    const profileData = profile.data[0] || {};

    // Fetch engagement data
    const engagementResponse = await fetch(
      `https://api.staging.getphyllo.com/v1/engagement?account_id=${account.id}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${PHYLLO_AUTH}`,
        },
      }
    );
    if (!engagementResponse.ok) {
      throw new Error(`Failed to fetch engagement: ${engagementResponse.status}`);
    }
    const engagement = await engagementResponse.json();
    const engagementData = engagement.data[0] || {};

    const influencerData = {
      name: profileData.username || handle,
      followers_count: profileData.followers_count || "N/A",
      engagement_rate: engagementData.engagement_rate
        ? `${engagementData.engagement_rate}%`
        : "N/A",
    };

    return NextResponse.json(influencerData);
  } catch (err) {
    console.error("Phyllo API error:", err);
    return NextResponse.json({ error: "Failed to fetch influencer data" }, { status: 500 });
  }
}
