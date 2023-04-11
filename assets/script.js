$(function() {
    $('[data-toggle="tooltip"]').tooltip()
});
const STARTING_DATE = new Date("2023/03/07"),
    ENDING_DATE = new Date("2023/04/24"),
    INITIAL_TIER = 2,
    LAST_TIER = 50,
    EPILOGUE_TIERS = 5,
    EPILOGUE_TIER_XP = 36500,
    INITIAL_XP_TO_GO = 2e3,
    XP_INCREASE_PER_TIER = 750,
    DAILY_CHALLENGE_XP = 2e3,
    WeeklyChallengeXP = {
        Start: 30240,
        Finish: 60750
    },
    AverageGainedXP = {
        Normal: {
            Match: 3985.71,
            Hour: 6473.74
        },
        SpikeRush: {
            Match: 1e3,
            Hour: 8046.69
        },
        DeathMatch: {
            Match: 900,
            Hour: 7200
        }
    },
    TOTAL_TIERS = LAST_TIER + 5,
    app = new Vue({
        el: "#app",
        data: {
            currentTier: 2,
            tierToAchieve: LAST_TIER + 5,
            xpToGo: 2e3,
            lastTier: LAST_TIER,
            epilogueTiers: 5,
            startingDate: toDateString(new Date),
            endingDateInclusive: toDateString(ENDING_DATE),
            endingDateExclusive: toDateString(getYesterday(ENDING_DATE)),
            fromDate: toDateString(new Date),
            toDate: toDateString(getYesterday(ENDING_DATE)),
            premiumBoostEnabled: !0,
            premiumBoost: .03,
            gamePassBoostEnabled: !1,
            gamePassBoost: .2,
            dailyChallenges: !0,
            weeklyChallenges: !0,
            currentDayCompleted: !1,
            countFromWeek: 1,
            totalWeeks: Math.ceil((getYesterday(ENDING_DATE).getTime() - STARTING_DATE.getTime()) / 6048e5),
            remainingDays: 0,
            totalXP: 0,
            currentXP: 0,
            challengesXP: 0,
            neededXP: 0,
            remainingTiersString: "0",
            progress: 0,
            desirableProgress: 0,
            challengesProgress: 0,
            normalMatches: 0,
            rushMatches: 0,
            deathMatches: 0,
            normalHours: 0,
            rushHours: 0,
            deathHours: 0,
            normalDailyGames: 0,
            rushDailyGames: 0,
            deathDailyGames: 0,
            normalDailyHours: 0,
            rushDailyHours: 0,
            deathDailyHours: 0,
            changesSinceLastCalculate: !0
        },
        computed: {
            remainingDaysR: function() {
                return Math.ceil((getNextDay(this.toDate, 2).getTime() - new Date(this.fromDate).getTime()) / 864e5) - 1
            },
            currentWeekR: function() {
                return this.totalWeeks - Math.ceil(this.remainingDaysR / 7) + 1
            },
            triggerChanges() {
                return `${this.currentTier}${this.tierToAchieve}${this.xpToGo}${this.fromDate}${this.toDate}
              ${this.premiumBoostEnabled}${this.gamePassBoostEnabled}${this.dailyChallenges}${this.weeklyChallenges}
              ${this.currentDayCompleted}${this.countFromWeek}`
            }
        },
        watch: {
            triggerChanges() {
                this.changesSinceLastCalculate = !0
            }
        },
        methods: {
            isOnMobile: () => isOnMobile()
        },
        mounted() {
            setAds(), this.$el.style.display = "block"
        }
    });

