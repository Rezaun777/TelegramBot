import mongoose, { Schema, Document } from 'mongoose';

export interface ITemplate extends Document {
  keyword: string;
  response: string;
  createdAt: Date;
  updatedAt: Date;
}

const TemplateSchema: Schema = new Schema(
  {
    keyword: {
      type: String,
      required: true,
      trim: true,
    },
    response: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure unique keywords
TemplateSchema.index({ keyword: 1 }, { unique: true });

export default mongoose.models.Template || mongoose.model<ITemplate>('Template', TemplateSchema);