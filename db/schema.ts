import { relations } from "drizzle-orm";
import { boolean, integer, json, pgEnum, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const classrooms = pgTable("classrooms", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  teacherId: text("teacher_id").notNull(),
  inviteCode: text("invite_code").notNull().unique(),
});

export const classroomsRelations = relations(classrooms, ({ many }) => ({
  members: many(classroomMembers),
  courses: many(courses),
}));

export const classroomMembers = pgTable("classroom_members", {
  id: serial("id").primaryKey(),
  classroomId: integer("classroom_id").references(() => classrooms.id, { onDelete: "cascade" }).notNull(),
  userId: text("user_id").notNull(),
});

export const classroomMembersRelations = relations(classroomMembers, ({ one }) => ({
  classroom: one(classrooms, {
    fields: [classroomMembers.classroomId],
    references: [classrooms.id],
  }),
}));

export const courses = pgTable("courses", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  imageSrc: text("image_src").notNull(),
  classroomId: integer("classroom_id").references(() => classrooms.id, { onDelete: "cascade" }), // Si es nulo, es público
});

export const coursesRelations = relations(courses, ({ many, one }) => ({
  userProgress: many(userProgress),
  units: many(units),
  classroom: one(classrooms, {
    fields: [courses.classroomId],
    references: [classrooms.id],
  }),
}));

export const units = pgTable("units", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(), // Unit 1
  description: text("description").notNull(), // Learn the basics of spanish
  courseId: integer("course_id").references(() => courses.id, { onDelete: "cascade" }).notNull(),
  order: integer("order").notNull(),
});

export const unitsRelations = relations(units, ({ many, one }) => ({
  course: one(courses, {
    fields: [units.courseId],
    references: [courses.id],
  }),
  lessons: many(lessons),
}));

export const lessons = pgTable("lessons", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  unitId: integer("unit_id").references(() => units.id, { onDelete: "cascade" }).notNull(),
  order: integer("order").notNull(),
  referenceText: text("reference_text"),
});

export const lessonsRelations = relations(lessons, ({ one, many }) => ({
  unit: one(units, {
    fields: [lessons.unitId],
    references: [units.id],
  }),
  challenges: many(challenges),
}));

export const challengesEnum = pgEnum("type", ["SELECT", "ASSIST"]);

export const challenges = pgTable("challenges", {
  id: serial("id").primaryKey(),
  lessonId: integer("lesson_id").references(() => lessons.id, { onDelete: "cascade" }).notNull(),
  type: challengesEnum("type").notNull(),
  question: text("question").notNull(),
  order: integer("order").notNull(),
});

export const challengesRelations = relations(challenges, ({ one, many }) => ({
  lesson: one(lessons, {
    fields: [challenges.lessonId],
    references: [lessons.id],
  }),
  challengeOptions: many(challengeOptions),
  challengeProgress: many(challengeProgress),
}));

export const challengeOptions = pgTable("challenge_options", {
  id: serial("id").primaryKey(),
  challengeId: integer("challenge_id").references(() => challenges.id, { onDelete: "cascade" }).notNull(),
  text: text("text").notNull(),
  correct: boolean("correct").notNull(),
  imageSrc: text("image_src"),
  audioSrc: text("audio_src"),
  explanation: text("explanation"),
});

export const challengeOptionsRelations = relations(challengeOptions, ({ one }) => ({
  challenge: one(challenges, {
    fields: [challengeOptions.challengeId],
    references: [challenges.id],
  }),
}));

export const challengeProgress = pgTable("challenge_progress", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  challengeId: integer("challenge_id").references(() => challenges.id, { onDelete: "cascade" }).notNull(),
  completed: boolean("completed").notNull().default(false),
});

export const challengeProgressRelations = relations(challengeProgress, ({ one }) => ({
  challenge: one(challenges, {
    fields: [challengeProgress.challengeId],
    references: [challenges.id],
  }),
}));

export const leagueEnum = pgEnum("league", ["BRONCE", "PLATA", "ORO", "DIAMANTE"]);

