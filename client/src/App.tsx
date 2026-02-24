import { Route, Router, Switch } from "wouter";
import { AuthProvider } from "./lib/auth";
import Home from "./pages/Home";
import Models from "./pages/Models";
import ModelDetail from "./pages/ModelDetail";
import GenerationDetail from "./pages/GenerationDetail";
import VariantDetail from "./pages/VariantDetail";
import Compare from "./pages/Compare";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Admin from "./pages/Admin";
import Contact from "./pages/Contact";
import About from "./pages/About";
import SubmitCar from "./pages/SubmitCar";
import NotFound from "./pages/NotFound";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col bg-slate-950 text-white">
        <Navbar />
        <main className="flex-1">
          <Router>
            <ScrollToTop />
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
          </Router>
        </main>
        <Footer />
      </div>
    </AuthProvider>
  );
}

export default App;
