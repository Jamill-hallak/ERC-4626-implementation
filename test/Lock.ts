import { expect } from "chai";
import { ethers } from "hardhat";
import { MyERC4626Vault, ERC20 } from "../typechain";

describe("MyERC4626Vault", function () {
  let Token: ERC20;
  let token: ERC20;
  let Vault: MyERC4626Vault;
  let vault: MyERC4626Vault;
  let owner: any;
  let addr1: any;

  beforeEach(async function () {
    const TokenFactory = await ethers.getContractFactory("ERC20");
    token = (await TokenFactory.deploy("Test Token", "TTK", ethers.utils.parseEther("1000"))) as ERC20;
    await token.deployed();

    const VaultFactory = await ethers.getContractFactory("MyERC4626Vault");
    vault = (await VaultFactory.deploy(token.address)) as MyERC4626Vault;
    await vault.deployed();

    [owner, addr1] = await ethers.getSigners();
  });

  describe("Deposit functionality", function () {
    it("Should allow deposits and mint shares", async function () {
      await token.approve(vault.address, ethers.utils.parseEther("100"));
      await expect(vault.deposit(ethers.utils.parseEther("100"), owner.address))
        .to.emit(vault, 'Deposit')
        .withArgs(owner.address, owner.address, ethers.utils.parseEther("100"), ethers.utils.parseEther("100"));

      expect(await vault.balanceOf(owner.address)).to.equal(ethers.utils.parseEther("100"));
    });

    it("Should revert if not enough allowance", async function () {
      await expect(vault.deposit(ethers.utils.parseEther("100"), owner.address)).to.be.revertedWith("ERC20: transfer amount exceeds allowance");
    });
  });

  describe("Withdraw functionality", function () {
    it("Should allow withdrawals and burn shares", async function () {
      await token.approve(vault.address, ethers.utils.parseEther("100"));
      await vault.deposit(ethers.utils.parseEther("100"), owner.address);

      await expect(vault.withdraw(ethers.utils.parseEther("50"), owner.address, owner.address))
        .to.emit(vault, 'Withdraw')
        .withArgs(owner.address, owner.address, owner.address, ethers.utils.parseEther("50"), ethers.utils.parseEther("50"));

      expect(await vault.balanceOf(owner.address)).to.equal(ethers.utils.parseEther("50"));
      expect(await token.balanceOf(owner.address)).to.equal(ethers.utils.parseEther("950"));
    });

    it("Should revert if withdrawal amount exceeds balance", async function () {
      await expect(vault.withdraw(ethers.utils.parseEther("100"), owner.address, owner.address)).to.be.revertedWith("ERC4626: withdraw amount exceeds balance");
    });
  });

  describe("Mint functionality", function () {
    it("Should mint shares to receiver", async function () {
      await token.approve(vault.address, ethers.utils.parseEther("100"));
      await expect(vault.mint(ethers.utils.parseEther("100"), owner.address))
        .to.emit(vault, 'Mint')
        .withArgs(owner.address, owner.address, ethers.utils.parseEther("100"), ethers.utils.parseEther("100"));

      expect(await vault.balanceOf(owner.address)).to.equal(ethers.utils.parseEther("100"));
    });

    it("Should revert if minting without enough assets", async function () {
      await expect(vault.mint(ethers.utils.parseEther("1000"), owner.address)).to.be.revertedWith("ERC4626: mint amount exceeds balance");
    });
  });

  describe("Redeem functionality", function () {
    it("Should redeem shares for underlying assets", async function () {
      await token.approve(vault.address, ethers.utils.parseEther("100"));
      await vault.deposit(ethers.utils.parseEther("100"), owner.address);

      await expect(vault.redeem(ethers.utils.parseEther("50"), owner.address, owner.address))
        .to.emit(vault, 'Redeem')
        .withArgs(owner.address, owner.address, owner.address, ethers.utils.parseEther("50"), ethers.utils.parseEther("50"));

      expect(await vault.balanceOf(owner.address)).to.equal(ethers.utils.parseEther("50"));
      expect(await token.balanceOf(owner.address)).to.equal(ethers.utils.parseEther("950"));
    });

    it("Should revert if redeeming more than balance", async function () {
      await expect(vault.redeem(ethers.utils.parseEther("100"), owner.address, owner.address)).to.be.revertedWith("ERC4626: redeem amount exceeds balance");
    });
  });

  // Additional tests for edge cases and other functionalities
});
