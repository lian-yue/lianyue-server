import Router from 'viewModels/router'

import read from './read'

const router = new Router;

router.get('token/read', '/', read);

export default router
