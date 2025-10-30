const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("./models/User");
const Event = require("./models/Event");

dotenv.config();

const sampleUsers = [
  {
    name: "Demo User",
    email: "demo@smartbuddy.com",
    password: "Demo123!", // Meets requirements: 8+ chars, uppercase, lowercase, number, special char
    skills: ["JavaScript", "React", "Node.js", "Python"],
    interests: ["AI", "ML", "Web Development", "Data Science"],
    branch: "CSE",
    year: 1,
    availability: ["Morning", "Evening", "Weekends"],
    about: "Hi! I'm a passionate full-stack developer with a love for AI and machine learning. Always excited to collaborate on interesting projects and learn new technologies. Let's build something amazing together!",
    xp: 50,
  },
  {
    name: "Aryan Sharma",
    email: "bt24cece121@iiitn.ac.in",
    password: "Aryan123!", // Meets requirements
    skills: ["Python", "Machine Learning", "TensorFlow"],
    interests: ["AI", "ML", "Deep Learning"],
    branch: "ECE",
    year: 2,
    availability: ["Evening", "Night", "Flexible"],
    about: "ECE student passionate about artificial intelligence and machine learning. I enjoy working on deep learning projects and exploring neural networks. Looking forward to collaborating on ML research!",
    xp: 75,
  },
  {
    name: "Priya Patel",
    email: "bt23cse011@iiitn.ac.in",
    password: "Priya123!", // Meets requirements
    skills: ["React", "Vue.js", "UI/UX Design"],
    interests: ["Web Development", "Design", "Frontend"],
    branch: "CSE",
    year: 3,
    availability: ["Morning", "Evening", "Weekends"],
    about: "Frontend developer and UI/UX enthusiast! I love creating beautiful, user-friendly interfaces. Experienced with React and Vue.js. Always happy to help with design and frontend development challenges.",
    xp: 60,
  },
  {
    name: "Rohit Kumar",
    email: "bt24cse041@iiitn.ac.in",
    password: "Rohit123!", // Meets requirements
    skills: ["MongoDB", "Express", "Node.js", "JavaScript"],
    interests: ["Backend", "API Development", "Databases"],
    branch: "CSE",
    year: 2,
    availability: ["Morning", "Evening", "Weekends"],
    about: "Backend developer specialized in Node.js and MongoDB. I enjoy building scalable APIs and working with databases. Always eager to work on backend projects and share knowledge with fellow developers.",
    xp: 45,
  },
  {
    name: "Sneha Reddy",
    email: "bt24csd042@iiitn.ac.in",
    password: "Sneha123!", // Meets requirements
    skills: ["Java", "Spring Boot", "Hibernate"],
    interests: ["Software Engineering", "Spring", "Backend"],
    branch: "CSD",
    year: 2,
    availability: ["Morning", "Weekends", "Flexible"],
    about: "Java developer with expertise in Spring Boot and enterprise application development. Passionate about software engineering best practices and clean code. Let's build robust applications together!",
    xp: 55,
  },
];

const sampleEvents = [
  {
    title: "AI & Machine Learning Workshop",
    date: "2025-11-5",
    time: "2:00 PM",
    location: "Hall A",
    tags: ["AI", "ML", "Workshop"],
    description: "Learn the fundamentals of AI and ML with hands-on projects.",
  },
  {
    title: "React Development Bootcamp",
    date: "2025-11-8",
    time: "10:00 AM",
    location: "Lab 3",
    tags: ["React", "Web Development", "Frontend"],
    description: "Master React fundamentals and build modern web applications.",
  },
  {
    title: "Data Science Meetup",
    date: "2025-11-10",
    time: "4:00 PM",
    location: "Hall B",
    tags: ["Data Science", "Python", "Analytics"],
    description: "Network with fellow data enthusiasts and share insights.",
  },
  {
    title: "Node.js API Development",
    date: "2025-11-17",
    time: "3:00 PM",
    location: "Lab 1",
    tags: ["Node.js", "Backend", "API Development"],
    description: "Build robust REST APIs using Node.js and Express.",
  },
  {
    title: "Full Stack Development Challenge",
    date: "2025-11-14",
    time: "9:00 AM",
    location: "Hall C",
    tags: ["Full Stack", "Development", "Challenge"],
    description:
      "Test your skills in our annual full-stack development competition.",
  },
  {
    title: "UI/UX Design Workshop",
    date: "2025-11-27",
    time: "2:00 PM",
    location: "Design Lab",
    tags: ["Design", "UI/UX", "Creative"],
    description:
      "Learn design principles and create beautiful user interfaces.",
  },
];

async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ Connected to MongoDB");

    // Drop the enrollmentNo index if it exists (from old schema)
    try {
      await User.collection.dropIndex("enrollmentNo_1");
      console.log("✅ Dropped enrollmentNo index");
    } catch (error) {
      // Index doesn't exist or already dropped - this is fine
      if (error.code !== 27 && error.code !== 85) {
        // 27 = IndexNotFound, 85 = NamespaceNotFound
        console.log("ℹ️  No enrollmentNo index to drop (or already dropped)");
      }
    }

    // Clear existing data
    await User.deleteMany({});
    await Event.deleteMany({});
    console.log("✅ Cleared existing data");

    // Insert users (passwords will be hashed by pre-save hook)
    // Note: We need to create users individually to trigger the pre-save hook
    const createdUsers = [];
    for (const userData of sampleUsers) {
      const user = new User(userData);
      await user.save(); // This will trigger the password hashing pre-save hook
      createdUsers.push(user);
    }
    console.log(`✅ Inserted ${createdUsers.length} users`);

    // Insert events
    const events = await Event.insertMany(sampleEvents);
    console.log(`✅ Inserted ${events.length} events`);

    console.log("🎉 Database seeding completed!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding error:", error);
    process.exit(1);
  }
}

seedDatabase();
