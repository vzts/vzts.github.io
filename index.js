(function () {
    var joinInput = $("#join-input");
    var typeSelect = $("#type-select");

    addDateFormatPrototype();

    $("#submit-button").on("click", function (e) {
        e.preventDefault();
        var input = joinInput.val();
        var join = new Date(input.substring(0, 4), input.substring(4, 6) - 1, input.substring(6, 8));
        var serviceMonth = Number(typeSelect.val());

        var etsDate = getEtsDate(join, serviceMonth);
        var shortenedEtsDate = getShortenedEtsDate(join, serviceMonth);
        var originalDays = countDays(join, etsDate);
        var shortenedDays = countShortenedDays(etsDate);
        var newDays = countDays(join, shortenedEtsDate);
        var leftDays = countDaysFromNow(shortenedEtsDate);
        var doneDays = countDays(join, new Date());
        var donePercent = Math.ceil(doneDays / newDays * 10000) / 100; // **.**

        $("#original-ets-date").text("기존 전역일: " + etsDate.yyyymmdd("-"));
        $("#shortened-ets-date").text("단축 이후 전역일: " + shortenedEtsDate.yyyymmdd("-"));
        $("#original-days").text("기존 복무 일수: " + originalDays + "일");
        $("#shortened-days").text("단축된 복무 일수: " + shortenedDays + "일");
        $("#new-days").text("단축 이후 복무 일수: " + newDays + "일");
        $("#left-days").text("남은 일수: " + leftDays + "일");
        $("#percentage-done").text("완료한 퍼센트: " + donePercent + "%");
    });

    function getShortenedEtsDate(join, serviceMonth) {
        var etsDate = getEtsDate(join, serviceMonth);
        var shortenedDays = countShortenedDays(etsDate);
        etsDate.setDate(etsDate.getDate() - shortenedDays);
        return etsDate;
    }

    function countShortenedDays(endDate) {
        // shorten 1 day for every 14 days from the effective date
        return Math.ceil(countDaysFromEffectiveDate(endDate) / 14);
    }

    function countDaysFromEffectiveDate(endDate) {
        var effectiveDate = new Date(2018, 6, 3); // from "2018-07-03"
        return countDays(effectiveDate, endDate);
    }

    function countDaysFromNow(endDate) {
        var now = new Date();
        now.setHours(0, 0, 0, 0);
        return countDays(now, endDate);
    }

    function countDays(startDate, endDate) {
        return Math.ceil((endDate - startDate) / (24 * 60 * 60 * 1000));
    }

    function getEtsDate(join, serviceMonth) {
        // clone the input param to prevent any side effect
        var temp = new Date(join.getFullYear(), join.getMonth(), join.getDate());

        // save the date
        // when the date of join is 1, the targetDate becomes 0
        var targetDate = temp.getDate() - 1;

        // setDate(1) prevents auto overflow onto month
        // when executing the next line
        temp.setDate(1);
        temp.setMonth(temp.getMonth() + serviceMonth);

        // set max date if the targetDate is greater than the day the month contains        
        var daysInMonth = getDaysInMonth(temp.getFullYear(), temp.getMonth());
        var actualDate = (daysInMonth < targetDate) ? daysInMonth : targetDate;
        temp.setDate(actualDate);

        return temp;
    }

    // month starts from 0
    function getDaysInMonth(year, month) {
        return new Date(year, month + 1, 0).getDate();
    }

    function addDateFormatPrototype() {
        Date.prototype.yyyymmdd = function (separator) {
            var mm = this.getMonth() + 1; // getMonth() is zero-based
            var dd = this.getDate();
            return [
                this.getFullYear(),
                (mm > 9 ? '' : '0') + mm,
                (dd > 9 ? '' : '0') + dd,
            ].join(separator);
        };
    }

    function test() {
        console.assert("2017-03-07" === getEtsDate(new Date(2015, 5, 8), 21).yyyymmdd("-"));
        console.assert("2013-11-27" === getEtsDate(new Date(2012, 1, 28), 21).yyyymmdd("-"));
        console.assert("2020-02-29" === getEtsDate(new Date(2018, 2, 1), 24).yyyymmdd("-"));
        console.assert("2018-12-31" === getEtsDate(new Date(2017, 0, 1), 24).yyyymmdd("-"));
        console.assert("2019-02-28" === getEtsDate(new Date(2017, 2, 31), 23).yyyymmdd("-"));
    }
})()