const moment = require("moment");
const enumerators = require("../enumerators/application");

const { differences } = enumerators.dates;

const getCurrentDate = () => moment().format();

const getDaysInCurrentMonth = () => moment().daysInMonth();

const createMomentDate = (date) => moment(date);

const convertTimeStampToHours = (timeStamp) => {
    const date = moment(timeStamp).format();
    return date;
};

const getDateDifference = (differenceType, dateA, dateB) => {
    switch (differenceType) {
        case differences.milliseconds:
            return dateA.diff(dateB);
        case differences.minutes:
            return dateA.diff(dateB, differences.minutes);
        case differences.hours:
            return dateA.diff(dateB, differences.hours);
        case differences.days:
            return dateA.diff(dateB, differences.days);
        case differences.weeks:
            return dateA.diff(dateB, differences.weeks);
        case differences.months:
            return dateA.diff(dateB, differences.months);
        case differences.years:
            return dateA.diff(dateA, differences.years, true);
        default:
    }
};

module.exports = {
    getCurrentDate,
    getDaysInCurrentMonth,
    createMomentDate,
    getDateDifference,
    convertTimeStampToHours,
};
