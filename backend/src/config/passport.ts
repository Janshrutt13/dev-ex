export{};

require('dotenv').config();
const passport = require('passport');
const GithubStrategy = require('passport-github').Strategy;
const User = require('../models/user.model');

console.log('CLIENT_ID:', process.env.CLIENT_ID);
console.log('CLIENT_SECRET:', process.env.CLIENT_SECRET);

passport.use(new GithubStrategy({
    clientID : process.env.CLIENT_ID,
    clientSecret : process.env.CLIENT_SECRET,
    callbackURL : "/api/auth/github/callback"
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
        email : profile.emails && profile.emails[0] ? profile.emails[0].value : null,
        profileImageUrl : profile.photos[0].value
      });

      return done(null,newUser);

    }catch(err){
       return done(err,false);
    }
}
));

module.exports = passport;