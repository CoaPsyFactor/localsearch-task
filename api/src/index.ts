import Server from './Server';
import SearchHandler from './handlers/SearchHandler';

const server = new Server([new SearchHandler()]);
server.start(3000);