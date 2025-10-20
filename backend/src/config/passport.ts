export{};

require('dotenv').config();
const passport = require('passport');
const GithubStrategy = require('passport-github').Strategy;
import User from '../models/user.model';



passport.use(new GithubStrategy({
    clientID : process.env.CLIENT_ID,
    clientSecret : process.env.CLIENT_SECRET,
    callbackURL : "http://localhost:5000/api/auth/github/callback"
},
async(accesstoken: string, _refreshtoken: string, profile: any, done: any) => {
    try{
       
      let user = await User.findOne({ githubId : profile.id});

      if(user){
        return done(null,user) //User found, Log in!
      }

      const newUser = new User({
        githubId : profile.id,
        githubUsername : profile.username,
        username : profile.displayName || profile.username,
        email : profile.emails && profile.emails[0] ? profile.emails[0].value : `${profile.username}@github.local`,
        password: 'github-oauth' // Required field
      });

      await newUser.save();
      return done(null,newUser);

    }catch(err){
       return done(err,false);
    }
}
));

module.exports = passport;