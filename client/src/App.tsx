import { lazy, Suspense } from "react";
import { Route, Router, Switch } from "wouter";
import { AuthProvider } from "./lib/auth";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";

// Lazy-load all route pages to reduce critical request chain
const Home = lazy(() => import("./pages/Home"));
const Models = lazy(() => import("./pages/Models"));
const ModelDetail = lazy(() => import("./pages/ModelDetail"));
const GenerationDetail = lazy(() => import("./pages/GenerationDetail"));
const VariantDetail = lazy(() => import("./pages/VariantDetail"));
const Compare = lazy(() => import("./pages/Compare"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Admin = lazy(() => import("./pages/Admin"));
const Contact = lazy(() => import("./pages/Contact"));
const About = lazy(() => import("./pages/About"));
const SubmitCar = lazy(() => import("./pages/SubmitCar"));
const NotFound = lazy(() => import("./pages/NotFound"));

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col bg-slate-950 text-white">
        <Navbar />
        <main className="flex-1">
          <Router>
            <ScrollToTop />
            <Suspense fallback={<PageLoader />}>
              <Switch>
              <Route path="/" component={Home} />
              <Route path="/automobili" component={Models} />
              {/* Dynamic routing: /brand/model/generation/variant */}
              <Route path="/automobili/:brandSlug/:modelSlug/:generationSlug/:variantSlug" component={VariantDetail} />
              <Route path="/automobili/:brandSlug/:modelSlug/:generationSlug" component={GenerationDetail} />
              <Route path="/automobili/:brandSlug/:modelSlug" component={ModelDetail} />
              <Route path="/automobili/:brandSlug" component={Models} />
              {/* Legacy routes (keep for backward compatibility) */}
              <Route path="/model/:id" component={ModelDetail} />
              <Route path="/generacija/:id" component={GenerationDetail} />
              <Route path="/varijanta/:id" component={VariantDetail} />
              <Route path="/usporedi" component={Compare} />
              <Route path="/blog" component={Blog} />
              <Route path="/blog/:id" component={BlogPost} />
              <Route path="/prijava" component={Login} />
              <Route path="/registracija" component={Register} />
              <Route path="/admin" component={Admin} />
              <Route path="/kontakt" component={Contact} />
              <Route path="/o-nama" component={About} />
              <Route path="/predlozi-auto" component={SubmitCar} />
              {/* Catch-all route for 404 */}
              <Route component={NotFound} />
            </Switch>
            </Suspense>
          </Router>
        </main>
        <Footer />
      </div>
    </AuthProvider>
  );
}

export default App;
