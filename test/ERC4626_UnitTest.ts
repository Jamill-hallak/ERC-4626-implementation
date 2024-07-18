import { expect } from "chai";
import { ethers } from "hardhat";
import { MyERC4626Vault, TestERC20 } from "../typechain-types";

describe("MyERC4626Vault", function () {
  let token: TestERC20;
  let vault: MyERC4626Vault;
  let owner: any;
  let addr1: any;

  beforeEach(async function () {
    const TokenFactory = await ethers.getContractFactory("TestERC20");
    token = (await TokenFactory.deploy("Test Token", "TTK", BigInt("1000"))) as TestERC20;

    const VaultFactory = await ethers.getContractFactory("MyERC4626Vault");
    vault = (await VaultFactory.deploy(token.getAddress())) as MyERC4626Vault;

    [owner, addr1] = await ethers.getSigners();
  });

  describe("Deposit functionality", function () {
    it("Should allow deposits and mint shares", async function () {
      await token.approve(vault.getAddress(), BigInt("100"));

      await expect(vault.deposit(BigInt("100"), owner.address))
        .to.emit(vault, 'Deposit')
        .withArgs(owner.address, owner.address, BigInt("100"), BigInt("100"));

      expect(await vault.balanceOf(owner.address)).to.equal(BigInt("100"));
    });

    it("Should revert if not enough allowance", async function () {
      await expect(vault.deposit(BigInt("100"), owner.address)).to.be.revertedWithCustomError(
        vault,
        "ERC20InsufficientAllowance"
      );
    });
  });

  describe("Withdraw functionality", function () {
    it("Should allow withdrawals and burn shares", async function () {
      await token.approve(vault.getAddress(), BigInt("100"));
      await vault.deposit(BigInt("100"), owner.address);

      await expect(vault.withdraw(BigInt("50"), owner.address, owner.address))
        .to.emit(vault, 'Withdraw')
        .withArgs(owner.address, owner.address, owner.address, BigInt("50"), BigInt("50"));

      expect(await vault.balanceOf(owner.address)).to.equal(BigInt("50"));
      expect(await token.balanceOf(owner.address)).to.equal(BigInt("950"));
    });

    it("Should revert if withdrawal amount exceeds balance", async function () {
      await expect(vault.withdraw(BigInt("100"), owner.address, owner.address)).to.be.revertedWithCustomError(
        vault,
        "ERC4626ExceededMaxWithdraw"
      );
    });
  });

  describe("Mint functionality", function () {
    it("Should mint shares to receiver", async function () {
      await token.approve(vault.getAddress(), BigInt("100"));

      await vault.mint(BigInt("100"), owner.address);


      expect(await vault.balanceOf(owner.address)).to.equal(BigInt("100"));
    });

    it("Should revert if minting without enough assets", async function () {
      await expect(vault.mint(BigInt("1000"), owner.address)).to.be.revertedWithCustomError(
        vault,
        "ERC20InsufficientAllowance"
      );
    });
  });

  describe("Redeem functionality", function () {
    it("Should redeem shares for underlying assets", async function () {
      await token.approve(vault.getAddress(), BigInt("100"));
      await vault.deposit(BigInt("100"), owner.address);

      

      expect(await vault.balanceOf(owner.address)).to.equal(BigInt("100"));
      expect(await token.balanceOf(owner.address)).to.equal(BigInt("900"));
    });

    it("Should revert if redeeming more than balance", async function () {
      await expect(vault.redeem(BigInt("100"), owner.address, owner.address)).to.be.revertedWithCustomError(
        vault,
        "ERC4626ExceededMaxRedeem"
      );
    });
  });
});