export const userProgress = pgTable("user_progress", {
  userId: text("user_id").primaryKey(),
  userName: text("user_name").notNull().default("User"),
  userImageSrc: text("user_image_src").notNull().default("/mascot.svg"),
  activeCourseId: integer("active_course_id").references(() => courses.id, { onDelete: "cascade" }),
  hearts: integer("hearts").notNull().default(5),
  points: integer("points").notNull().default(0),
  isTeacher: boolean("is_teacher").notNull().default(false),
  league: leagueEnum("league").notNull().default("BRONCE"),
  weeklyPoints: integer("weekly_points").notNull().default(0),
  activeBorder: text("active_border"),
  streakFreeze: boolean("streak_freeze").default(false).notNull(),
  xpBoosterEndsAt: timestamp("xp_booster_ends_at"),
  ownedBorders: text("owned_borders").array().default([]).notNull(),
  streak: integer("streak").notNull().default(0),
  lastActive: timestamp("last_active").defaultNow(),
  unlockedAchievements: text("unlocked_achievements").array().default([]).notNull(),
  factionId: integer("faction_id").references(() => factions.id, { onDelete: "set null" }),
  factionJoinedAt: timestamp("faction_joined_at"),
});

export const userProgressRelations = relations(userProgress, ({ one, many }) => ({
  activeCourse: one(courses, {
    fields: [userProgress.activeCourseId],
    references: [courses.id],
  }),
  teacherApplications: many(teacherApplications),
}));

export const applicationStatusEnum = pgEnum("application_status", ["PENDING", "APPROVED", "REJECTED"]);

export const teacherApplications = pgTable("teacher_applications", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  proofUrl: text("proof_url").notNull(),
  description: text("description"),
  status: applicationStatusEnum("status").notNull().default("PENDING"),
});

export const teacherApplicationsRelations = relations(teacherApplications, ({ one }) => ({
  user: one(userProgress, {
    fields: [teacherApplications.userId],
    references: [userProgress.userId],
  }),
}));

export const userSubscription = pgTable("user_subscription", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().unique(),
  stripeCustomerId: text("stripe_customer_id").notNull().unique(),
  stripeSubscriptionId: text("stripe_subscription_id").notNull().unique(),
  stripePriceId: text("stripe_price_id").notNull(),
  stripeCurrentPeriodEnd: timestamp("stripe_current_period_end").notNull(),
});

export const mistakeLogs = pgTable("mistake_logs", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  context: text("context").notNull(),
  questionText: text("question_text").notNull(),
  wrongAnswerText: text("wrong_answer_text").notNull(),
  correctAnswerText: text("correct_answer_text"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const factions = pgTable("factions", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description").notNull(),
  logoSrc: text("logo_src").notNull(),
  totalXp: integer("total_xp").notNull().default(0),
});

export const factionsRelations = relations(factions, ({ many }) => ({
  members: many(userProgress),
}));

export const chestTypeEnum = pgEnum("chest_type", ["COMUN", "RARO", "EPICO"]);

export const userChests = pgTable("user_chests", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  type: chestTypeEnum("type").notNull(),
  opened: boolean("opened").notNull().default(false),
  rewardType: text("reward_type"),
  rewardValue: text("reward_value"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const liveTournaments = pgTable("live_tournaments", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  startTime: timestamp("start_time").notNull(),
  toleranceMinutes: integer("tolerance_minutes").default(15).notNull(),
  roundDuration: integer("round_duration").default(180).notNull(),
  intermissionTime: integer("intermission_time").default(15).notNull(),
  status: text("status").default("PENDING").notNull(),
});

export const tournamentQuestions = pgTable("tournament_questions", {
  id: serial("id").primaryKey(),
  tournamentId: integer("tournament_id").references(() => liveTournaments.id, { onDelete: "cascade" }).notNull(),
  order: integer("order").notNull(),
  readingText: text("reading_text").notNull(),
  questionText: text("question_text").notNull(),
  options: text("options").array().notNull(),
  correctIndex: integer("correct_index").notNull(),
  basePoints: integer("base_points").default(100).notNull(),
});

export const tournamentParticipants = pgTable("tournament_participants", {
  id: serial("id").primaryKey(),
  tournamentId: integer("tournament_id").references(() => liveTournaments.id, { onDelete: "cascade" }).notNull(),
  userId: text("user_id").notNull(),
  factionId: integer("faction_id").notNull(),
  score: integer("score").default(0).notNull(),
  answers: json("answers"),
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
});
