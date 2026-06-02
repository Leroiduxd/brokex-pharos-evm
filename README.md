# Brokex Pharos EVM

This repository contains the core smart contracts for the **Brokex Protocol** deployed on the **Pharos EVM** network.

## Contracts

- **`BrokexCore.sol`**: The main trading engine handling order matching, execution, PnL settlement, and positions.
- **`BrokexVault.sol`**: The liquidity pool (LP) manager securing USDC deposits, locking/unlocking capital, and settling trader profits/losses.
- **`BrokexLens.sol`**: A read-only query aggregator optimizing frontend telemetry and on-chain state diagnostics.

## Features

- **Stateless Architecture**: Minimized storage layout and optimized gas overhead.
- **Guaranteed Stop Loss**: Option for zero-slippage execution with specialized fee structure.
- **SupraOracles Integration**: Live oracle price validation for low-latency market and limit order execution.
- **Risk Signer Verification**: Secure KMS signature flow validating maximum global and trader Open Interest.

## Deployed Addresses (Pharos Testnet)

- **`BrokexCore`**: `0xd2bD5f41beEe50629F909B9c697D511ad7c43517`
- **`BrokexVault`**: `0x0AF3B92d4D73590ad520E325202c7Ffe92D51D61`
- **`BrokexLens`**: `0xc3075b9f71c4c8d57d727b140cd4de77265276d9`

## Tech Stack & Setup

- **Framework**: Hardhat
- **Solidity Version**: `^0.8.24`
- **Compiler Target**: `paris`
