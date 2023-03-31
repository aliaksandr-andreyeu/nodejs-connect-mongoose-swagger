import joi from 'joi';
import { userError, getResponse } from '@helpers';

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

const accountService = {
  contactUs
};
export default accountService;
