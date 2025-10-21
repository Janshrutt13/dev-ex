export{};

const cron = require('node-cron');
const nodemailer = require('nodemailer');
import User from '../models/user.model';

const isSameDay = (date1 : any, date2 : any) =>
  date1.getFullYear() === date2.getFullYear() &&
  date1.getMonth() === date2.getMonth() &&
  date1.getDate() === date2.getDate();

const transponder = nodemailer.createTransport({
    host : 'smtp-relay.brevo.com',
    port : 587,
    secure : false,
    auth : {
        user : 'devex171@gmail.com',
        pass : process.env.BREVO_API_KEY
    },

});

//define email sending function
const sendReminderEmail = async(user : any) => {
   const mailoptions = {
     from : "devex171@gmail.com",
     to : user.email,
     subject : '🔥 Don\'t lose your Dev-Ex streak!',
     html : `
      <p>Hi ${user.name}</p>
      <p>Just a friendly reminder to log your coding progress for today</p>
      <p>Keep that streak alive</p>
      <p> The Dev-Ex team </p> 
     `,
   };

   try{
     
     await transponder.sendMail(mailoptions);
     console.log('Reminder email sent successfully');
   }catch(err){
     console.error(`Error sending email to ${user.email}`);
   }
};

const checkAndSendReminders = async () => {
    console.log('Running daily reminder check...');
    const today = new Date();

    try{

       const users = await User.find({ email : {$ne : null } }); 

       for(const user of users){
         if(!user.streak || user.streak.length === 0) continue;

       const lastLogDate = user.streak[user.streak.length - 1];

       //IF they haven't logged in, send a reminder
       if(!isSameDay(lastLogDate, today)){
         await sendReminderEmail(user);
       }
     }
    }catch(err){
        console.error('Error during reminders');
    }
}

//Schedule the task
const startReminderService = () => {
    cron.schedule('0 22 * * *' , checkAndSendReminders, {
        timezone : 'Asia/Kolkata'
    });
    console.log('Daily Reminder Service Scheduled For 10 PM');
};

export {startReminderService};