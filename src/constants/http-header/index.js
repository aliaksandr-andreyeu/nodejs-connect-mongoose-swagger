import etag from 'etag';

export const encoding = 'utf-8';

export const jsonHeader = {
  'Content-Type': `application/json; charset=${encoding}`
};

export const eTagHeader = (body) => ({
  ETag: etag(body).split('"').join('')
});
