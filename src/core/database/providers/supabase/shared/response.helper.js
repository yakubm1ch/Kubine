export class ResponseHelper {

  success(data) {
    return {
      success: true,
      data,
      error: null,
    };
  }

  failure(error) {
    return {
      success: false,
      data: null,
      error,
    };
  }

}

export default new ResponseHelper();