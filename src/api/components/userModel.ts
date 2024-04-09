import { sql } from '@vercel/postgres';
import crypto from 'crypto';
import { Request } from "express"


export interface UserSchema extends Request{
  id: string;
  name: string;
  email: string;
  password: string;
  created: Date;
  lastSession: Date;
  loginCount: number;
  isVerified: boolean;
  emailToken: string;
  forgotToken: string;
  image: string;
  googleToken: string;
  facebookToken: string;
}

class UserModel {
  constructor(
    public id: string,
    public name: string,
    public email: string,
    public password: string,
    public created: Date,
    public lastSession: Date,
    public loginCount: number,
    public isVerified: boolean,
    public emailToken: string,
    public forgotToken: string,
    public image: string,
    public googleToken: string,
    public facebookToken: string
  ) {}

  static async saveOrUpdate(user: UserSchema): Promise<UserSchema | null> {
    try {
      const result = await sql`
        INSERT INTO users (id, name, email, password, created, lastsession, logincount, isverified, emailtoken, forgottoken, image, googletoken, facebooktoken)
        VALUES (${user.id}, ${user.name}, ${user.email}, ${user.password}, ${user.created.toISOString()}, ${user.lastSession.toISOString()}, ${user.loginCount}, ${user.isVerified}, ${user.emailToken}, ${user.forgotToken}, ${user.image}, ${user.googleToken}, ${user.facebookToken})
        ON CONFLICT (id) DO UPDATE SET
        name = ${user.name},
        email = ${user.email},
        password = ${user.password},
        created = ${user.created.toISOString()},
        lastsession = ${user.lastSession.toISOString()},
        logincount = ${user.loginCount},
        isverified = ${user.isVerified},
        emailtoken = ${user.emailToken},
        forgottoken = ${user.forgotToken},
        image = ${user.image},
        googletoken = ${user.googleToken},
        facebooktoken = ${user.facebookToken}
        RETURNING *;
      `;
      return result.rows[0] as UserSchema;
    } catch (error) {
      console.error('Error saving or updating user:', error);
      throw error;
    }
  }

  static async getUserById(id: string): Promise<UserSchema | null> {
    try {
        const result = await sql`
            SELECT * FROM users WHERE id = ${id};
        `;
        return result.rows.length > 0 ? result.rows[0] as UserSchema : null;
    } catch (error) {
        console.error('Error fetching user by ID:', error);
        return null;
    }
}


  static async getUserByEmail(email: string): Promise<UserSchema | null> {
    try {
      const result = await sql`
          SELECT * FROM users
          WHERE email = ${email};`;
          return result.rows.length > 0 ? result.rows[0] as UserSchema : null;
        } catch (error) {
      console.error('Error fetching user by email:', error);
      return null;
    }
  }

  static async getUserByUsername(username: string): Promise<UserSchema | null> {
    try {
      const result = await sql`
          SELECT * FROM users WHERE username = ${username};`;
        return result.rows.length > 0 ? result.rows[0] as UserSchema : null;
    } catch (error) {
      console.error('Error fetching user by username:', error);
      return null;
    }
  }

  static async createUser(email: string, username: string, hashedPassword: string): Promise<UserSchema | null> {
    try {
      const emailToken = crypto.randomBytes(64).toString('hex');
      const result = await sql`
          INSERT INTO users (created, email, name, emailtoken, password)
          VALUES (NOW(), ${email}, ${username}, ${emailToken}, ${hashedPassword})
          RETURNING *;`;
      return result.rows[0] as UserSchema;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  static async getUserByEmailToken(emailToken: string): Promise<UserSchema | null> {
    try {
      const result = await sql`
          SELECT * FROM users WHERE emailtoken = ${emailToken};`;
      return result.rows.length > 0 ? result.rows[0] as UserSchema : null;
    } catch (error) {
      console.error('Error fetching user by email token:', error);
      return null;
    }
  }

  static async getUserByForgotToken(forgotToken: string): Promise<UserSchema | null> {
    try {
      const result = await sql`
          SELECT * FROM users WHERE forgottoken = ${forgotToken};`;
      return result.rows.length > 0 ? result.rows[0] as UserSchema : null;
    } catch (error) {
      console.error('Error fetching user by forgot token:', error);
      return null;
    }
  }

  static async getUserByFacebookToken(facebookToken: string): Promise<UserSchema | null> {
    try {
      const result = await sql`
          SELECT * FROM users WHERE facebooktoken = ${facebookToken};
      `;
      return result.rows.length > 0 ? result.rows[0] as UserSchema : null;
    } catch (error) {
      console.error('Error fetching user by Facebook token:', error);
      return null;
    }
  }

  static async getUserByGoogleToken(googleToken: string): Promise<UserSchema | null> {
    try {
      const result = await sql`
          SELECT * FROM users WHERE googletoken = ${googleToken};
      `;
      return result.rows.length > 0 ? result.rows[0] as UserSchema : null;
    } catch (error) {
      console.error('Error fetching user by Google token:', error);
      return null;
    }
  }
}

export default UserModel
