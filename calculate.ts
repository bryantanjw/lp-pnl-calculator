import express from "express";
import { Pool } from 'pg';

const app = express();
const port = 3000;

// Connect to local Supabase PostgreSQL
const pool = new Pool({
  host: 'localhost',
  port: 54322,
  database: 'postgres',
  user: 'postgres',
  password: 'postgres'
});

async function getUserRecord(userAddress: string, market: string) {
  const query = `
    WITH latest_lp_state AS (
      SELECT COALESCE(total_size, 0) as total_size, 
             COALESCE(average_cost_basis, 0) as average_cost_basis
      FROM public.lp_trades
      WHERE user_address = $1
      AND market = $2
      ORDER BY id DESC
      LIMIT 1
    ),
    total_rewards AS (
      SELECT COALESCE(SUM(usd_value_at_claim), 0) AS total_usd_emissions_earned
      FROM public.lp_rewards
      WHERE user_address = $1
      AND market = $2
    )
    SELECT 
      COALESCE(lp_state.total_size, 0) as total_size,
      COALESCE(lp_state.average_cost_basis, 0) as average_cost_basis,
      COALESCE(rewards.total_usd_emissions_earned, 0) as total_usd_emissions_earned
    FROM (SELECT 0 as total_size, 0 as average_cost_basis) as empty_state
    LEFT JOIN latest_lp_state lp_state ON true
    CROSS JOIN total_rewards rewards;
  `;

  const result = await pool.query(query, [userAddress, market]);
  return result.rows[0];
}

function calculatePNL(
  currentLPPriceInAsset: number,
  assetPriceUSD: number,
  userRecord: any
) {
  // Ensure we have valid numbers, defaulting to 0 if null/undefined
  const totalSize = Number(userRecord?.total_size) || 0;
  const avgCostBasis = Number(userRecord?.average_cost_basis) || 0;
  const totalEmissions = Number(userRecord?.total_usd_emissions_earned) || 0;

  const currentUSDValueOfLP = totalSize * currentLPPriceInAsset * assetPriceUSD;
  const absolutePNL = currentUSDValueOfLP + totalEmissions - (avgCostBasis * totalSize);

  // Avoid division by zero and handle edge cases
  const relativePNL = (totalSize > 0 && avgCostBasis > 0)
    ? (currentUSDValueOfLP + totalEmissions) / (totalSize * avgCostBasis) - 1
    : 0;

  return { absolutePNL, relativePNL };
}

// Express endpoint to return PnL
app.get("/pnl", async (req: express.Request, res: express.Response) => {
  try {
    const userRecord = await getUserRecord(
      '2KtvzAJKMk8c8NPD99mCS1Lxap6VKAktis2PUXbPAATu',
      '9vXLuZRexnq9Dc1JShErZHAWMxNZ88dRjM47dsHu7GgD'
    );

    // Using the same test values as before
    const latestLPPriceInAsset = 2.4;
    const latestAssetPriceUSD = 290;

    const pnl = calculatePNL(latestLPPriceInAsset, latestAssetPriceUSD, userRecord);

    res.json({ userRecord, pnl });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

app.listen(port, () => {
  console.log(`PnL service running at http://localhost:${port}`);
});