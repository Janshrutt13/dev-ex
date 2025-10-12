//A helper to check same date
const isSameDay = (date1 : any,date2 : any) => {
   return date1.getFullYear() === date2.getFullYear() &&
   date1.getMonth() === date2.getMonth() &&
   date1.getDate() === date2.getDate()
} 

//Get yesterday's date
const yesterdayDate = () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday;
};

/**
 * Calculates the user's current streak.
 * A streak is consecutive days of logging, including today or yesterday.
 * @param {Date[]} streakDates - An array of Date objects, assumed to be sorted chronologically.
 * @returns {number} The length of the current streak.
 */

function CalculateStreak(streakDates : any){
    let streak = 0;
    if(streakDates.length === 0){
        return 0;
    }

    const today = new Date();
    const yesterday = yesterdayDate();

    const lastLogDate = streakDates[streakDates.length - 1];

    //Set starting points
    let expectedDate = isSameDay(lastLogDate,today) ? today : yesterday;

    for(const date of streakDates){
        if(isSameDay(date,expectedDate)){
            streak++
            //set expected date to a day before
            expectedDate.setDate(expectedDate.getDate() - 1);
        }
        else{
            break;
        }
    } 
}

const isNextDay = (date1 : any, date2 : any) => {
  const nextDay = new Date(date1);
  nextDay.setDate(nextDay.getDate() + 1);
  return isSameDay(nextDay, date2);
};

function calculateLongestStreak(streakDates : any) {
  if (streakDates.length < 2) {
    return streakDates.length;
  }

  let longestStreak = 1;
  let currentStreak = 1;

  for (let i = 1; i < streakDates.length; i++) {
    const currentDate = streakDates[i];
    const previousDate = streakDates[i - 1];

    // If the current date is the day after the previous one, the streak continues.
    if (isNextDay(previousDate, currentDate)) {
      currentStreak++;
    } 
    // If it's not a consecutive day, but also not the same day (a double log), the streak is broken.
    else if (!isSameDay(previousDate, currentDate)) {
      currentStreak = 1; // Reset the streak
    }
 
    // Update the longest streak if the current one is bigger.
    if (currentStreak > longestStreak) {
      longestStreak = currentStreak;
    }
  }

  return longestStreak;
}

module.exports = {
    CalculateStreak,
    calculateLongestStreak
};