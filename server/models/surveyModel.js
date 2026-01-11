const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const questionSchema = new Schema({
  id: { type: String, required: true },
  type: { 
    type: String, 
    required: true,
    enum: ['text', 'textarea', 'radio', 'checkbox', 'dropdown', 'date', 'number', 'email', 'phone', 'rating', 'scale', 'file']
  },
  question: { type: String, required: true },
  description: { type: String },
  required: { type: Boolean, default: false },
  options: [{ type: String }],
  settings: {
    minValue: { type: Number },
    maxValue: { type: Number },
    minLength: { type: Number },
    maxLength: { type: Number },
    multipleFiles: { type: Boolean },
    allowedFileTypes: [{ type: String }],
    maxFileSize: { type: Number },
    placeholder: { type: String },
    scaleLabels: {
      min: { type: String },
      max: { type: String }
    },
    rows: { type: Number }
  },
  order: { type: Number, required: true }
}, { _id: false });

const surveySchema = new Schema({
  title: { type: String, required: true },
  description: { type: String },
  createdBy: { type: Schema.Types.ObjectId, ref: 'account', required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  
  access: {
    type: { 
      type: String, 
      required: true,
      enum: ['open', 'closed'], // open - для всех, closed - только для зарегистрированных
      default: 'open'
    },
    allowMultipleResponses: { type: Boolean, default: false },
  },
  
  settings: {
    showProgressBar: { type: Boolean, default: true },
    randomizeQuestions: { type: Boolean, default: false },
    showResultsAfterSubmit: { type: Boolean, default: false },
    collectEmail: { type: Boolean, default: false },
    submitButtonText: { type: String, default: 'Отправить' },
    successMessage: { type: String, default: 'Спасибо! Ваш ответ записан.' },
    startDate: { type: Date }, // Дата начала приема ответов
    endDate: { type: Date }, // Дата окончания
  },
  
  questions: [questionSchema],
  
  status: { 
    type: String, 
    enum: ['draft', 'published', 'closed'],
    default: 'draft'
  },
  
  stats: {
    totalResponses: { type: Number, default: 0 },
    lastResponseAt: { type: Date }
  }
}, { 
  versionKey: false,
  timestamps: true 
});

surveySchema.index({ createdBy: 1, createdAt: -1 });
surveySchema.index({ status: 1 });

module.exports = mongoose.model("surveys", surveySchema);

