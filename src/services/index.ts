import auth from './admin/routes'
import user from './user/routes'

export default [
    ...auth,
    ...user
]
