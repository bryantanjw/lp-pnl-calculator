import express from "express";

const app = express();
const port = 3000;

type Interaction = {
  type: "deposit" | "withdraw";
  size: number;
  pricePerLPInAsset: number;
  assetPriceUSD: number;
};

// Mock data for LP interactions
const mockData: Interaction[] = [
  { type: "deposit", size: 100, pricePerLPInAsset: 1.9, assetPriceUSD: 200 },
  { type: "deposit", size: 50, pricePerLPInAsset: 2.0, assetPriceUSD: 250 },
  { type: "deposit", size: 70, pricePerLPInAsset: 2.2, assetPriceUSD: 300 },
  { type: "withdraw", size: 50, pricePerLPInAsset: 2.3, assetPriceUSD: 280 },
];

// User's record
let userRecord = {
  averageCostBasis: 0,
  totalSize: 0,
  totalUSDEmissionsEarned: 0,
};

function updateUserRecord(
  type: "deposit" | "withdraw",
  size: number,
  pricePerLPInAsset: number,
  assetPriceUSD: number
) {
  const priceInUSD = pricePerLPInAsset * assetPriceUSD;

  if (type === "deposit") {
    const oldTotalCost = userRecord.averageCostBasis * userRecord.totalSize;
    const newTotalCost = oldTotalCost + size * priceInUSD;

    userRecord.totalSize += size;
    userRecord.averageCostBasis = newTotalCost / userRecord.totalSize;
  } else if (type === "withdraw") {
    const oldTotalCost = userRecord.averageCostBasis * userRecord.totalSize;
    const withdrawCost = size * userRecord.averageCostBasis;

    userRecord.totalSize -= size;
    userRecord.averageCostBasis =
      userRecord.totalSize > 0
        ? (oldTotalCost - withdrawCost) / userRecord.totalSize
        : 0;
  }
}

function calculatePNL(currentLPPriceInAsset: number, assetPriceUSD: number) {
  const currentUSDValueOfLP =
    userRecord.totalSize * currentLPPriceInAsset * assetPriceUSD;
  const absolutePNL =
    currentUSDValueOfLP +
    userRecord.totalUSDEmissionsEarned -
    userRecord.averageCostBasis * userRecord.totalSize;
  const relativePNL =
    userRecord.totalSize > 0
      ? (currentUSDValueOfLP + userRecord.totalUSDEmissionsEarned) /
        userRecord.totalSize /
        userRecord.averageCostBasis
      : 0;

  return { absolutePNL, relativePNL };
}

// Process mock data
mockData.forEach((interaction) => {
  updateUserRecord(
    interaction.type,
    interaction.size,
    interaction.pricePerLPInAsset,
    interaction.assetPriceUSD
  );
});

// Example calculation for the latest LP price
const latestLPPriceInAsset = 2.4;
const latestAssetPriceUSD = 290;
const pnl = calculatePNL(latestLPPriceInAsset, latestAssetPriceUSD);

// Express endpoint to return PnL and user record
app.get("/pnl", (req, res) => {
  res.json({ userRecord, pnl });
});

app.listen(port, () => {
  console.log(`PnL service running at http://localhost:${port}`);
});
