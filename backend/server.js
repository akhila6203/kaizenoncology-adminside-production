const path = require("path");
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

require("dotenv").config();


const authMiddleware = require('./middleware/auth.middleware');
const errorMiddleware = require('./middleware/error.middleware');
const customerAuthRoutes =
  require("./routes/customerAuth.routes");

const authRoutes = require('./routes/auth.routes');
const hospitalRoutes = require('./routes/hospital.routes');
const specialityRoutes = require('./routes/speciality.routes');
const serviceRoutes = require('./routes/service.routes');
const serviceContentRoutes = require('./routes/serviceContent.routes'); // NEW
const doctorRoutes = require('./routes/doctor.routes');
const healthLibraryRoutes = require('./routes/healthLibrary.routes');
const storyRoutes = require('./routes/story.routes');
const blogRoutes = require('./routes/blog.routes');
const blogController = require('./controllers/blog.controller');
// const editorialRoutes = require('./routes/editorial.routes');
const faqRoutes = require('./routes/faq.routes');
const dashboardRoutes = require('./routes/dashboard.routes');

const homeSliderRoutes = require("./routes/homeSlider.routes");
const patientCareRoutes = require("./routes/patientCare.routes");
const sc = require('./controllers/serviceContent.controller');

const app = express();


const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",
  "http://127.0.0.1:5175",
  "https://kaizenoncology.easybizcart.com",
  "https://www.kaizenoncology.easybizcart.com",
  "https://kaizenoncology-admin.easybizcart.com",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests without an Origin header, such as server-to-server requests.
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(
        new Error(`CORS blocked for origin: ${origin}`)
      );
    },
    credentials: true,
    methods: [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "OPTIONS",
    ],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
    ],
  })
);

// Cookie parser MUST run before customer-auth and patient-care routes.
app.use(cookieParser());

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Hospital admin API is running' });
});

app.use('/api/auth', authRoutes);
app.use(
  "/api/customer-auth",
  customerAuthRoutes
);

app.use('/api/doctors', doctorRoutes);
app.use('/api/specialities', specialityRoutes);
app.use('/api/our-stories', storyRoutes);
app.get(
  '/api/public/our-stories',
  require('./controllers/story.controller').list
);
app.get('/api/public/partners', require('./controllers/partners.controller').list);
// app.get('/api/public/editorial/:kind', (req,res,next) => { req.query.public='1'; require('./controllers/editorial.controller').list(req,res,next); });
// app.get('/api/public/editorial/:kind/:id', (req,res,next) => { req.query.public='1'; require('./controllers/editorial.controller').getOne(req,res,next); });
app.get('/api/public/settings', require('./controllers/settings.controller').get);
// PUBLIC HOME SLIDER
app.get(
  "/api/home-sliders/public",
  require("./controllers/homeSlider.controller").getPublic
);

app.get('/api/public/technologies/:slug/details',
  require('./controllers/technologyDetails.controller').getPublicBySlug);
// PUBLIC TECHNOLOGY LIST - No authentication required
app.get(
  '/api/technology-details/public',
  require('./controllers/technologyDetails.controller').listPublic
);


app.use('/api/faqs', faqRoutes);

app.use('/api/health-library', healthLibraryRoutes);

app.use('/api/partners', require('./routes/partners.routes'));
app.use("/api/patient-care", patientCareRoutes);

// PUBLIC BLOG ROUTES - No authentication required
app.get('/api/public/blogs', blogController.publicList);
app.get('/api/public/blogs/:slug', blogController.publicGetOne);


// PUBLIC SERVICES - No authentication required (used by the website)
app.get('/api/public/services', sc.publicServices);
app.get('/api/public/services/:service', sc.publicService);
app.get('/api/public/services/:service/pages', sc.publicPages);
app.get('/api/public/services/:service/pages/:page', sc.publicPage);


// ---------- everything below requires login ----------
app.use('/api', authMiddleware);

app.use('/api/service-content', serviceContentRoutes);   // NEW: admin services + upload

app.use('/api/hospitals', hospitalRoutes);
app.use("/api/home-sliders", homeSliderRoutes);
app.use('/api/settings', require('./routes/settings.routes'));
app.use('/api/specialities', specialityRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/health-library', healthLibraryRoutes);
app.use('/api/our-stories', storyRoutes);
app.use('/api/technology-details', require('./routes/technologyDetails.routes'));

app.use('/api/blogs', blogRoutes);
app.use('/api/editorial/blogs', blogRoutes);
// app.use('/api/editorial', editorialRoutes);

app.use('/api/faqs', faqRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

app.use(errorMiddleware);

const initDatabase = require('./config/initDb');

const PORT = process.env.PORT || 5000;

initDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Hospital admin API listening on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to initialize database:', err.message);
    process.exit(1);
  });


// const path = require("path");
// const express = require("express");
// const cors = require("cors");
// const cookieParser = require("cookie-parser");

// require("dotenv").config();


// const authMiddleware = require('./middleware/auth.middleware');
// const errorMiddleware = require('./middleware/error.middleware');
// const customerAuthRoutes =
//   require("./routes/customerAuth.routes");

// const authRoutes = require('./routes/auth.routes');
// const hospitalRoutes = require('./routes/hospital.routes');
// const specialityRoutes = require('./routes/speciality.routes');
// const serviceRoutes = require('./routes/service.routes');
// const doctorRoutes = require('./routes/doctor.routes');
// const healthLibraryRoutes = require('./routes/healthLibrary.routes');
// const storyRoutes = require('./routes/story.routes');
// const blogRoutes = require('./routes/blog.routes');
// const blogController = require('./controllers/blog.controller');
// // const editorialRoutes = require('./routes/editorial.routes');
// const faqRoutes = require('./routes/faq.routes');
// const dashboardRoutes = require('./routes/dashboard.routes');

