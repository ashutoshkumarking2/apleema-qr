import { Router } from 'express'
import { verifyToken } from '../middleware/verifyToken'
import { startGithubAppConnect, githubAppStatus, githubAppRepositories, disconnectGithubApp } from '../controllers/githubApp.controller'
const router = Router()
router.get('/connect', verifyToken, startGithubAppConnect)
router.get('/status', verifyToken, githubAppStatus)
router.get('/repositories', verifyToken, githubAppRepositories)
router.delete('/disconnect', verifyToken, disconnectGithubApp)
export default router
