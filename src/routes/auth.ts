import { Router, Request, Response } from 'express';
var express = require('express');

var passport = require('passport');

// import bcrypt from 'bcrypt';
import UserModel from '../api/components/userModel';
import { emailService } from '../api/components/email';
import * as AuthCheck from '../api/components/authCheck';
var GoogleStrategy = require('passport-google-oidc');



const authRoute: Router = Router();

authRoute.get('/auth/google', AuthCheck.verify, passport.authenticate('google'));


// authRoute.get('/auth/google', AuthCheck.verify, passport.authenticate('google'), async (req: Request, res: Response) => {
//     res.render('login');
// });

authRoute.get('/auth/facebook', AuthCheck.verify, passport.authenticate('facebook'));

authRoute.get('/google/redirect', AuthCheck.verify, passport.authenticate('google'), async (req: Request, resp: Response) => {
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

export default authRoute;
