import os from 'os';

import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import bcrypt from 'bcrypt';
import UserModel, { UserSchema } from './src/api/components/userModel';
import crypto from 'crypto';
import { sql } from '@vercel/postgres';
import { Request } from 'express';

export function initializePassportConfig(passport: any, hostname: string) {

    const googleCallbackURL = `http://${hostname}:${process.env.PORT}/auth/google/callback`; 

    const authenticateEMailUser = async (email: string, password: string, done: any) => {
        try {
            // Retrieve user by email
            const user = await UserModel.getUserByEmail(email);
            if (user) {
                if (user.isVerified) {
                    // Compare passwords
                    const passwordMatch = await bcrypt.compare(password, user.password);
                    if (passwordMatch) {
                        // Update user stats
                        user.loginCount++;
                        await UserModel.saveOrUpdate(user); // Save or update user
                        // Authentication successful
                        return done(null, user);
                    } else {
                        // Incorrect password
                        return done(null, false, { message: 'Incorrect password' });
                    }
                } else {
                    // User not verified
                    return done(null, user, { message: 'User not verified' });
                }
            } else {
                // No user exists
                return done(null, false, { message: 'No user exists' });
            }
        } catch (error) {
            // Handle any errors that occur
            return done(error);
        }
    }

    const authenticateGoogleUser = async (accessToken: string, refreshToken: string, profile: any, done: any) => {
        try {
            // Check if user exists
            const user = await UserModel.getUserByGoogleToken(profile.id);
            if (user) {
                // User exists
                return done(null, user);
            } else {
                // Create user
                const newUser = await UserModel.createUser('', profile.displayName, ''); // Replace email and password with actual values
                return done(null, newUser);
            }
        } catch (error) {
            console.error('Error authenticating Google user:', error);
            return done(error);
        }
    }
    
    const authenticateFBUser = async (accessToken: string, refreshToken: string, profile: any, done: any) => {
        try {
            // Check if user exists
            const user = await UserModel.getUserByFacebookToken(profile.id);
            if (user) {
                // User exists
                return done(null, user);
            } else {
                // Create user
                const newUser = await UserModel.createUser('', profile.displayName, ''); // Replace email and password with actual values
                return done(null, newUser);
            }
        } catch (error) {
            console.error('Error authenticating Facebook user:', error);
            return done(error);
        }
    }
    

    passport.use(
        new LocalStrategy({ usernameField: 'email', passwordField: 'password' }, authenticateEMailUser)
    );

    passport.use(
        new GoogleStrategy(
            {
                callbackURL: googleCallbackURL,
                clientID: process.env.GOOGLE_ID as string,
                clientSecret: process.env.GOOGLE_SECRET as string
            },
            authenticateGoogleUser
        )
    );

    // passport.use(
    //     new FacebookStrategy(
    //         {
    //             callbackURL: '/auth/facebook/callback',
    //             clientID: process.env['FACEBOOK_ID'],
    //             clientSecret: process.env['FACEBOOK_SECRET']
    //         },
    //         authenticateFBUser
    //     )
    // );

    // Cookie
    passport.serializeUser((user: any, done: any) => {
        done(null, user.id);
    });

    passport.deserializeUser((id: any, done: any) => {
        UserModel.getUserById(id).then((user: any) => {
            done(null, user);
        });
    });
    
}
