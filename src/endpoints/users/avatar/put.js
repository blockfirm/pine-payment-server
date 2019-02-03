import Jimp from 'jimp';
import errors from 'restify-errors';
import sha256 from '../../../crypto/sha256';

const IMAGE_SIZE = 250; // 250x250 px
const IMAGE_QUALITY = 80;
const IMAGE_MAX_FILESIZE = 50000; // 50 KB

const processImage = (imageBuffer) => {
  return Promise.resolve().then(() => {
    if (imageBuffer.length > IMAGE_MAX_FILESIZE) {
      throw new errors.BadRequestError('Image cannot be larger than 50 KB');
    }

    return Jimp.read(imageBuffer).then((image) => {
      image.quality(IMAGE_QUALITY);
      image.cover(IMAGE_SIZE, IMAGE_SIZE);
      return image.getBufferAsync(Jimp.MIME_JPEG);
    });
  });
};

const put = function put(request, response) {
  const params = request.params;

  return Promise.resolve().then(() => {
    const userId = params.id;
    const imageBase64 = params.image;

    if (!userId || typeof userId !== 'string') {
      throw new errors.BadRequestError('The id parameter must be a string');
    }

    if (!request.userId) {
      throw new errors.UnauthorizedError('Cannot change avatar without authentication');
    }

    if (request.userId !== userId) {
      throw new errors.UnauthorizedError('The authenticated user is not authorized to change this avatar');
    }

    if (!imageBase64) {
      throw new errors.BadRequestError('Missing image');
    }

    const query = {
      where: { id: userId }
    };

    return this.database.user.findOne(query).then((user) => {
      if (!user) {
        throw new errors.NotFoundError('User not found');
      }

      const imageBuffer = Buffer.from(imageBase64, 'base64');

      return processImage(imageBuffer).then((processedImage) => {
        const checksum = sha256(processedImage).toString('base64');

        const newAvatar = {
          image: processedImage,
          checksum,
          userId
        };

        return this.database.avatar.findOrCreate({ where: { userId }, defaults: newAvatar }).spread((avatar, created) => {
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
