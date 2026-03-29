// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * ███╗   ██╗ ██████╗ ███████╗████████╗
 * ████╗  ██║██╔═══██╗██╔════╝╚══██╔══╝
 * ██╔██╗ ██║██║   ██║█████╗     ██║
 * ██║╚██╗██║██║   ██║██╔══╝     ██║
 * ██║ ╚████║╚██████╔╝███████╗   ██║
 * ╚═╝  ╚═══╝ ╚═════╝ ╚══════╝   ╚═╝
 *
 * @title  NOETToken (NOET)
 * @notice NOETICA reward token — mental wellness on COTI Network
 * @dev    ERC-20 with capped reward pool + anti-abuse daily limits
 *
 * ── Token Distribution ───────────────────────────────────────
 *   Total Supply     : 10,000,000 NOET
 *   Reward Pool      :  5,000,000 NOET  (50%) — minted on demand
 *   Team / Ecosystem :  3,000,000 NOET  (30%) — vested
 *   Liquidity        :  2,000,000 NOET  (20%) — DEX / Bancor
 *
 * ── Reward Schedule ──────────────────────────────────────────
 *   Journal entry         : +10  NOET
 *   Mood check-in         : +5   NOET
 *   3-day streak bonus    : +25  NOET
 *   7-day streak bonus    : +75  NOET
 *   30-day streak bonus   : +300 NOET
 *   First session         : +20  NOET (one-time)
 *   Daily maximum         : 150  NOET
 */
