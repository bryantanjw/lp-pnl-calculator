# LP PnL Calculator on Exponent

### inputs:

1. **mockData**:

   - deposit: 100 lp at $1.9/lp, sol price $200
   - deposit: 50 lp at $2.0/lp, sol price $250
   - deposit: 70 lp at $2.2/lp, sol price $300
   - withdraw: 50 lp at $2.3/lp, sol price $280

2. **latest price**:
   - lp = 2.4 sol/lp, sol = $290

---

### calculations:

#### deposits:

1. **first deposit**:

   - size = 100 lp, price = $1.9 \* 200 = $380/lp.
   - total size = 100, cost basis = 380.

2. **second deposit**:

   - size = 50 lp, price = $2.0 \* 250 = $500/lp.
   - new cost basis:
     ```
     (100 * 380 + 50 * 500) / (100 + 50) = 420.
     ```
   - total size = 150, cost basis = 420.

3. **third deposit**:
   - size = 70 lp, price = $2.2 \* 300 = $660/lp.
   - new cost basis:
     ```
     (150 * 420 + 70 * 660) / (150 + 70) = 496.36.
     ```
   - total size = 220, cost basis = 496.36.

#### withdrawal:

4. **withdraw 50 lp**:
   - current cost basis = 496.36.
   - total size after withdrawal = 220 - 50 = 170.
   - total cost reduced:
     ```
     50 * 496.36 = 24818.18.
     ```
   - remaining cost:
     ```
     (220 * 496.36 - 24818.18) / 170 = 496.36 (unchanged since average cost basis doesn't change if you withdraw at avg price).
     ```

---

#### pnl:

1. **current usd value of lp**:

   - size = 170 lp, lp price = $2.4 \* 290 = $696/lp.
   - total value = 170 \* 696 = 118320.

2. **absolute pnl**:

   ```
   current usd value - cost basis * size
   = 118320 - 496.36 * 170
   = 118320 - 84381.82
   = 33938.18.
   ```

3. **relative pnl**:
   ```
   (current value / size) / avg cost basis
   = (696 / 496.36)
   = 1.402.
   ```
