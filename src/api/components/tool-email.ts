import { Request as ExpressRequest, Response } from 'express';
import crypto from 'crypto';
import sgMail from '@sendgrid/mail';
import UserModel from './user-model';

// Check if SENDGRID_KEY is defined
if (!process.env.SENDGRID_KEY) {
    throw new Error("SENDGRID_KEY environment variable is not defined. Please make sure to set it.");
}

sgMail.setApiKey(process.env.SENDGRID_KEY);

interface FlashMessage {
    error: string;
    alertTitle: string;
    alertMsg: string;
}

interface RequestWithFlash extends ExpressRequest {
    flash(type: string): string | string[] | FlashMessage | undefined;
}

const sendEmail = (req: RequestWithFlash, resp: Response, msg: sgMail.MailDataRequired, toEmail: string): void => {
    sgMail.send(msg).then((response) => {
        console.log('currentUser:', response);
        req.flash(`Check your email, ${toEmail}. Please verify your account through the link sent to you.`);
        resp.redirect('/');
    }).catch((error) => {
        console.log('error:', error);
        req.flash('Email error');
        req.flash('Something went wrong when sending email. Please try again.');
        resp.redirect('/');
    });
};

export const emailService = {
    sendVerify: (req: RequestWithFlash, resp: Response, currentUser: { email: string; emailToken: string }): void => {
        const msg: sgMail.MailDataRequired = {
            from: 'walt.yao@gmail.com',
            to: currentUser.email,
            subject: 'Please confirm your account',
            text: `Thanks for stopping by, follow this link to confirm: 
            http://${req.headers.host}/auth/email?token=${currentUser.emailToken}
            `,
            html: `<a href="http://${req.headers.host}/auth/email?token=${currentUser.emailToken}">Click here to activate your account!</a><br>
                <a href="http://${req.headers.host}/auth/email?token=${currentUser.emailToken}">http://${req.headers.host}/auth/email?token=${currentUser.emailToken}</a>`
        };
        sendEmail(req, resp, msg, currentUser.email);
    },

    sendForgot: async (req: RequestWithFlash, resp: Response, currentUser: { email: string; forgotToken: string }): Promise<void> => {
        currentUser.forgotToken = crypto.randomBytes(64).toString('hex');
        // await UserModel.saveOrUpdate(currentUser);

        
        const msg: sgMail.MailDataRequired = {
            from: 'walt.yao@gmail.com',
            to: currentUser.email,
            subject: 'Reset your password',
            text: `Follow this link to reset: 
            http://${req.headers.host}/auth/reset_pass?token=${currentUser.forgotToken}
            `,
            html: `<a href="http://${req.headers.host}/auth/reset_pass?token=${currentUser.forgotToken}">Click here to reset your password!</a><br>
                <a href="http://${req.headers.host}/auth/reset_pass?token=${currentUser.forgotToken}">http://${req.headers.host}/auth/reset_pass?token=${currentUser.forgotToken}</a>`
        };
        sendEmail(req, resp, msg, currentUser.email);
    }
};
