// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC4626.sol";

/// @title MyERC4626Vault
/// @notice A vault that implements the ERC-4626 standard
contract MyERC4626Vault is ERC4626 {
    /// @notice Constructs the ERC-4626 vault
    /// @param asset The underlying asset the vault will manage
    constructor(IERC20 asset)
        ERC20("My Vault Token", "MVT")
        ERC4626(asset)
    {}

    

    /// @notice Deposits assets into the vault
    /// @param assets The amount of assets to deposit
    /// @param receiver The address receiving the vault shares
    /// @return shares The amount of shares minted
    function deposit(uint256 assets, address receiver) public override returns (uint256 shares) {
        shares = super.deposit(assets, receiver);
        emit Deposit(msg.sender, receiver, assets, shares);
    }

    /// @notice Withdraws assets from the vault
    /// @param assets The amount of assets to withdraw
    /// @param receiver The address receiving the assets
    /// @param owner The address of the shares owner
    /// @return shares The amount of shares burned
    function withdraw(uint256 assets, address receiver, address owner) public override returns (uint256 shares) {
        shares = super.withdraw(assets, receiver, owner);
        emit Withdraw(msg.sender, receiver, owner, assets, shares);
    }
}
