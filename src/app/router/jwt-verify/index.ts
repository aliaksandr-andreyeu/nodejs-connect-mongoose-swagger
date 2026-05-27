import { apiErrors } from '@constants';
import {
  userError,
  validateRefreshToken,
  validateAccessToken,
  isValidObjectId,
  getAccessToken,
  getRefreshToken
} from '@helpers';
import { userModel } from '@models';
import type { AppNextFunction, AppRequest, AppResponse, RequestHandler } from '@types';

const jwtVerify = async (handler: RequestHandler, req: AppRequest, res: AppResponse, next: AppNextFunction) => {
  try {
    const refreshToken = getRefreshToken(req);
    const accessToken = getAccessToken(req);

    const jwtRefreshData = validateRefreshToken(refreshToken);
    const jwtAccessData = validateAccessToken(accessToken);

    if (
      !(
        jwtRefreshData &&
        jwtRefreshData.id &&
        isValidObjectId(jwtRefreshData.id) &&
        jwtRefreshData.email &&
        jwtRefreshData.jti &&
        jwtAccessData &&
        jwtAccessData.id &&
        isValidObjectId(jwtAccessData.id) &&
        jwtAccessData.email &&
        jwtRefreshData.id === jwtAccessData.id &&
        jwtRefreshData.email === jwtAccessData.email &&
        jwtRefreshData.jti === jwtAccessData.refreshId
      )
    ) {
      throw userError(apiErrors.common.unauthorized, 401);
    }

    const user = await userModel.findById(jwtAccessData.id).exec();

    if (!(user && user.username && user.username === jwtAccessData.email)) {
      throw userError(apiErrors.common.unauthorized, 401);
    }
    // Server-side refresh token revoke: require current refresh jti match.
    if (!jwtRefreshData.jti || user.refreshToken !== jwtRefreshData.jti) {
      throw userError(apiErrors.common.unauthorized, 401);
    }

    req.auth = {
      userId: jwtAccessData.id,
      email: jwtAccessData.email,
      refreshJti: jwtRefreshData.jti
    };

    await handler(req, res, next);
  } catch (error) {
    next(error);
  }
};

export default jwtVerify;
