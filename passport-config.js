const LocalStrategy = require('passport-local').Strategy
const GoogleStrategy = require('passport-google-oauth20').Strategy
const FacebookStrategy = require('passport-facebook').Strategy

const bcrypt = require('bcrypt')
const User = require('./src/components/user-model')

const hostname = require('os').hostname()
var url = 'https://2517-2001-b011-2000-13b9-1046-5720-eb27-40e5.ngrok-free.app'
if( hostname === 'srv.gambits.vip'){
    url = 'https://gambits.vip'
}

function initialize(passport) {
    const authenticateUser = async (email, password, done) => {
        try {
            // Retrieve user by email
            const user = await getUserByEmail(email);
            if (user) {
                if (user.isVerified) {
                    // Compare passwords
                    const passwordMatch = await bcrypt.compare(password, user.password);
                    if (passwordMatch) {
                        // Update user stats
                        user.loginCount++;
                        await user.save();
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
    const authenticateGoogleUser = async (accessToken, refreshToken, profile, done) => {
        // check if user exists
        User.findOne({googleId: profile.id}).then((currentUser) => {
            if (currentUser){
                // user exists
                done(null, currentUser)
            } else {
                // create user
                new User({
                    created: Date.now(),
                    lastSession: '',
                    loginCount: 0,
                    isVerified: true,
                    email: '',
                    username: profile.displayName,
                    emailToken: '',
                    forgotToken: '',
                    facebookId: '',
                    googleId: profile.id,
                    image: profile.photos[0]['value'],
                    password: '',
                    locale: profile.locale

                }).save().then((newUser) => {
                    done(null, newUser)
                })
            }
        })
    }
    const authenticateFBUser = async (accessToken, refreshToken, profile, done) => {
        // check if user exists
        User.findOne({facebookId: profile.id}).then((currentUser) => {
            if (currentUser){
                // user exists
                done(null, currentUser)
            } else {
                // create user
                new User({
                    created: Date.now(),
                    lastSession: '',
                    loginCount: 0,
                    isVerified: true,
                    email: '',
                    username: profile.displayName,
                    emailToken: '',
                    forgotToken: '',
                    googleId: '',
                    facebookId: profile.id,
                    image: '',
                    password: '',
                    locale: ''

                }).save().then((newUser) => {
                    done(null, newUser)
                })
            }
        })
    }

    passport.use(
        new LocalStrategy({ 
            usernameField: 'email', 
            passwordField: 'password'}, 
            authenticateUser))
    passport.use(
        new GoogleStrategy({ 
            callbackURL: '/auth/google/redirect',
            clientID: process.env.GOOGLE_ID,
            clientSecret: process.env.GOOGLE_SECRET},
            authenticateGoogleUser))
    passport.use(
        new FacebookStrategy({
            callbackURL: url + "/auth/facebook/redirect",
            clientID: process.env.FACEBOOK_ID,
            clientSecret: process.env.FACEBOOK_SECRET},
            authenticateFBUser))

    // cookie
    passport.serializeUser((user, done) => { done(null, user.id) })
    passport.deserializeUser((id, done) => { 
        User.findById(id).then((user) => {
            done(null, user)    
        })
    })
}

module.exports = initialize