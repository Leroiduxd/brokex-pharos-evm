// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IERC20 {
    function balanceOf(address account) external view returns (uint256);
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
}

interface ICore {
    function emergencyMode()      external view returns (bool);
    function totalLockedCapital() external view returns (uint256);
}

contract BrokexVault {

    // =========================================================
    // State
    // =========================================================

    IERC20  public immutable USDC;
    address public owner;
    address public pendingOwner;
    address public primaryCore;
    bool    public coreLocked;

    // =========================================================
    // Errors
    // =========================================================

    error NotOwner();
    error NotPendingOwner();
    error NotCore();
    error ZeroAddress();
    error ZeroAmount();
    error TransferFailed();
    error CoreAlreadyLocked();
    error CoreNotSet();
    error InsufficientFreeCapital();

    // =========================================================
    // Modifiers
    // =========================================================

    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }

    modifier onlyCore() {
        if (msg.sender != primaryCore) revert NotCore();
        _;
    }

    // =========================================================
    // Constructor
    // =========================================================

    constructor(address usdc) {
        if (usdc == address(0)) revert ZeroAddress();
        USDC  = IERC20(usdc);
        owner = msg.sender;
    }

    // =========================================================
    // Ownership
    // =========================================================

    function transferOwnership(address newOwner) external onlyOwner {
        if (newOwner == address(0)) revert ZeroAddress();
        pendingOwner = newOwner;
    }

    function acceptOwnership() external {
        if (msg.sender != pendingOwner) revert NotPendingOwner();
        owner        = pendingOwner;
        pendingOwner = address(0);
    }

    // =========================================================
    // Core management
    // =========================================================

    function setPrimaryCore(address newCore) external onlyOwner {
        if (coreLocked)              revert CoreAlreadyLocked();
        if (newCore == address(0))   revert ZeroAddress();
        primaryCore = newCore;
    }

    function lockCore() external onlyOwner {
        if (primaryCore == address(0)) revert CoreNotSet();
        coreLocked = true;
    }

    // =========================================================
    // Owner capital
    // =========================================================

    function deposit(uint256 amount) external onlyOwner {
        if (amount == 0) revert ZeroAmount();
        if (!USDC.transferFrom(msg.sender, address(this), amount)) revert TransferFailed();
    }

    function withdraw(uint256 amount) external onlyOwner {
        if (amount == 0) revert ZeroAmount();

        uint256 bal = USDC.balanceOf(address(this));
        uint256 allowed = bal;

        if (primaryCore != address(0) && !ICore(primaryCore).emergencyMode()) {
            uint256 locked = ICore(primaryCore).totalLockedCapital();
            allowed = bal > locked ? bal - locked : 0;
        }

        if (amount > allowed) revert InsufficientFreeCapital();
        if (!USDC.transfer(owner, amount)) revert TransferFailed();
    }

    // =========================================================
    // Core-only
    // =========================================================

    function payTrader(address trader, uint256 amount) external onlyCore {
        if (amount == 0) return;
        if (!USDC.transfer(trader, amount)) revert TransferFailed();
    }
}
