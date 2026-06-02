// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IERC20 {
    function balanceOf(address account) external view returns (uint256);
}

interface IBrokexCore {
    struct Trade {
        uint256 id;
        address trader;
        uint256 supraId;
        uint8   state;
        uint8   direction;
        uint8   orderType;
        uint256 margin;
        uint256 leverage;
        uint256 targetPrice;
        uint256 openPrice;
        uint256 closePrice;
        uint256 stopLoss;
        uint256 takeProfit;
        uint256 openTimestamp;
        uint256 closeTimestamp;
        bool    guaranteedSL;
    }

    struct AssetConfig {
        uint256 minLeverage;
        uint256 maxLeverage;
        uint256 minTradeSize;
        uint256 commissionBps;
        uint256 borrowRateHourly;
        uint256 profitCap;
        uint256 executionTolerance;
        uint256 maxProofAge;
        uint256 maxTraderOI;
        uint256 maxGlobalOI;
        uint256 lockedCapitalBps;
        uint256 liqThresholdBps;
        uint256 guaranteedSLFeeBps;
        bool    listed;
        bool    frozen;
    }

    function trades(uint256 tradeId)                     external view returns (Trade memory);
    function nextTradeId()                               external view returns (uint256);
    function openInterestLong(uint256 supraId)          external view returns (uint256);
    function openInterestShort(uint256 supraId)         external view returns (uint256);
    function totalLockedCapital()                        external view returns (uint256);
    function traderOpenInterest(uint256 supraId, address trader) external view returns (uint256);
    function assets(uint256 supraId)                     external view returns (AssetConfig memory);
    function paused()                                    external view returns (bool);
    function emergencyMode()                             external view returns (bool);
    function owner()                                     external view returns (address);
    function kmsSigner()                                 external view returns (address);
    function USDC()                                      external view returns (address);
}

interface IBrokexVault {
    function owner()           external view returns (address);
    function primaryCore()     external view returns (address);
    function coreLocked()      external view returns (bool);
}

// =============================================================
// BrokexLens — read-only view aggregator
// =============================================================