function calculate() {
    $("#results").addClass("animate"), setScrollOnResults(), app.remainingDays = app.remainingDaysR, app.currentTier = Number(app.currentTier), app.tierToAchieve = Number(app.tierToAchieve), app.xpToGo = Number(app.xpToGo), app.currentTier < 2 ? app.currentTier = 2 : app.currentTier > TOTAL_TIERS && (app.currentTier = TOTAL_TIERS), app.tierToAchieve < app.currentTier ? app.tierToAchieve = app.currentTier : app.tierToAchieve > TOTAL_TIERS && (app.tierToAchieve = TOTAL_TIERS), app.xpToGo < 0 ? app.xpToGo = 0 : app.xpToGo > tierXP(app.currentTier) && (app.xpToGo = tierXP(app.currentTier)), new Date(app.fromDate) < new Date ? app.fromDate = toDateString(new Date) : new Date(app.fromDate) >= ENDING_DATE && (app.fromDate = app.endingDate), app.totalXP = totalXP(app.tierToAchieve), app.currentXP = totalXP(app.currentTier) - app.xpToGo, app.neededXP = app.totalXP - app.currentXP;
    let e = app.currentTier <= LAST_TIER ? (app.tierToAchieve > LAST_TIER ? LAST_TIER : app.tierToAchieve) - app.currentTier : 0,
        a = app.tierToAchieve > LAST_TIER ? app.tierToAchieve - (app.currentTier > LAST_TIER ? app.currentTier : LAST_TIER) : 0;
    app.currentTier <= LAST_TIER ? e += 0 != app.xpToGo ? 1 : 0 : a += 0 != app.xpToGo ? 1 : 0, app.remainingTiersString = `${e} + ${a}`, app.progress = app.currentXP / app.totalXP;
    let t = getDaysDifference(STARTING_DATE, new Date(app.toDate)),
        r = app.totalXP / t;
    if (app.desirableProgress = (t - app.remainingDays + 1) * r / app.totalXP, app.challengesXP = 0, app.dailyChallenges) {
        let p = app.remainingDays - (app.currentDayCompleted ? 1 : 0);
        p < 0 && (p = 0);
        let n = 2e3 * p * 2;
        app.challengesXP += n, app.neededXP -= n
    }
    if (app.weeklyChallenges) {
        app.countFromWeek = Number(app.countFromWeek);
        let o = (WeeklyChallengeXP.Finish - WeeklyChallengeXP.Start) / app.totalWeeks;
        app.countFromWeek < 1 ? app.countFromWeek = 1 : app.countFromWeek > app.totalWeeks && (app.countFromWeek = app.totalWeeks);
        let i = app.countFromWeek,
            s = 0;
        for (let l = i; l <= app.totalWeeks; l++) s += o * l + WeeklyChallengeXP.Start;
        app.challengesXP += s, app.neededXP -= s
    }
    app.challengesProgress = app.challengesXP / app.totalXP, app.challengesProgress + app.progress > 1 && (app.challengesProgress = 1 - app.progress), app.neededXP < 0 && (app.neededXP = 0), app.normalMatches = Math.ceil(app.neededXP / addXpBoost(AverageGainedXP.Normal.Match)), app.normalHours = app.neededXP / addXpBoost(AverageGainedXP.Normal.Hour), app.normalDailyGames = app.normalMatches / app.remainingDays, app.normalDailyHours = app.normalHours / app.remainingDays, app.rushMatches = Math.ceil(app.neededXP / addXpBoost(AverageGainedXP.SpikeRush.Match)), app.rushHours = app.neededXP / addXpBoost(AverageGainedXP.SpikeRush.Hour), app.rushDailyGames = app.rushMatches / app.remainingDays, app.rushDailyHours = app.rushHours / app.remainingDays, app.deathMatches = Math.ceil(app.neededXP / addXpBoost(AverageGainedXP.DeathMatch.Match)), app.deathHours = app.neededXP / addXpBoost(AverageGainedXP.DeathMatch.Hour), app.deathDailyGames = app.deathMatches / app.remainingDays, app.deathDailyHours = app.deathHours / app.remainingDays, app.changesSinceLastCalculate = !1
}

function addXpBoost(e) {
    return e * (1 + app.premiumBoostEnabled * app.premiumBoost + app.gamePassBoostEnabled * app.gamePassBoost)
}

function setMaxXP() {
    app.xpToGo = tierXP(Number(app.currentTier))
}

function getYesterday(e) {
    let a = new Date(e);
    return a.setDate(a.getDate() - 1), a
}

function getNextDay(e, a = 1) {
    let t = new Date(e);
    return t.setDate(t.getDate() + a), t
}

function getDaysDifference(e, a) {
    return Math.ceil((getNextDay(a).getTime() - e.getTime()) / 864e5) - 1
}

function toDateString(e) {
    let a = e.getMonth() + 1,
        t = e.getDate(),
        r;
    return a < 10 && (a = "0" + a), t < 10 && (t = "0" + t), [e.getFullYear(), a, t].join("-")
}

function toCommas(e) {
    return e.toLocaleString()
}

function toNumber(e) {
    return Number(e.replace(/,/g, ""))
}

function totalXP(e) {
    let a = 0;
    e > LAST_TIER && (a = e - LAST_TIER, e = LAST_TIER);
    let t = e - 2 + 1;
    return e < 2 || a > 5 ? 0 : t * (2e3 + 750 * (t - 1) / 2) + 36500 * a
}

function tierXP(e) {
    return e > LAST_TIER ? (e -= LAST_TIER) > 5 ? 0 : 36500 : e < 2 ? 0 : 2e3 + 750 * (e - 2)
}

function isOnMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}

function setScrollOnResults() {
    let e = document.getElementById("results").offsetTop;
    $("html, body").animate({
        scrollTop: "" + e
    }, 500)
}

function setAds() {
    for (let e of document.getElementsByTagName("money-machine")) switch (e.getAttribute("type")) {
        case "small-horizontal-banner":
            e.innerHTML = '<iframe src="//www.displaycontentnetwork.com/watchnew?key=a12b6e2069d448a15c1b5fca0fc7849e" width="320" height="50" frameborder="0" scrolling="no"></iframe>';
            break;
        case "medium-horizontal-banner":
            e.innerHTML = '<iframe src="//www.displaycontentnetwork.com/watchnew?key=3104f79eccef5f7ddf4622b8403606bc" width="468" height="60" frameborder="0" scrolling="no"></iframe>';
            break;
        case "big-horizontal-banner":
            e.innerHTML = '<iframe src="//www.displaycontentnetwork.com/watchnew?key=f02dbbe91d1ac4516c8722b84b843e56" width="728" height="90" frameborder="0" scrolling="no"></iframe>';
            break;
        case "big-square-banner":
            e.innerHTML = '<iframe src="//www.displaycontentnetwork.com/watchnew?key=31131e4b26f2ab56d760c351f02ad98c" width="300" height="250" frameborder="0" scrolling="no"></iframe>'
    }
}
app.countFromWeek = app.currentWeekR;
