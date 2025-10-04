/**
 * 성공 응답 포맷터
 * @param {Object} res - Express response 객체
 * @param {*} data - 응답 데이터
 * @param {string} message - 응답 메시지
 * @param {number} statusCode - HTTP 상태 코드
 */
const successResponse = (res, data = null, message = 'Success', statusCode = 200) => {
  const response = {
    success: true,
    message,
  };

  if (data !== null) {
    response.data = data;
  }

  return res.status(statusCode).json(response);
};

/**
 * 페이지네이션 응답 포맷터
 * @param {Object} res - Express response 객체
 * @param {Array} data - 응답 데이터 배열
 * @param {Object} pagination - 페이지네이션 정보
 * @param {number} pagination.page - 현재 페이지
 * @param {number} pagination.limit - 페이지당 항목 수
 * @param {number} pagination.total - 전체 항목 수
 * @param {string} message - 응답 메시지
 * @param {number} statusCode - HTTP 상태 코드
 */
const paginatedResponse = (
  res,
  data,
  pagination,
  message = 'Success',
  statusCode = 200
) => {
  const { page, limit, total } = pagination;
  const totalPages = Math.ceil(total / limit);

  const response = {
    success: true,
    message,
    data,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total: Number(total),
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };

  return res.status(statusCode).json(response);
};

/**
 * 에러 응답 포맷터
 * @param {Object} res - Express response 객체
 * @param {string} message - 에러 메시지
 * @param {number} statusCode - HTTP 상태 코드
 * @param {Object|Array} errors - 상세 에러 정보 (선택적)
 */
const errorResponse = (res, message = 'Error', statusCode = 500, errors = null) => {
  const response = {
    success: false,
    message,
  };

  if (errors) {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
};

/**
 * 생성 성공 응답
 * @param {Object} res - Express response 객체
 * @param {*} data - 생성된 리소스 데이터
 * @param {string} message - 응답 메시지
 */
const createdResponse = (res, data, message = 'Resource created successfully') => {
  return successResponse(res, data, message, 201);
};

/**
 * 업데이트 성공 응답
 * @param {Object} res - Express response 객체
 * @param {*} data - 업데이트된 리소스 데이터
 * @param {string} message - 응답 메시지
 */
const updatedResponse = (res, data, message = 'Resource updated successfully') => {
  return successResponse(res, data, message, 200);
};

/**
 * 삭제 성공 응답
 * @param {Object} res - Express response 객체
 * @param {string} message - 응답 메시지
 */
const deletedResponse = (res, message = 'Resource deleted successfully') => {
  return successResponse(res, null, message, 200);
};

/**
 * No Content 응답 (204)
 * @param {Object} res - Express response 객체
 */
const noContentResponse = (res) => {
  return res.status(204).send();
};

module.exports = {
  successResponse,
  paginatedResponse,
  errorResponse,
  createdResponse,
  updatedResponse,
  deletedResponse,
  noContentResponse,
};
