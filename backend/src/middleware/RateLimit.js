const rateLimit = require('express-rate-limit');


const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Tăng lên 1000 để sếp test thoải mái
  message: {
    success: false,
    message: 'Quá nhiều yêu cầu từ địa chỉ IP này. Vui lòng thử lại sau.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});


const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Tăng từ 5 lên 100 để sếp click thoải mái
  message: {
    success: false,
    message: 'Phát hiện quá nhiều nỗ lực xác thực. Vui lòng thử lại sau 15 phút.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 100, // Tăng lên 100
  message: {
      success: false,
      message: 'Quá nhiều yêu cầu đăng ký từ địa chỉ IP này. Vui lòng thử lại sau một giờ.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const verifyResendLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 100, // Tăng lên 100
  message: {
      success: false,
      message: 'Yêu cầu gửi mã xác thực quá thường xuyên. Vui lòng đợi trong giây lát.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});


const postLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // Limit each user to 20 posts per hour
  message: {
    success: false,
    message: 'Bạn đã đạt giới hạn đăng bài trong một giờ. Hãy dành thời gian tương tác với cộng đồng trước khi tiếp tục.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return req.user ? req.user.uuid : req.ip;
  }
});


const commentLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50, // Limit each user to 50 comments per hour
  message: {
    success: false,
    message: 'Giới hạn bình luận đã đạt mức tối đa. Vui lòng quay lại sau.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return req.user ? req.user.uuid : req.ip;
  }
});


const messageLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 100, // Limit each user to 100 messages per hour
  message: {
    success: false,
    message: 'Bạn đang gửi tin nhắn quá nhanh. Hãy bình tĩnh để kết nối sâu sắc hơn.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return req.user ? req.user.uuid : req.ip;
  }
});


const likeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // Limit each user to 30 likes per 15 minutes
  message: {
    success: false,
    message: 'Nhịp độ tương tác quá cao. Vui lòng thử lại sau vài phút.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return req.user ? req.user.uuid : req.ip;
  }
});


const searchLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: process.env.NODE_ENV === 'development' ? 2000 : 500, // 2000 in dev, 500 in prod
  message: {
    success: false,
    message: 'Giới hạn tìm kiếm đã đạt mức tối đa cho phép.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});


const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each user to 10 uploads per hour
  message: {
    success: false,
    message: 'Giới hạn tải tệp tin đã đạt mức tối đa trong giờ này.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return req.user ? req.user.uuid : req.ip;
  }
});

const utilityLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // 30 utility actions per 15 mins
  message: {
    success: false,
    message: 'Thao tác tiện ích quá thường xuyên. Vui lòng thử lại sau.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return req.user ? req.user.uuid : req.ip;
  }
});

const voteLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 votes per 15 mins
  message: {
    success: false,
    message: 'Tần suất biểu quyết quá cao. Vui lòng thử lại sau.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return req.user ? req.user.uuid : req.ip;
  }
});

const supportLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 tickets per hour
  message: {
    success: false,
    message: 'Yêu cầu hỗ trợ quá thường xuyên. Đội ngũ Arteo sẽ phản hồi bạn sớm nhất có thể.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return req.user ? req.user.uuid : req.ip;
  }
});

const interactionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 neural signals per 15 mins
  message: {
    success: false,
    message: 'Tần suất tương tác vượt ngưỡng cho phép của nền tảng.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return req.user ? req.user.uuid : req.ip;
  }
});

module.exports = {
  apiLimiter,
  authLimiter,
  postLimiter,
  commentLimiter,
  messageLimiter,
  likeLimiter,
  searchLimiter,
  uploadLimiter,
  utilityLimiter,
  registerLimiter,
  verifyResendLimiter,
  voteLimiter,
  supportLimiter,
  interactionLimiter
};
