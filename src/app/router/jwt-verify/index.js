import { apiErrors } from '@constants';
import { userError, validateRefreshToken, validateAccessToken, isValidObjectId } from '@helpers';
import { userModel } from '@models';

const jwtVerify = async (handler, req, res, next) => {
  try {
    console.log('----------------------------------------- jwtVerify');

    const cookies = req.cookies;
    const headers = req.headers;

    if (!(cookies && cookies['X-Refresh-Token'] && headers && headers['authorization'])) {
      throw userError(apiErrors.common.unauthorized, 401);
    }

    const refreshToken = cookies['X-Refresh-Token'];
    const accessToken = headers['authorization'].replace('Bearer ', '');

    console.log(' ************************** refreshToken: ', refreshToken);
    console.log(' ************************** accessToken: ', accessToken);

    const jwtRefreshData = validateRefreshToken(refreshToken);
    const jwtAccessData = validateAccessToken(accessToken);

    console.log(' ************************** jwtRefreshData: ', jwtRefreshData);
    console.log(' ************************** jwtAccessData: ', jwtAccessData);

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

    handler(req, res, next);
  } catch (error) {
    next(error);
  }
};

export default jwtVerify;
