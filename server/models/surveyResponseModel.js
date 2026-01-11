const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const answerSchema = new Schema({
  questionId: { type: String, required: true },
  questionType: { type: String, required: true },
  answer: { type: Schema.Types.Mixed },
}, { _id: false });

const surveyResponseSchema = new Schema({
  surveyId: { type: Schema.Types.ObjectId, ref: 'surveys', required: true },
  
  respondent: {
    userId: { type: Schema.Types.ObjectId, ref: 'account' },
    email: { type: String },
    isAnonymous: { type: Boolean, default: false },
    ipAddress: { type: String },
    userAgent: { type: String }
  },
  
  answers: [answerSchema],
  
  submittedAt: { type: Date, default: Date.now },
  completionTime: { type: Number },
  
  isComplete: { type: Boolean, default: true },
  
}, { 
  versionKey: false,
  timestamps: true 
});

surveyResponseSchema.index({ surveyId: 1, submittedAt: -1 });
surveyResponseSchema.index({ 'respondent.userId': 1 });
surveyResponseSchema.index({ 'respondent.email': 1 });

module.exports = mongoose.model("survey_responses", surveyResponseSchema);

