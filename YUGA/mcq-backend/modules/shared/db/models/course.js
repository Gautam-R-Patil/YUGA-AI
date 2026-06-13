import mongoose from "mongoose";

const lessonSchema = new mongoose.Schema({
    id: { type: String, required: true },
    title: { type: String, required: true },
    content: { type: String },
    type: { type: String, enum: ["video", "reading", "interactive", "quiz"], default: "reading" },
    duration: { type: String },
    completed: { type: Boolean, default: false },
    videoUrl: { type: String },
    transcript: { type: String },
    resources: [{ type: String }],
    dateAdded: { type: String },
    thumbnailUrl: { type: String },
    images: [{
        url: { type: String },
        alt: { type: String }
    }],
    isAIGenerated: { type: Boolean, default: false },
    originalChapter: { type: String },
    originalSubject: { type: String },
    originalClass: { type: String }
});

const chapterSchema = new mongoose.Schema({
    title: { type: String, required: true }
});

const courseSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String },
    category: { type: String, required: true },
    duration: { type: String },
    lessons: [lessonSchema],
    level: { type: String, enum: ["Beginner", "Intermediate", "Advanced"], default: "Beginner" },
    progress: { type: Number, default: 0 },
    color: { type: String },
    chapters: [chapterSchema],
    instructor: { type: String },
    rating: { type: Number, default: 0 },
    students: { type: Number, default: 0 },
    tags: [{ type: String }],
    notesCount: { type: Number, default: 0 }
}, { timestamps: true });

const Course = mongoose.model("Course", courseSchema);

export default Course;
