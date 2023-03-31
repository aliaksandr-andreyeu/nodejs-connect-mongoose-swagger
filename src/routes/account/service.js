import joi from 'joi';
import { userError, getResponse, validateAccessToken } from '@helpers';
import { apiErrors } from '@constants';
import { userModel } from '@models';

const contactUs = async (req) => {
  const body = req.body;

  const contactUsSchema = joi.object({
    subject: joi.string().required(),
    message: joi.string().required()
  });

  try {
    const validatedBody = await contactUsSchema.validateAsync(body);

    return getResponse();
  } catch (err) {
    throw userError(err.message, 400);
  }
};

const getAccount = async (req) => {
  return getResponse();
};

const editAccount = async (req) => {
  try {
    const body = req.body;
    const headers = req.headers;

    const editAccountSchema = joi.object({
      username: joi.string().required(),
      name: joi.string(),
      surname: joi.string(),
      age: joi.number(),
      job: joi.string()
    });

    const validatedBody = await editAccountSchema.validateAsync(body);

    const accessToken = headers['authorization'].replace('Bearer ', '');

    const jwtAccessData = validateAccessToken(accessToken);

    const user = await userModel.findByIdAndUpdate(jwtAccessData.id, validatedBody, { new: true }).exec();

    if (!user) {
      throw userError(apiErrors.user.notFound, 404);
    }

    return getResponse(user.getPublicFields());
  } catch (err) {
    throw userError(err.message, 400);
  }
};

const changePassword = async (req) => {
  const body = req.body;

  return getResponse(body);
};

const accountService = {
  contactUs,
  getAccount,
  editAccount,
  changePassword
};
export default accountService;
