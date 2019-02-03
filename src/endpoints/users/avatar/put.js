import jimp from 'jimp';
import errors from 'restify-errors';
import sha256 from '../../../crypto/sha256';

const IMAGE_MIN_RESOLUTION = 240;
const IMAGE_MAX_FILESIZE = 50000; // 50 KB

const validateImage = (imageBuffer) => {
  if (imageBuffer.length > IMAGE_MAX_FILESIZE) {
    throw new errors.BadRequestError('Image cannot be larger than 50 KB');
  }

  return jimp.read(imageBuffer).then((image) => {
    if (Math.abs(image.bitmap.width - image.bitmap.height) > 1) {
      throw new errors.BadRequestError('Image must have a 1:1 aspect ratio');
    }

    if (image.bitmap.width < IMAGE_MIN_RESOLUTION) {
      throw new errors.BadRequestError('Image must be at least 240x240px');
    }
  });
};

const put = function put(request, response) {
  const params = request.params;

  return Promise.resolve().then(() => {
    const userId = params.id;
    const image = params.image;

    if (!userId || typeof userId !== 'string') {
      throw new errors.BadRequestError('The id parameter must be a string');
    }

    if (!request.userId) {
      throw new errors.UnauthorizedError('Cannot change avatar without authentication');
    }

    if (request.userId !== userId) {
      throw new errors.UnauthorizedError('The authenticated user is not authorized to change this avatar');
    }

    if (!image) {
      throw new errors.BadRequestError('Missing image');
    }

    const imageBuffer = Buffer.from(image, 'base64');
    const checksum = sha256(imageBuffer).toString('base64');

    const newAvatar = {
      image: imageBuffer,
      userId,
      checksum
    };

    const query = {
      where: { id: userId }
    };

    return validateImage(imageBuffer).then(() => {
      this.database.user.findOne(query).then((user) => {
        if (!user) {
          throw new errors.NotFoundError('User not found');
        }

        this.database.avatar.findOrCreate({ where: { userId }, defaults: newAvatar }).spread((avatar, created) => {
          if (!created) {
            avatar.checksum = newAvatar.checksum;
            avatar.image = newAvatar.image;

            return avatar.save({ fields: ['checksum', 'image'] }).then(() => {
              response.send({ checksum });
            });
          }

          response.send({ checksum });
        });
      });
    });
  });
};

export default put;