// const homeSliderRoutes = require("./routes/homeSlider.routes");
// const patientCareRoutes = require("./routes/patientCare.routes");
// const sc = require('./controllers/serviceContent.controller');

// const app = express();

 
// const allowedOrigins = [
//   "http://localhost:5173",
//   "http://localhost:5174",
//   "http://localhost:5175",
//   "http://127.0.0.1:5173",
//   "http://127.0.0.1:5174",
//   "http://127.0.0.1:5175",
//   "https://kaizenoncology.easybizcart.com",
//   "https://www.kaizenoncology.easybizcart.com",
//   "https://kaizenoncology-admin.easybizcart.com",
// ];

// app.use(
//   cors({
//     origin: function (origin, callback) {
//       // Allow requests without an Origin header, such as server-to-server requests.
//       if (!origin || allowedOrigins.includes(origin)) {
//         return callback(null, true);
//       }

//       return callback(
//         new Error(`CORS blocked for origin: ${origin}`)
//       );
//     },
//     credentials: true,
//     methods: [
//       "GET",
//       "POST",
//       "PUT",
//       "PATCH",
//       "DELETE",
//       "OPTIONS",
//     ],
//     allowedHeaders: [
//       "Content-Type",
//       "Authorization",
//     ],
//   })
// );

// // Cookie parser MUST run before customer-auth and patient-care routes.
// app.use(cookieParser());

// app.use(express.json({ limit: "10mb" }));
// app.use(express.urlencoded({ extended: true }));

// app.use(express.json({ limit: '10mb' }));
// app.use(express.urlencoded({ extended: true }));
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// app.get('/api/health', (req, res) => {
//   res.json({ success: true, message: 'Hospital admin API is running' });
// });

// app.use('/api/auth', authRoutes);
// app.use(
//   "/api/customer-auth",
//   customerAuthRoutes
// );

// app.use('/api/doctors', doctorRoutes);
// app.use('/api/specialities', specialityRoutes);
//  app.use('/api/our-stories', storyRoutes);
// app.get(
//   '/api/public/our-stories',
//   require('./controllers/story.controller').list
// );
// app.get('/api/public/partners', require('./controllers/partners.controller').list);
// // app.get('/api/public/editorial/:kind', (req,res,next) => { req.query.public='1'; require('./controllers/editorial.controller').list(req,res,next); });
// // app.get('/api/public/editorial/:kind/:id', (req,res,next) => { req.query.public='1'; require('./controllers/editorial.controller').getOne(req,res,next); });
// app.get('/api/public/settings', require('./controllers/settings.controller').get);
// // PUBLIC HOME SLIDER
// app.get(
//   "/api/home-sliders/public",
//   require("./controllers/homeSlider.controller").getPublic
// );

// app.get('/api/public/technologies/:slug/details',
//   require('./controllers/technologyDetails.controller').getPublicBySlug);
//   // PUBLIC TECHNOLOGY LIST - No authentication required
// app.get(
//   '/api/technology-details/public',
//   require('./controllers/technologyDetails.controller').listPublic
// );


// app.use('/api/faqs', faqRoutes);

// app.use('/api/health-library', healthLibraryRoutes);

// //  app.use(
// //   "/api/patient-care",
// //    require("./routes/patientCare.routes")
// //  );

//  app.use('/api/partners', require('./routes/partners.routes'));
//  app.use("/api/patient-care", patientCareRoutes);

//  // PUBLIC BLOG ROUTES - No authentication required
// app.get('/api/public/blogs', blogController.publicList);
// app.get('/api/public/blogs/:slug', blogController.publicGetOne);


// app.get('/api/public/services', sc.publicServices);
// app.get('/api/public/services/:service', sc.publicService);
// app.get('/api/public/services/:service/pages', sc.publicPages);
// app.get('/api/public/services/:service/pages/:page', sc.publicPage);


// app.use('/api', authMiddleware);
// app.use('/api/hospitals', hospitalRoutes);
// // app.use('/api/partners', require('./routes/partners.routes'));
// app.use("/api/home-sliders", homeSliderRoutes);
// app.use('/api/settings', require('./routes/settings.routes'));
//  app.use('/api/specialities', specialityRoutes);
//  app.use('/api/services', serviceRoutes);
// // app.use('/api/services', serviceRoutes);
//  app.use('/api/doctors', doctorRoutes);
//  app.use('/api/health-library', healthLibraryRoutes);
// app.use('/api/our-stories', storyRoutes);
// app.use('/api/technology-details', require('./routes/technologyDetails.routes'));

// app.use('/api/blogs', blogRoutes);
// app.use('/api/editorial/blogs', blogRoutes);
// // app.use('/api/editorial', editorialRoutes);

//  app.use('/api/faqs', faqRoutes);
// app.use('/api/dashboard', dashboardRoutes);

// app.use((req, res) => {
//   res.status(404).json({ success: false, message: 'Route not found' });
// });

// app.use(errorMiddleware);

// const initDatabase = require('./config/initDb');

// const PORT = process.env.PORT || 5000;

// initDatabase()
//   .then(() => {
//     app.listen(PORT, () => {
//       console.log(`Hospital admin API listening on http://localhost:${PORT}`);
//     });
//   })

//   .catch((err) => {
//     console.error('Failed to initialize database:', err.message);
//     process.exit(1);
//   });
