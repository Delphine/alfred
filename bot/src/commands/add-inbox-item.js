import { get, post } from '../utils';

const CONFIRMATION_MESSAGES = [
  'naturally',
  'of course',
  'splendid',
  'jolly good',
  'noted',
  'point taken',
  'at your service',
  'sounds good'
];

const ERROR_MESSAGES = [
  'uh-oh, that didn\'t work out',
  'something went wrong'
];

function randElem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export const AddInboxItem = {
  name: 'add-inbox-item',

  matches: (str) => {
    return true;
  },

  execute: (api_url, author, channel, text) => {
    const update = {
      author,
      channel,
      status: 'inbox',
      resolved: false,
      text
    };
    return post(`${api_url}/updates`, update, 'json').then((resp) => {
      return post(`${api_url}/log`, {
        command: AddInboxItem.name,
        author: author,
        channel: channel,
        id: resp,
        object: update
      });
    }).then(
      () => randElem(CONFIRMATION_MESSAGES),
      () => randElem(ERROR_MESSAGES)
    );
  },

  test: (api_url, author, channel, text) => {
    return `The command will insert a new inbox item for author "${author}" with message "${text}"`;
  },

  revert: (api_url, id) => {
    return post(`${api_url}/updates/remove/${id}`);
  }
};
