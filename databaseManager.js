const fs = require("fs");
const dayjs = require("dayjs");
const { reduce } = require("lodash");

let databaseExists = false;
let databaseInstance = null;
let users = {};

const DB_FILE_NAME = "db.json";

const getDatabase = () => {
  if (!databaseExists) {
    databaseInstance = database();
    databaseExists = true;
  }
  return databaseInstance;
};

const _createNewUser = (user, points = 0, isTagged = false) => {
  users[user.id] = {
    username: user.username,
    displayName: user.displayName,
    firstAdded: dayjs(),
    bestStreak: 0,
    lastTagged: dayjs(),
    totalSurvivalTime: 0,
    survivalTimeLastUpdated: dayjs(),
    isTagged,
    points,
  };
};

const getOrCreateUser = (user, points = 0, isTagged = false) => {
  if (!(user.id in users)) {
    _createNewUser(user, points, isTagged);
  }
  return users[user.id];
};

const importDb = () => {
  if (fs.existsSync(`./${DB_FILE_NAME}`)) {
    const dehydratedUsers = require(`./${DB_FILE_NAME}`);
    Object.entries(dehydratedUsers).map(([id, user]) => {
      users[id] = {
        ...user,
        firstAdded: dayjs(user.firstAdded),
        lastTagged: dayjs(user.lastTagged),
      };
    });
  }
};

// TODO: do this on a second thread so it doesn't slow stuff down?
const exportDb = () => {
  fs.writeFile(`./${DB_FILE_NAME}`, JSON.stringify(users), function (err) {
    if (err) throw err;
  });
};

const database = () => {
  importDb();

  const addUser = (user) => {
    getOrCreateUser(user);
    exportDb();
  };

  const tagUser = (userToTag, tagger) => {
    // first, add a point for the tagger
    const _tagger = getOrCreateUser(tagger);
    const toTag = getOrCreateUser(userToTag, 0, true);

    const bounty = _calculateBounty(toTag.lastTagged);

    _tagger.points += bounty;
    if (_tagger.isTagged) {
      _tagger.isTagged = false;
    }

    // next, reset the tagged user's streak
    const taggedTime = dayjs();
    const streak = taggedTime.diff(toTag.lastTagged, "day");
    const newPoints = toTag.points + bounty;
    users[userToTag.id] = {
      ...toTag,
      lastTagged: dayjs(),
      isTagged: true,
      points: newPoints,
      ...{
        bestStreak: streak > toTag.bestStreak ? streak : toTag.bestStreak,
      },
      totalSurvivalTime: toTag.totalSurvivalTime + streak,
    };
    exportDb();
  };
  const _calculateBounty = (lastTagged, isTagged = false) => {
    if (isTagged) {
      return 0;
    }
    const now = dayjs();
    return Math.ceil(now.diff(lastTagged, "day", true) * 100);
  };
  const getUsers = () => {
    return Object.keys(users);
  };
  const updateBestStreak = (userId) => {
    if (userId in users) {
      const { bestStreak: currentBestStreak, lastTagged } = users[userId];
      if (currentBestStreak == 0) {
        const newBestStreak = dayjs().diff(lastTagged, "day");
        if (newBestStreak > currentBestStreak) {
          users[userId].bestStreak = newBestStreak;
          exportDb();
          return newBestStreak;
        } else {
          return currentBestStreak;
        }
      } else {
        return currentBestStreak;
      }
    }
    return -1;
  };
  const updateTotalSurvivalTime = (userId) => {
    if (userId in users) {
      const { survivalTimeLastUpdated, totalSurvivalTime } = users[userId];
      const now = dayjs();
      const update = now.diff(survivalTimeLastUpdated, "days");
      const newSurvivalTime = totalSurvivalTime + update;
      users[userId].totalSurvivalTime = newSurvivalTime;
      users[userId].survivalTimeLastUpdated = now;
      exportDb();
      return newSurvivalTime;
    }
    return -1;
  };
  const getScoreboard = () => {
    return Object.keys(users).map((id) => {
      const { points, displayName, lastTagged, isTagged } = users[id];
      const bounty = _calculateBounty(lastTagged, isTagged);
      const bestStreak = updateBestStreak(id);
      const totalSurvivalTime = updateTotalSurvivalTime(id);
      const bestStreakDaysString = bestStreak == 1 ? "day" : "days";
      const totalSurvivalTimeDaysString =
        totalSurvivalTime == 1 ? "day" : "days";
      const currentBountyBlurb = isTagged ? "Tagger" : `Bounty: ${bounty}`;
      return `${displayName}:\n\tPoints: ${points}\n\tBest Streak: ${bestStreak} ${bestStreakDaysString}\n\tTotal Time Survived: ${totalSurvivalTime} ${totalSurvivalTimeDaysString}\n\t${currentBountyBlurb}`;
    });
  };
  const checkIfTagged = (user) => {
    if (user in users) {
      return users[user].isTagged;
    }
    return false; // can't be tagged if you don't exist
  };
  const getScore = (user) => {
    if (user in users) {
      return users[user].bestStreak;
    }
    return 0;
  };
  const getScores = () => {
    return reduce(
      users,
      (result, user) => {
        result[user.displayName] = user.points;
      },
      {},
    );
  };
  const getTotalStreak = (user) => {
    if (user in users) {
      return users[user].totalSurvivalTime;
    }
    return 0;
  };
  const getBestStreak = (user) => {
    if (user in users) {
      return users[user].bestStreak;
    }
    return 0;
  };
  const getCurrentStreak = (user) => {
    if (user in users) {
      return dayjs().diff(users[user].lastTagged, "day");
    }
    return 0;
  };
  const getAllCurrentStreaks = () => {
    return reduce(
      users,
      (result, user) => {
        result[user.displayName] = dayjs().diff(users[user].lastTagged, "day");
      },
      {},
    );
  };
  const getAllBestStreaks = () => {
    return reduce(
      users,
      (result, user) => {
        result[user.displayName] = user.bestStreak;
      },
      {},
    );
  };
  const getAllTotalStreaks = () => {
    return reduce(
      users,
      (result, user) => {
        result[user.displayName] = user.totalSurvivalTime;
      },
      {},
    );
  };
  const getCurrentlyTagged = () => {
    return (
      Object.values(users).find((user) => {
        return user.isTagged;
      })?.displayName || null
    );
  };
  return {
    addUser,
    tagUser,
    getUsers,
    getScore,
    getScores,
    getTotalStreak,
    getCurrentStreak,
    getBestStreak,
    getAllCurrentStreaks,
    getAllBestStreaks,
    getAllTotalStreaks,
    getScoreboard,
    getCurrentlyTagged,
    checkIfTagged,
  };
};

module.exports = {
  getDatabase,
};
