import express, { Router, Request, Response } from 'express';

import passport from 'passport';
import bcrypt from 'bcrypt';
import UserModel from './api/components/user-model';
import { emailService } from './api/components/tool-email';
import * as AuthCheck from './api/components/auth-check';


const router: Router = Router();


router.get('/auth/google', AuthCheck.verify, passport.authenticate('google', {
    scope: ['profile']
}));

router.get('/auth/facebook', AuthCheck.verify, passport.authenticate('facebook'));

router.get('/google/redirect', AuthCheck.verify, passport.authenticate('google'), async (req: Request, resp: Response) => {
    try {
        if (req.isAuthenticated()) {
            const user = req.user as UserModel;
            user.loginCount++;
            user.lastSession = new Date();
            // await UserModel.saveOrUpdate(req.user as UserModel);
            resp.redirect('/dashboard');
        } else {
            // req.flash('error', 'Authenticated! Please log in');
            resp.redirect('/');
        }
    } catch (error) {
        console.error('Error redirecting to Google:', error);
        resp.redirect('/');
    }
});

export default router;
