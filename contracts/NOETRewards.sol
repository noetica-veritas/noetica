// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./NOETToken.sol";

/**
 * @title  NOETRewards
 * @notice Oracle-style contract that mediates between the frontend and NOETToken.
 *         Users call claimXxx() directly — the contract verifies eligibility
 *         and calls the token's mint functions.
 *
 * @dev    Security model:
 *         - Users can only claim once per day per action type
 *         - Backend can optionally sign off-chain proofs (future upgrade)
 *         - Owner can pause and adjust parameters
 */
contract NOETRewards is Ownable, ReentrancyGuard {

    NOETToken public immutable token;

    // Per-user, per-action cooldowns (unix day number)
    mapping(address => uint256) public lastJournalClaim;
    mapping(address => uint256) public lastMoodClaim;
    mapping(address => uint256) public lastStreakClaim;

    bool public paused;

    event JournalClaimed(address indexed user);
    event MoodClaimed(address indexed user);
    event StreakClaimed(address indexed user, uint256 streakDays);
    event FirstSessionClaimed(address indexed user);

    modifier notPaused() {
        require(!paused, "NOETRewards: contract is paused");
        _;
    }

    constructor(address _token, address _owner)
        Ownable(_owner)
    {
        token = NOETToken(_token);
    }

    // ─────────────────────────────────────────────────────────
    // CLAIM FUNCTIONS — callable by users
    // ─────────────────────────────────────────────────────────

    /// @notice Claim daily journal reward
    function claimJournalReward() external notPaused nonReentrant {
        uint256 today = _today();
        require(lastJournalClaim[msg.sender] < today, "NOETRewards: journal already claimed today");
        lastJournalClaim[msg.sender] = today;
        token.rewardJournal(msg.sender);
        emit JournalClaimed(msg.sender);
    }

    /// @notice Claim daily mood check-in reward
    function claimMoodReward() external notPaused nonReentrant {
        uint256 today = _today();
        require(lastMoodClaim[msg.sender] < today, "NOETRewards: mood already claimed today");
        lastMoodClaim[msg.sender] = today;
        token.rewardMood(msg.sender);
        emit MoodClaimed(msg.sender);
    }

    /// @notice Claim streak milestone reward (3 / 7 / 30 days)
    /// @param streakDays The streak milestone to claim (must be 3, 7, or 30)
    function claimStreakReward(uint256 streakDays) external notPaused nonReentrant {
        require(
            streakDays == 3 || streakDays == 7 || streakDays == 30,
            "NOETRewards: invalid streak milestone"
        );
        // Allow one streak claim per week to prevent abuse
        require(
            lastStreakClaim[msg.sender] + 7 days <= block.timestamp,
            "NOETRewards: streak claimed too recently"
        );
        lastStreakClaim[msg.sender] = block.timestamp;
        token.rewardStreak(msg.sender, streakDays);
        emit StreakClaimed(msg.sender, streakDays);
    }

    /// @notice One-time first session reward
    function claimFirstSession() external notPaused nonReentrant {
        token.rewardFirstSession(msg.sender);
        emit FirstSessionClaimed(msg.sender);
    }

    // ─────────────────────────────────────────────────────────
    // VIEW
    // ─────────────────────────────────────────────────────────

    function canClaimJournal(address user) external view returns (bool) {
        return lastJournalClaim[user] < _today();
    }

    function canClaimMood(address user) external view returns (bool) {
        return lastMoodClaim[user] < _today();
    }

    function canClaimStreak(address user) external view returns (bool) {
        return lastStreakClaim[user] + 7 days <= block.timestamp;
    }

    function getUserClaimStatus(address user) external view returns (
        bool journalAvailable,
        bool moodAvailable,
        bool streakAvailable,
        uint256 noetBalance
    ) {
        return (
            lastJournalClaim[user] < _today(),
            lastMoodClaim[user] < _today(),
            lastStreakClaim[user] + 7 days <= block.timestamp,
            token.balanceOf(user)
        );
    }

    // ─────────────────────────────────────────────────────────
    // ADMIN
    // ─────────────────────────────────────────────────────────

    function setPaused(bool _paused) external onlyOwner {
        paused = _paused;
    }

    // ─────────────────────────────────────────────────────────
    // INTERNAL
    // ─────────────────────────────────────────────────────────

    function _today() internal view returns (uint256) {
        return block.timestamp / 1 days;
    }
}
