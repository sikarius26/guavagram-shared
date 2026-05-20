
export enum GamificationActionTypeEnum {
    // Transaccionales
    PlaceOrder = 8,
    PlaceBooking = 9,
    AttendBooking = 16,               // no-show penalizado, asistir premia
    PremiumTicket = 17,                // menu degustacion / ticket alto

    // Reputacion
    Review = 1,
    ReviewWithPhoto = 2,
    ReviewWithVideo = 18,
    FirstReviewOnStore = 3,
    HighRatingReview = 19,             // 4-5 estrellas
    HelpfulReviewVote = 20,

    // Referral / red
    ShareStore = 10,
    AddFriend = 5,
    InviteFriendRegistered = 6,
    InviteFriendFirstOrder = 7,
    UseCreatorCode = 21,               // usar codigo de descuento de creator

    // Contenido generado
    UploadDishPhoto = 22,
    TagStoreExternalSocial = 23,       // story/reel en IG/TikTok
    FeaturedPhoto = 24,                // foto seleccionada por el restaurante

    // Engagement pasivo
    FollowStore = 4,
    EnableNotifications = 25,
    FavoriteStore = 12,
    ProfileVisit = 26,                  // 1a del mes
    CompleteProfile = 11,

    // Fidelidad / streaks
    SecondVisit = 27,
    FifthVisit = 28,
    TenthVisit = 29,
    BirthdayVisit = 30,
    DailyCheckIn = 13,
    WeekStreak = 14,
    MonthStreak = 15,

    // Eventos / challenges
    CompleteSponsoredChallenge = 31,
    AttendSpecialEvent = 32,
    FirstTimeAtStore = 33,
}
