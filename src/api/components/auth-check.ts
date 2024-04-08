import { Request, Response, NextFunction } from 'express';
import UserModel from './user-model';

export const verifyEmail = async function (req: Request, res: Response, next: NextFunction) {
    try {
        // Retrieve user by email
        const user = await UserModel.getUserByEmail(req.body.email);
        if (user && user.isVerified) {
            // logged in and verified. just go to dashboard
            return res.redirect('/dashboard');
        }
        next();
    } catch (error) {
        console.error('Error verifying email:', error);
        res.status(500).json({ error: 'An error occurred while verifying email' });
    }
};

export const verify = function (req: Request, res: Response, next: NextFunction) {
    // if offline, redirect to login
    if (!req.isAuthenticated()) {
        next();
        return;
    } else {
        // logged in and verified. just go to dashboard
        return res.redirect('/dashboard');
    }
};

export const login = async function (req: Request, res: Response, next: NextFunction) {
    // if offline, redirect to login
    if (!req.isAuthenticated()) {
        try {
            // Get the user by email from the database
            const user = await UserModel.getUserByEmail(req.body.email);

            if (user) {
                // If a user with the provided email exists
                if (!user.isVerified) {
                    // req.flash(req.body.email);
                    // req.flash('Cannot sign in until you verify your email!');
                    res.redirect('/');
                    return;
                } else {
                    // User is verified, proceed to the next middleware
                    next();
                    return;
                }
            } else {
                // User with the provided email does not exist
                // req.flash('error', 'User does not exist');
                res.redirect('/');
                return;
            }
        } catch (error) {
            console.error('Error checking user:', error);
            res.status(500).json({ error: 'An error occurred while checking user' });
            return;
        }
    } else {
        // logged in and verified. just go to dashboard
        return res.redirect('/dashboard');
    }
};

// export const dash = function (req: Request, res: Response, next: NextFunction) {
//     if (req.isAuthenticated()) {
//         if (UserModel.isVerified || req.user.googleId) {
//             // logged in and verified, proceed
//             next();
//             return;
//         } else {
//             // not verified, return to home, request resending of verify email
//             req.flash('resendEmail', req.user.email);
//             req.flash('error', 'You need to verify your account before trying the dashboard!');
//             res.redirect('/');
//             return;
//         }
//     } else {
//         // not logged in
//         res.redirect('/');
//         return;
//     }
// };

// export const home = function (req: Request, res: Response, next: NextFunction) {
//     if (req.isAuthenticated()) {
//         if (req.user.isVerified) {
//             // logged in and verified, proceed
//             res.redirect('/dashboard');
//             return;
//         } else {
//             // not logged in
//             next();
//             return;
//         }
//     } else {
//         // not logged in
//         next();
//         return;
//     }
// };
