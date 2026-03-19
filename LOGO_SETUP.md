# USDT Logo Setup Guide

## Official USDT Logo Sources

### Option 1: Direct Download
Download the official Tether logo from:
- **Tether Official Assets**: https://tether.to/en/about/brand-guidelines/
- **GitHub**: https://github.com/tetherto/tether-assets
- **CoinGecko**: https://coin.gecko.io/tether

### Option 2: Recommended Logo Files
Once downloaded, place files in the `assets/` directory:

```
assets/
├── tether-logo.png          # Square logo (recommended)
├── tether-logo-circle.png   # Round logo
├── tether-logo.svg          # Vector format
└── README.md                # Logo credits/license
```

## Setup Instructions

1. **Download the official logo**:
   ```bash
   # Option A: From Tether official site (manual download)
   # Download from: https://tether.to/en/about/brand-guidelines/
   # Save to: assets/tether-logo.png
   
   # Option B: From GitHub (if available)
   curl -o assets/tether-logo.png https://raw.githubusercontent.com/tetherto/tether-assets/main/logo.png
   ```

2. **Update README.md** to include:
   ```markdown
   ![USDT Logo](./assets/tether-logo.png)
   ```

3. **For token listings**, update metadata files with logo URL

## Logo License
The official Tether logo is used under Tether's brand guidelines.
Ensure compliance with their terms when using commercially.

Reference: https://tether.to/en/about/brand-guidelines/
