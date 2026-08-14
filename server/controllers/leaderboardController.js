const Progress = require('../models/Progress');
const User = require('../models/User');

const getLeaderboard = async (req, res) => {
  try {
    const ranked = await Progress.aggregate([
      {
        $addFields: {
          quizAverage: {
            $cond: [
              { $gt: [{ $size: { $ifNull: ['$quizScores', []] } }, 0] },
              { $avg: '$quizScores.score' },
              null,
            ],
          },
          completed: {
            $cond: [{ $gte: ['$overallPercent', 100] }, 1, 0],
          },
        },
      },
      {
        $group: {
          _id: '$user',
          completedCourses: { $sum: '$completed' },
          averageQuizScore: { $avg: '$quizAverage' },
          coursesStarted: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
      {
        $project: {
          _id: 0,
          userId: '$user._id',
          name: '$user.name',
          avatar: '$user.avatar',
          role: '$user.role',
          completedCourses: 1,
          coursesStarted: 1,
          averageQuizScore: {
            $round: [{ $ifNull: ['$averageQuizScore', 0] }, 1],
          },
        },
      },
      {
        $sort: {
          completedCourses: -1,
          averageQuizScore: -1,
          coursesStarted: -1,
        },
      },
      { $limit: 50 },
    ]);

    const leaderboard = ranked.map((entry, index) => ({
      rank: index + 1,
      ...entry,
    }));

    const currentUser = req.user
      ? leaderboard.find(
          (entry) => entry.userId.toString() === req.user._id.toString(),
        ) || null
      : null;

    if (!currentUser && req.user) {
      const user = await User.findById(req.user._id).select('name avatar role');
      if (user) {
        const stats = await Progress.aggregate([
          { $match: { user: user._id } },
          {
            $addFields: {
              quizAverage: {
                $cond: [
                  { $gt: [{ $size: { $ifNull: ['$quizScores', []] } }, 0] },
                  { $avg: '$quizScores.score' },
                  null,
                ],
              },
              completed: {
                $cond: [{ $gte: ['$overallPercent', 100] }, 1, 0],
              },
            },
          },
          {
            $group: {
              _id: '$user',
              completedCourses: { $sum: '$completed' },
              averageQuizScore: { $avg: '$quizAverage' },
              coursesStarted: { $sum: 1 },
            },
          },
        ]);

        const own = stats[0];
        leaderboard.push({
          rank: null,
          userId: user._id,
          name: user.name,
          avatar: user.avatar,
          role: user.role,
          completedCourses: own?.completedCourses || 0,
          coursesStarted: own?.coursesStarted || 0,
          averageQuizScore: Number((own?.averageQuizScore || 0).toFixed(1)),
          isCurrentUser: true,
        });
      }
    }

    return res.json({
      leaderboard: leaderboard.map((entry) => ({
        ...entry,
        isCurrentUser: req.user
          ? entry.userId.toString() === req.user._id.toString()
          : false,
      })),
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { getLeaderboard };