contract BrokexLens {

    IBrokexCore public immutable core;
    IBrokexVault public immutable vault;

    constructor(address coreAddress, address vaultAddress) {
        core  = IBrokexCore(coreAddress);
        vault = IBrokexVault(vaultAddress);
    }

    // =========================================================
    // Structs returned by Lens
    // =========================================================

    struct Trade {
        uint256 id;
        address trader;
        uint256 supraId;
        uint8   state;
        uint8   direction;
        uint8   orderType;
        uint256 margin;
        uint256 leverage;
        uint256 targetPrice;
        uint256 openPrice;
        uint256 closePrice;
        uint256 stopLoss;
        uint256 takeProfit;
        uint256 openTimestamp;
        uint256 closeTimestamp;
        uint256 liqPrice;
        bool    guaranteedSL;
    }

    struct TradeState {
        uint256 id;
        uint8   state;
    }

    struct TradeStops {
        uint256 id;
        uint256 stopLoss;
        uint256 takeProfit;
        uint256 liqPrice;
        bool    guaranteedSL;
    }

    struct ProtocolSnapshot {
        // Core state
        uint256 lastTradeId;          // highest trade id that exists
        bool    paused;
        bool    emergencyMode;
        address coreOwner;
        address kmsSigner;
        // Vault state
        uint256 lpTotalCapital;
        uint256 lpFreeCapital;
        uint256 lpLockedCapital;
        uint256 vaultUsageBps;        // lpLockedCapital / lpTotalCapital in bps (10000 = 100%)
        address vaultOwner;
        address vaultCore;
        bool    coreLocked;
    }

    struct AssetSnapshot {
        uint256 supraId;
        uint256 openInterestLong;
        uint256 openInterestShort;
        uint256 totalOpenInterest;
        IBrokexCore.AssetConfig config;
    }

    // =========================================================
    // Helpers
    // =========================================================

    function _liqPrice(
        uint256 openPrice,
        uint256 leverage,
        uint8 direction,
        uint256 liqThresholdBps
    ) internal pure returns (uint256) {
        if (leverage == 0) return 0;
        uint256 move = (openPrice * liqThresholdBps) / (leverage * 1e6);
        if (direction == 1) return openPrice > move ? openPrice - move : 0;
        return openPrice + move;
    }

    // =========================================================
    // 1. Full trade structs — range
    // =========================================================

    /// @notice Returns trades from `startId` to `startId + length - 1`.
    ///         Trades that don't exist yet (id >= nextTradeId) are returned
    ///         with all fields zero.
    function getTradeRange(uint256 startId, uint256 length)
        external view returns (Trade[] memory result)
    {
        result = new Trade[](length);
        for (uint256 i = 0; i < length; i++) {
            IBrokexCore.Trade memory t = core.trades(startId + i);
            IBrokexCore.AssetConfig memory cfg = core.assets(t.supraId);
            uint256 liq = t.state == 1 // STATE_OPEN
                ? _liqPrice(t.openPrice, t.leverage, t.direction, cfg.liqThresholdBps)
                : _liqPrice(t.targetPrice, t.leverage, t.direction, cfg.liqThresholdBps);
            result[i] = Trade({
                id:             t.id,
                trader:         t.trader,
                supraId:        t.supraId,
                state:          t.state,
                direction:      t.direction,
                orderType:      t.orderType,
                margin:         t.margin,
                leverage:       t.leverage,
                targetPrice:    t.targetPrice,
                openPrice:      t.openPrice,
                closePrice:     t.closePrice,
                stopLoss:       t.stopLoss,
                takeProfit:     t.takeProfit,
                openTimestamp:  t.openTimestamp,
                closeTimestamp: t.closeTimestamp,
                liqPrice:       liq,
                guaranteedSL:   t.guaranteedSL
            });
        }
    }

    // =========================================================
    // 2. Full trade structs — list of ids
    // =========================================================

    function getTradesByIds(uint256[] calldata ids)
        external view returns (Trade[] memory result)
    {
        result = new Trade[](ids.length);
        for (uint256 i = 0; i < ids.length; i++) {
            IBrokexCore.Trade memory t = core.trades(ids[i]);
            IBrokexCore.AssetConfig memory cfg = core.assets(t.supraId);
            uint256 liq = t.state == 1 // STATE_OPEN
                ? _liqPrice(t.openPrice, t.leverage, t.direction, cfg.liqThresholdBps)
                : _liqPrice(t.targetPrice, t.leverage, t.direction, cfg.liqThresholdBps);
            result[i] = Trade({
                id:             ids[i],
                trader:         t.trader,
                supraId:        t.supraId,
                state:          t.state,
                direction:      t.direction,
                orderType:      t.orderType,
                margin:         t.margin,
                leverage:       t.leverage,
                targetPrice:    t.targetPrice,
                openPrice:      t.openPrice,
                closePrice:     t.closePrice,
                stopLoss:       t.stopLoss,
                takeProfit:     t.takeProfit,
                openTimestamp:  t.openTimestamp,
                closeTimestamp: t.closeTimestamp,
                liqPrice:       liq,
                guaranteedSL:   t.guaranteedSL
            });
        }
    }

    // =========================================================
    // 3. States only — range
    // =========================================================

    function getStateRange(uint256 startId, uint256 length)
        external view returns (TradeState[] memory result)
    {
        result = new TradeState[](length);
        for (uint256 i = 0; i < length; i++) {
            IBrokexCore.Trade memory t = core.trades(startId + i);
            result[i] = TradeState({ id: startId + i, state: t.state });
        }
    }

    // =========================================================
    // 4. States only — list of ids
    // =========================================================

    function getStatesByIds(uint256[] calldata ids)
        external view returns (TradeState[] memory result)
    {
        result = new TradeState[](ids.length);
        for (uint256 i = 0; i < ids.length; i++) {
            IBrokexCore.Trade memory t = core.trades(ids[i]);
            result[i] = TradeState({ id: ids[i], state: t.state });
        }
    }

    // =========================================================
    // 5. SL / TP / liqPrice only — range
    // =========================================================

    function getStopsRange(uint256 startId, uint256 length)
        external view returns (TradeStops[] memory result)
    {
        result = new TradeStops[](length);
        for (uint256 i = 0; i < length; i++) {
            IBrokexCore.Trade memory t = core.trades(startId + i);
            IBrokexCore.AssetConfig memory cfg = core.assets(t.supraId);
            uint256 liq = t.state == 1 // STATE_OPEN
                ? _liqPrice(t.openPrice, t.leverage, t.direction, cfg.liqThresholdBps)
                : _liqPrice(t.targetPrice, t.leverage, t.direction, cfg.liqThresholdBps);
            result[i] = TradeStops({
                id:           startId + i,
                stopLoss:     t.stopLoss,
                takeProfit:   t.takeProfit,
                liqPrice:     liq,
                guaranteedSL: t.guaranteedSL
            });
        }
    }

    // =========================================================
    // 6. SL / TP / liqPrice only — list of ids
    // =========================================================

    function getStopsByIds(uint256[] calldata ids)
        external view returns (TradeStops[] memory result)
    {
        result = new TradeStops[](ids.length);
        for (uint256 i = 0; i < ids.length; i++) {
            IBrokexCore.Trade memory t = core.trades(ids[i]);
            IBrokexCore.AssetConfig memory cfg = core.assets(t.supraId);
            uint256 liq = t.state == 1 // STATE_OPEN
                ? _liqPrice(t.openPrice, t.leverage, t.direction, cfg.liqThresholdBps)
                : _liqPrice(t.targetPrice, t.leverage, t.direction, cfg.liqThresholdBps);
            result[i] = TradeStops({
                id:           ids[i],
                stopLoss:     t.stopLoss,
                takeProfit:   t.takeProfit,
                liqPrice:     liq,
                guaranteedSL: t.guaranteedSL
            });
        }
    }

    // =========================================================
    // 7. Protocol snapshot & Asset snapshot
    // =========================================================

    function getProtocolSnapshot() external view returns (ProtocolSnapshot memory s) {
        uint256 lastId        = core.nextTradeId() - 1;
        
        address usdcAddress   = core.USDC();
        uint256 totalCapital  = IERC20(usdcAddress).balanceOf(address(vault));
        uint256 lockedCapital = core.totalLockedCapital();
        uint256 freeCapital   = totalCapital > lockedCapital ? totalCapital - lockedCapital : 0;

        s = ProtocolSnapshot({
            lastTradeId:        lastId,
            paused:             core.paused(),
            emergencyMode:      core.emergencyMode(),
            coreOwner:          core.owner(),
            kmsSigner:          core.kmsSigner(),
            lpTotalCapital:     totalCapital,
            lpFreeCapital:      freeCapital,
            lpLockedCapital:    lockedCapital,
            vaultUsageBps:      totalCapital > 0
                                    ? (lockedCapital * 10_000) / totalCapital
                                    : 0,
            vaultOwner:         vault.owner(),
            vaultCore:          vault.primaryCore(),
            coreLocked:         vault.coreLocked()
        });
    }

    function getAssetSnapshot(uint256 assetId) external view returns (AssetSnapshot memory s) {
        uint256 oiLong  = core.openInterestLong(assetId);
        uint256 oiShort = core.openInterestShort(assetId);
        s = AssetSnapshot({
            supraId:           assetId,
            openInterestLong:  oiLong,
            openInterestShort: oiShort,
            totalOpenInterest: oiLong + oiShort,
            config:            core.assets(assetId)
        });
    }

    // =========================================================
    // 8. Trader open interest
    // =========================================================

    function getTraderOI(uint256 assetId, address trader) external view returns (uint256) {
        return core.traderOpenInterest(assetId, trader);
    }

    function getTraderOIBatch(uint256 assetId, address[] calldata traders)
        external view returns (uint256[] memory result)
    {
        result = new uint256[](traders.length);
        for (uint256 i = 0; i < traders.length; i++) {
            result[i] = core.traderOpenInterest(assetId, traders[i]);
        }
    }
}