contract NOETToken is ERC20, Ownable, ReentrancyGuard {

    // ── Supply Constants ────────────────────────────────────
    uint256 public constant MAX_SUPPLY          = 10_000_000 * 1e18;
    uint256 public constant REWARD_POOL_CAP     =  5_000_000 * 1e18;

    // ── Reward Amounts ──────────────────────────────────────
    uint256 public constant REWARD_JOURNAL      = 10  * 1e18;
    uint256 public constant REWARD_MOOD         = 5   * 1e18;
    uint256 public constant REWARD_STREAK_3     = 25  * 1e18;
    uint256 public constant REWARD_STREAK_7     = 75  * 1e18;
    uint256 public constant REWARD_STREAK_30    = 300 * 1e18;
    uint256 public constant REWARD_FIRST_SESSION = 20 * 1e18;
    uint256 public constant DAILY_MAX           = 150 * 1e18;

    // ── State ───────────────────────────────────────────────
    uint256 public rewardPoolMinted;

    /// @dev Addresses authorized to mint rewards (backend oracle / multisig)
    mapping(address => bool) public rewardMinters;

    /// @dev Per-user tracking
    mapping(address => uint256) public lastRewardDay;
    mapping(address => uint256) public dailyMinted;
    mapping(address => uint256) public totalRewardsEarned;
    mapping(address => uint32)  public journalStreak;
    mapping(address => uint256) public lastJournalDay;
    mapping(address => bool)    public hasReceivedFirstSession;

    // ── Events ──────────────────────────────────────────────
    event RewardMinted(address indexed user, uint256 amount, string rewardType);
    event StreakUpdated(address indexed user, uint32 streak);
    event MinterSet(address indexed minter, bool authorized);
    event RewardPoolExhausted(uint256 remaining);

    // ── Constructor ─────────────────────────────────────────
    constructor(address initialOwner)
        ERC20("NOETICA Token", "NOET")
        Ownable(initialOwner)
    {
        // Mint team + liquidity allocation (50%) to owner at deploy
        uint256 initialMint = MAX_SUPPLY - REWARD_POOL_CAP;
        _mint(initialOwner, initialMint);
    }

    // ── Modifiers ────────────────────────────────────────────
    modifier onlyMinter() {
        require(
            rewardMinters[msg.sender] || msg.sender == owner(),
            "NOETToken: caller is not a reward minter"
        );
        _;
    }

    // ─────────────────────────────────────────────────────────
    // REWARD FUNCTIONS
    // Called by authorized backend oracle or multisig
    // ─────────────────────────────────────────────────────────

    /// @notice Reward user for completing a journal entry
    function rewardJournal(address user) external onlyMinter nonReentrant {
        _mintReward(user, REWARD_JOURNAL, "journal");
        _updateJournalStreak(user);
    }

    /// @notice Reward user for logging mood
    function rewardMood(address user) external onlyMinter nonReentrant {
        _mintReward(user, REWARD_MOOD, "mood");
    }

    /// @notice Reward streak milestone (3 / 7 / 30 days)
    function rewardStreak(address user, uint256 streakDays)
        external onlyMinter nonReentrant
    {
        uint256 amount;
        string memory label;

        if (streakDays >= 30) {
            amount = REWARD_STREAK_30;
            label  = "streak_30";
        } else if (streakDays >= 7) {
            amount = REWARD_STREAK_7;
            label  = "streak_7";
        } else if (streakDays >= 3) {
            amount = REWARD_STREAK_3;
            label  = "streak_3";
        } else {
            revert("NOETToken: invalid streak milestone");
        }

        _mintReward(user, amount, label);
    }

    /// @notice One-time reward for first AI session
    function rewardFirstSession(address user) external onlyMinter nonReentrant {
        require(!hasReceivedFirstSession[user], "NOETToken: already rewarded");
        hasReceivedFirstSession[user] = true;
        _mintReward(user, REWARD_FIRST_SESSION, "first_session");
    }

    // ─────────────────────────────────────────────────────────
    // INTERNAL HELPERS
    // ─────────────────────────────────────────────────────────

    function _mintReward(
        address user,
        uint256 amount,
        string memory rewardType
    ) internal {
        // Refresh daily quota if new day
        uint256 today = block.timestamp / 1 days;
        if (lastRewardDay[user] != today) {
            dailyMinted[user]   = 0;
            lastRewardDay[user] = today;
        }

        // Enforce daily cap
        uint256 remaining = DAILY_MAX > dailyMinted[user]
            ? DAILY_MAX - dailyMinted[user]
            : 0;
        uint256 toMint = amount > remaining ? remaining : amount;

        require(toMint > 0, "NOETToken: daily reward limit reached");

        // Enforce reward pool cap
        require(
            rewardPoolMinted + toMint <= REWARD_POOL_CAP,
            "NOETToken: reward pool exhausted"
        );

        dailyMinted[user]         += toMint;
        totalRewardsEarned[user]  += toMint;
        rewardPoolMinted          += toMint;

        _mint(user, toMint);
        emit RewardMinted(user, toMint, rewardType);

        // Warn when pool is 90% used
        if (rewardPoolMinted >= (REWARD_POOL_CAP * 90) / 100) {
            emit RewardPoolExhausted(REWARD_POOL_CAP - rewardPoolMinted);
        }
    }

    function _updateJournalStreak(address user) internal {
        uint256 today     = block.timestamp / 1 days;
        uint256 yesterday = today - 1;

        if (lastJournalDay[user] == yesterday) {
            journalStreak[user]++;
        } else if (lastJournalDay[user] != today) {
            journalStreak[user] = 1;
        }

        lastJournalDay[user] = today;
        emit StreakUpdated(user, journalStreak[user]);
    }

    // ─────────────────────────────────────────────────────────
    // VIEW FUNCTIONS
    // ─────────────────────────────────────────────────────────

    /// @notice Full user stats in one call
    function getUserStats(address user) external view returns (
        uint256 balance,
        uint256 earned,
        uint32  streak,
        uint256 dailyClaimed,
        bool    dailyLimitReached,
        bool    canClaimFirstSession
    ) {
        uint256 today    = block.timestamp / 1 days;
        uint256 claimed  = lastRewardDay[user] == today ? dailyMinted[user] : 0;
        return (
            balanceOf(user),
            totalRewardsEarned[user],
            journalStreak[user],
            claimed,
            claimed >= DAILY_MAX,
            !hasReceivedFirstSession[user]
        );
    }

    /// @notice Remaining tokens in reward pool
    function rewardPoolRemaining() external view returns (uint256) {
        return REWARD_POOL_CAP - rewardPoolMinted;
    }

    /// @notice Percentage of reward pool used (0–100)
    function rewardPoolUsedPct() external view returns (uint256) {
        return (rewardPoolMinted * 100) / REWARD_POOL_CAP;
    }

    // ─────────────────────────────────────────────────────────
    // ADMIN
    // ─────────────────────────────────────────────────────────

    function setMinter(address minter, bool authorized) external onlyOwner {
        rewardMinters[minter] = authorized;
        emit MinterSet(minter, authorized);
    }

    /// @notice Emergency: recover any ERC20 sent to this contract by mistake
    function recoverERC20(address token, uint256 amount) external onlyOwner {
        require(token != address(this), "NOETToken: cannot recover NOET itself");
        IERC20(token).transfer(owner(), amount);
    }
}
